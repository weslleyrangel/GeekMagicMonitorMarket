/**
 * server.js
 * Servidor Web e Painel de Controle Local para o GeekMagic Market Monitor
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { getAssetQuote, normalizeCryptoSymbol } = require('./market_service');
const { renderAssetScreen } = require('./renderer');
const { uploadImageToClock, cleanClockSlots, restoreNormalClockMode, testClockConnection, restartClock } = require('./uploader');

const app = express();
const PORT = 3333;
const CONFIG_FILE = path.join(__dirname, 'config.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Estado em memória
let config = loadConfig();
let isRunning = false;
let currentAssetIndex = 0;
let loopTimeout = null;
let latestPreviewBuffer = null;
let lastStatus = {
  lastUpdate: null,
  lastError: null,
  currentAsset: null
};

function loadConfig() {
  try {
    const raw = fs.readFileSync(CONFIG_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed.layout) parsed.layout = 'fintech';
    return parsed;
  } catch (err) {
    console.error('Erro ao ler config.json, usando padrão:', err.message);
    return {
      clock_ip: '192.168.1.2',
      rotation_interval_seconds: 10,
      theme_restore: 0,
      layout: 'fintech',
      assets: []
    };
  }
}

function saveConfig(newConfig) {
  config = newConfig;
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
}

// Renderiza e envia um ativo imediatamente
async function pushAssetFrame(asset, index) {
  const nextIndex = (index + 1) % config.assets.length;
  const nextAsset = config.assets[nextIndex];

  const quote = await getAssetQuote(asset);
  if (!quote.success) {
    throw new Error(`Falha ao obter cotação de ${asset.name}: ${quote.error}`);
  }

  const meta = {
    index,
    total: config.assets.length,
    nextName: nextAsset ? nextAsset.symbol.replace('.SA', '').replace('USDT', '') : ''
  };

  const imgBuffer = renderAssetScreen(asset, quote, meta, config.layout || 'fintech');
  latestPreviewBuffer = imgBuffer;
  lastStatus.lastUpdate = new Date().toISOString();
  lastStatus.currentAsset = asset;
  lastStatus.lastError = null;

  const uploadResult = await uploadImageToClock(config.clock_ip, imgBuffer);
  if (!uploadResult.success) {
    lastStatus.lastError = `Aviso: Relógio não respondeu no IP ${config.clock_ip} (${uploadResult.error})`;
  }
}

// Loop principal de rotação de ativos (Loop infinito garantido)
async function runCycle() {
  if (!isRunning) return;

  if (!config.assets || config.assets.length === 0) {
    lastStatus.lastError = 'Nenhum ativo configurado na lista.';
    scheduleNext(5000);
    return;
  }

  // Garante que o índice está sempre dentro dos limites da lista
  if (currentAssetIndex >= config.assets.length || currentAssetIndex < 0) {
    currentAssetIndex = 0;
  }

  const asset = config.assets[currentAssetIndex];

  try {
    await pushAssetFrame(asset, currentAssetIndex);
  } catch (err) {
    console.error(`[Ciclo] Erro no ativo ${asset ? asset.symbol : currentAssetIndex}:`, err.message);
    lastStatus.lastError = err.message;
  } finally {
    // SEMPRE avança para o próximo ativo em loop infinito circular (0 -> 1 -> ... -> total-1 -> 0)
    currentAssetIndex = (currentAssetIndex + 1) % config.assets.length;
    const intervalMs = Math.max(3000, (config.rotation_interval_seconds || 15) * 1000);
    scheduleNext(intervalMs);
  }
}

function scheduleNext(ms) {
  if (!isRunning) return;
  if (loopTimeout) clearTimeout(loopTimeout);
  loopTimeout = setTimeout(runCycle, ms);
}

// Rotas da API
app.get('/api/status', (req, res) => {
  res.json({
    running: isRunning,
    currentAssetIndex,
    currentAsset: lastStatus.currentAsset,
    clockIp: config.clock_ip,
    rotationInterval: config.rotation_interval_seconds,
    layout: config.layout || 'fintech',
    totalAssets: config.assets.length,
    lastUpdate: lastStatus.lastUpdate,
    lastError: lastStatus.lastError
  });
});

app.post('/api/start', async (req, res) => {
  if (isRunning) {
    return res.json({ success: true, message: 'Monitoramento já está em execução.' });
  }

  // 1. Desmarca obrigatoriamente as fotos de fábrica 2 a 5 antes de rodar o loop
  try {
    await cleanClockSlots(config.clock_ip);
    // Pausa de 1.5s para o relógio consolidar as gravações e transitar suavemente para o modo Photo
    await new Promise(r => setTimeout(r, 1500));
  } catch (err) {
    console.warn('Aviso ao desmarcar slots de fábrica:', err.message);
  }

  isRunning = true;
  currentAssetIndex = 0;
  runCycle();
  res.json({ success: true, message: 'Monitoramento iniciado e slots de fábrica desmarcados automaticamente.' });
});

// Endpoint para focar imediatamente em um ativo ao clicar no card
app.post('/api/focus-asset', async (req, res) => {
  const { id, symbol } = req.body || {};
  if (!id && !symbol) {
    return res.status(400).json({ success: false, error: 'Identificador do ativo ausente.' });
  }

  const target = (id || symbol).toUpperCase();
  const index = config.assets.findIndex(a => 
    (a.id && a.id.toUpperCase() === target) || 
    (a.symbol && a.symbol.toUpperCase() === target)
  );

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Ativo não encontrado na lista.' });
  }

  const asset = config.assets[index];
  currentAssetIndex = index;

  try {
    await pushAssetFrame(asset, index);
  } catch (err) {
    lastStatus.lastError = err.message;
  }

  // Se o monitor estiver rodando, agenda o próximo ciclo a partir deste ativo
  if (isRunning) {
    currentAssetIndex = (index + 1) % config.assets.length;
    const intervalMs = Math.max(3000, (config.rotation_interval_seconds || 15) * 1000);
    scheduleNext(intervalMs);
  }

  res.json({
    success: true,
    asset,
    index,
    previewUrl: `/api/preview.jpg?t=${Date.now()}`
  });
});

app.post('/api/stop', async (req, res) => {
  isRunning = false;
  if (loopTimeout) clearTimeout(loopTimeout);

  let restored = false;
  try {
    const r = await restoreNormalClockMode(config.clock_ip, config.theme_restore || 0);
    restored = r.success;
  } catch (_) {}

  res.json({
    success: true,
    message: 'Monitoramento pausado. Comando para restaurar tela padrão enviado ao relógio.',
    restored
  });
});

app.get('/api/config', (req, res) => {
  res.json(config);
});

app.post('/api/config', async (req, res) => {
  const { clock_ip, rotation_interval_seconds, theme_restore, layout } = req.body;
  if (clock_ip) config.clock_ip = clock_ip.trim();
  if (rotation_interval_seconds) config.rotation_interval_seconds = parseInt(rotation_interval_seconds, 10);
  if (theme_restore !== undefined) config.theme_restore = parseInt(theme_restore, 10);
  
  const layoutChanged = layout && layout !== config.layout;
  if (layout) config.layout = layout;
  saveConfig(config);

  // Se o layout mudou, atualiza a tela e o relógio imediatamente
  if (layoutChanged && config.assets.length > 0) {
    const assetIdx = Math.max(0, currentAssetIndex - 1);
    const asset = config.assets[assetIdx] || config.assets[0];
    try {
      await pushAssetFrame(asset, assetIdx);
    } catch (_) {}
  }

  res.json({ success: true, config });
});

// Endpoint para limpar os slots de fábrica manualmente a qualquer momento
app.post('/api/clean-slots', async (req, res) => {
  const result = await cleanClockSlots(config.clock_ip);
  res.json(result);
});

app.post('/api/assets', (req, res) => {
  let { type, symbol, name, currency } = req.body;
  if (!type || !symbol || !name) {
    return res.status(400).json({ success: false, error: 'Campos obrigatórios ausentes.' });
  }

  // Normalização automática de Cripto (suporta USD e BRL)
  if (type === 'crypto') {
    symbol = normalizeCryptoSymbol(symbol, currency);
  }

  const id = symbol.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const exists = config.assets.some(a => a.id === id || a.symbol.toUpperCase() === symbol.toUpperCase());
  if (exists) {
    return res.status(400).json({ success: false, error: 'Este ativo já está na lista.' });
  }

  const newAsset = {
    id,
    type,
    symbol: symbol.toUpperCase(),
    name,
    currency: currency || (type === 'crypto' ? 'USD' : 'BRL')
  };

  config.assets.push(newAsset);
  saveConfig(config);
  res.json({ success: true, asset: newAsset });
});

app.delete('/api/assets/:id', (req, res) => {
  const { id } = req.params;
  const initialLen = config.assets.length;
  config.assets = config.assets.filter(a => a.id !== id && a.symbol !== id);
  if (config.assets.length === initialLen) {
    return res.status(404).json({ success: false, error: 'Ativo não encontrado.' });
  }
  saveConfig(config);
  res.json({ success: true, message: 'Ativo removido.' });
});

app.post('/api/test-clock', async (req, res) => {
  const ip = req.body.ip || config.clock_ip;
  const result = await testClockConnection(ip);
  res.json(result);
});

// Auto-detecção de IP na rede Wi-Fi local
app.post('/api/scan-ip', async (req, res) => {
  const os = require('os');
  const ifaces = os.networkInterfaces();
  let baseSubnet = '192.168.1.';
  for (const k in ifaces) {
    for (const a of ifaces[k]) {
      if (a.family === 'IPv4' && !a.internal && a.address.startsWith('192.168.')) {
        baseSubnet = a.address.substring(0, a.address.lastIndexOf('.') + 1);
      }
    }
  }

  const promises = [];
  for (let i = 1; i <= 50; i++) {
    const ip = baseSubnet + i;
    promises.push(new Promise(resolve => {
      const r = http.get(`http://${ip}/`, { timeout: 1500 }, response => {
        let data = '';
        response.on('data', c => data += c);
        response.on('end', () => {
          if (data.includes('Smart Weather') || data.includes('file1-switch') || data.includes('themeselect')) {
            resolve(ip);
          } else {
            resolve(null);
          }
        });
      });
      r.on('error', () => resolve(null));
      r.on('timeout', () => { r.destroy(); resolve(null); });
    }));
  }

  const results = (await Promise.all(promises)).filter(Boolean);
  if (results.length > 0) {
    const foundIp = results[0];
    config.clock_ip = foundIp;
    saveConfig(config);
    cleanClockSlots(foundIp).catch(() => {});
    return res.json({ success: true, ip: foundIp });
  }

  res.json({ success: false, error: 'Relógio não encontrado automaticamente na sub-rede ' + baseSubnet });
});

// Endpoint para reiniciar o relógio
app.post('/api/restart-clock', async (req, res) => {
  const ip = (req.body && req.body.ip) ? req.body.ip : config.clock_ip;
  const result = await restartClock(ip);
  res.json(result);
});

app.get('/api/preview.jpg', (req, res) => {
  if (latestPreviewBuffer) {
    res.set('Content-Type', 'image/jpeg');
    res.set('Cache-Control', 'no-store');
    return res.send(latestPreviewBuffer);
  }

  // Gera frame sob demanda se ainda não houver nenhum
  if (config.assets && config.assets.length > 0) {
    try {
      const asset = config.assets[0];
      const placeholder = { price: 0, changePct: 0, high: 0, low: 0, open: 0, history: [0, 0] };
      const meta = { index: 0, total: config.assets.length, nextName: '' };
      const buf = renderAssetScreen(asset, placeholder, meta, config.layout || 'fintech');
      res.set('Content-Type', 'image/jpeg');
      res.set('Cache-Control', 'no-store');
      return res.send(buf);
    } catch (_) {}
  }

  res.status(404).send('Preview não disponível ainda.');
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 GeekMagic Market Monitor rodando em: http://localhost:${PORT}`);
  console.log(`=======================================================`);
});
