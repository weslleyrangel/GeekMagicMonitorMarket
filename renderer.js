/**
 * renderer.js
 * Renderizador com 3 layouts visuais distintos para telas 240x240 pixels:
 * 1. fintech (Clássico com gráfico suave)
 * 2. minimal (Foco em Big Numbers e legibilidade à distância)
 * 3. trader  (Terminal estilo Bloomberg / TradingView com barras e métricas O/H/L/C)
 */

const { createCanvas } = require('@napi-rs/canvas');

function formatCurrency(num, currency) {
  if (num === null || num === undefined || isNaN(num)) return '--';
  const prefix = currency === 'BRL' ? 'R$ ' : currency === 'USD' ? '$ ' : '';
  const suffix = currency === 'PTS' ? ' pts' : '';

  if (currency === 'PTS') {
    return Math.round(num).toLocaleString('pt-BR') + suffix;
  }

  if (num >= 1000) {
    return prefix + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } else if (num >= 1) {
    return prefix + num.toFixed(2);
  } else {
    return prefix + num.toFixed(4);
  }
}

function formatShortNum(num) {
  if (num === null || num === undefined || isNaN(num)) return '--';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  if (num >= 1) return num.toFixed(2);
  return num.toFixed(4);
}

// ==========================================
// LAYOUT 1: FINTECH CLÁSSICO
// ==========================================
function renderFintechLayout(ctx, asset, quote, meta) {
  const isPositive = (quote.changePct ?? 0) >= 0;
  const themeColor = isPositive ? '#2ea043' : '#f85149';

  const bgGrad = ctx.createLinearGradient(0, 0, 0, 240);
  bgGrad.addColorStop(0, '#0d1117');
  bgGrad.addColorStop(1, '#161b22');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 240, 240);

  let tagBg = '#1f6feb';
  let tagText = 'CRYPTO';
  if (asset.type === 'fiat') {
    tagBg = '#d29922';
    tagText = 'CÂMBIO';
  } else if (asset.type === 'stock') {
    tagBg = '#8957e5';
    tagText = 'AÇÃO';
  }

  // Tag
  ctx.fillStyle = tagBg;
  ctx.beginPath();
  ctx.roundRect(12, 12, 54, 18, 4);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 10px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(tagText, 39, 25);

  // Símbolo
  ctx.textAlign = 'left';
  ctx.fillStyle = '#f0f6fc';
  ctx.font = 'bold 15px Arial';
  const displaySym = asset.symbol.replace('.SA', '').replace('USDT', '');
  ctx.fillText(displaySym, 74, 26);

  ctx.fillStyle = '#8b949e';
  ctx.font = '11px Arial';
  ctx.textAlign = 'right';
  ctx.fillText(asset.name || '', 228, 26);

  ctx.strokeStyle = '#30363d';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(12, 38);
  ctx.lineTo(228, 38);
  ctx.stroke();

  // Preço
  const priceStr = formatCurrency(quote.price, asset.currency);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffffff';
  let fontSize = 28;
  if (priceStr.length > 11) fontSize = 22;
  else if (priceStr.length > 9) fontSize = 25;
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.fillText(priceStr, 12, 73);

  // Variação
  const sign = isPositive ? '▲ +' : '▼ ';
  const changeText = `${sign}${Math.abs(quote.changePct ?? 0).toFixed(2)}%`;
  ctx.fillStyle = themeColor;
  ctx.beginPath();
  ctx.roundRect(12, 85, 84, 22, 5);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(changeText, 54, 101);

  // Máx / Mín
  ctx.textAlign = 'right';
  ctx.fillStyle = '#8b949e';
  ctx.font = '11px Arial';
  if (quote.high && quote.low) {
    ctx.fillText(`H: ${formatShortNum(quote.high)}  L: ${formatShortNum(quote.low)}`, 228, 101);
  }

  // Gráfico suave
  drawSmoothSparkline(ctx, quote.history, isPositive, 12, 118, 216, 78);

  // Rodapé
  ctx.strokeStyle = '#30363d';
  ctx.beginPath();
  ctx.moveTo(12, 210);
  ctx.lineTo(228, 210);
  ctx.stroke();

  const now = new Date();
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  ctx.textAlign = 'left';
  ctx.fillStyle = '#8b949e';
  ctx.font = 'bold 11px Arial';
  ctx.fillText(`🕒 ${timeStr}`, 12, 228);

  if (meta.index !== undefined && meta.total !== undefined) {
    ctx.textAlign = 'right';
    const nextTxt = meta.nextName ? `[${meta.index + 1}/${meta.total}] ⏭ ${meta.nextName}` : `[${meta.index + 1}/${meta.total}]`;
    ctx.fillText(nextTxt, 228, 228);
  }
}

// ==========================================
// LAYOUT 2: MINIMALISTA (BIG NUMBERS)
// ==========================================
function renderMinimalLayout(ctx, asset, quote, meta) {
  const isPositive = (quote.changePct ?? 0) >= 0;
  const themeColor = isPositive ? '#3fb950' : '#f85149';

  // Fundo minimalista profundo com moldura sutil
  ctx.fillStyle = '#080a0f';
  ctx.fillRect(0, 0, 240, 240);

  ctx.strokeStyle = '#1e2430';
  ctx.lineWidth = 2;
  ctx.strokeRect(6, 6, 228, 228);

  // Topo: Símbolo em caixa alta centralizado
  ctx.textAlign = 'center';
  ctx.fillStyle = '#8b949e';
  ctx.font = 'bold 13px Arial';
  const displaySym = asset.symbol.replace('.SA', '').replace('USDT', '');
  ctx.fillText(displaySym, 120, 32);

  ctx.fillStyle = '#484f58';
  ctx.font = '11px Arial';
  ctx.fillText(asset.name || '', 120, 50);

  // Preço Gigante no Centro
  const priceStr = formatCurrency(quote.price, asset.currency);
  ctx.fillStyle = '#ffffff';

  let fontSize = 38;
  if (priceStr.length > 11) fontSize = 26;
  else if (priceStr.length > 9) fontSize = 30;
  else if (priceStr.length > 7) fontSize = 34;

  ctx.font = `bold ${fontSize}px Arial`;
  ctx.fillText(priceStr, 120, 115);

  // Pílula Luminosa de Variação
  const sign = isPositive ? '▲ +' : '▼ ';
  const changeText = `${sign}${Math.abs(quote.changePct ?? 0).toFixed(2)}%`;

  ctx.fillStyle = isPositive ? 'rgba(46, 160, 67, 0.2)' : 'rgba(218, 54, 51, 0.2)';
  ctx.beginPath();
  ctx.roundRect(65, 138, 110, 28, 14);
  ctx.fill();

  ctx.strokeStyle = themeColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = themeColor;
  ctx.font = 'bold 15px Arial';
  ctx.fillText(changeText, 120, 157);

  // Variação calculada em valor (ex: +$1,200 ou -$0.05)
  if (quote.open && quote.price) {
    const diff = quote.price - quote.open;
    const diffSign = diff >= 0 ? '+' : '';
    const diffStr = diffSign + formatCurrency(diff, asset.currency);
    ctx.fillStyle = '#8b949e';
    ctx.font = '12px Arial';
    ctx.fillText(`24h: ${diffStr}`, 120, 190);
  }

  // Rodapé Minimalista
  const now = new Date();
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  ctx.fillStyle = '#484f58';
  ctx.font = '11px Arial';
  const pageStr = (meta.index !== undefined && meta.total !== undefined) ? `${timeStr}  •  [${meta.index + 1}/${meta.total}]` : timeStr;
  ctx.fillText(pageStr, 120, 222);
}

// ==========================================
// LAYOUT 3: TRADER PRO (TERMINAL BLOOMBERG)
// ==========================================
function renderTraderLayout(ctx, asset, quote, meta) {
  const isPositive = (quote.changePct ?? 0) >= 0;
  const neonColor = isPositive ? '#00ff66' : '#ff3344';

  // Fundo preto absoluto de terminal
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 240, 240);

  // Grade de fundo sutil de terminal
  ctx.strokeStyle = '#151922';
  ctx.lineWidth = 1;
  for (let x = 20; x < 240; x += 30) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 240); ctx.stroke();
  }
  for (let y = 20; y < 240; y += 30) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(240, y); ctx.stroke();
  }

  // Barra de Topo Terminal
  ctx.fillStyle = '#111620';
  ctx.fillRect(0, 0, 240, 28);
  ctx.strokeStyle = '#22272e';
  ctx.strokeRect(0, 0, 240, 28);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#e3b341'; // Amarelo clássico de terminal
  ctx.font = 'bold 12px "Courier New", Courier, monospace';
  const prefixType = asset.type === 'crypto' ? 'BINANCE' : asset.type === 'fiat' ? 'FX' : 'B3';
  ctx.fillText(`[${prefixType}:${asset.symbol}]`, 10, 19);

  const now = new Date();
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  ctx.textAlign = 'right';
  ctx.fillStyle = '#8b949e';
  ctx.font = '11px "Courier New", monospace';
  ctx.fillText(timeStr, 230, 19);

  // Preço Principal com Brilho Neon
  const priceStr = formatCurrency(quote.price, asset.currency);
  ctx.textAlign = 'left';
  ctx.fillStyle = neonColor;
  let fontSize = 28;
  if (priceStr.length > 10) fontSize = 23;
  ctx.font = `bold ${fontSize}px "Courier New", monospace`;
  ctx.fillText(priceStr, 10, 62);

  // Variação ao lado
  const sign = isPositive ? '+' : '';
  const changeText = `${sign}${(quote.changePct ?? 0).toFixed(2)}%`;
  ctx.textAlign = 'right';
  ctx.fillStyle = neonColor;
  ctx.font = 'bold 16px "Courier New", monospace';
  ctx.fillText(changeText, 230, 60);

  // Caixa de Métricas O / H / L / C
  ctx.fillStyle = '#0a0d14';
  ctx.fillRect(10, 72, 220, 42);
  ctx.strokeStyle = '#21262d';
  ctx.strokeRect(10, 72, 220, 42);

  ctx.font = '10px "Courier New", monospace';
  ctx.textAlign = 'left';

  // Linha 1: Open e High
  ctx.fillStyle = '#8b949e';
  ctx.fillText('OPEN:', 16, 88);
  ctx.fillStyle = '#f0f6fc';
  ctx.fillText(formatShortNum(quote.open), 52, 88);

  ctx.fillStyle = '#8b949e';
  ctx.fillText('HIGH:', 125, 88);
  ctx.fillStyle = '#00ff66';
  ctx.fillText(formatShortNum(quote.high), 160, 88);

  // Linha 2: Low e Close
  ctx.fillStyle = '#8b949e';
  ctx.fillText('LOW: ', 16, 105);
  ctx.fillStyle = '#ff3344';
  ctx.fillText(formatShortNum(quote.low), 52, 105);

  ctx.fillStyle = '#8b949e';
  ctx.fillText('LAST:', 125, 105);
  ctx.fillStyle = '#f0f6fc';
  ctx.fillText(formatShortNum(quote.price), 160, 105);

  // Gráfico de Barras / Candlesticks
  drawTraderBars(ctx, quote.history, isPositive, 10, 122, 220, 88);

  // Rodapé Terminal
  ctx.fillStyle = '#111620';
  ctx.fillRect(0, 218, 240, 22);
  ctx.strokeStyle = '#22272e';
  ctx.strokeRect(0, 218, 240, 22);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#8b949e';
  ctx.font = 'bold 10px "Courier New", monospace';
  ctx.fillText('● LIVE FEED', 10, 233);

  ctx.textAlign = 'right';
  if (meta.index !== undefined && meta.total !== undefined) {
    ctx.fillText(`ASSET ${meta.index + 1}/${meta.total}`, 230, 233);
  }
}

// Helpers de gráficos
function drawSmoothSparkline(ctx, history, isPositive, x, y, width, height) {
  if (!history || history.length < 2) return;
  const min = Math.min(...history);
  const max = Math.max(...history);
  const range = (max - min) || 1;

  const points = history.map((val, idx) => {
    const px = x + (idx / (history.length - 1)) * width;
    const py = y + height - ((val - min) / range) * height;
    return { x: px, y: py };
  });

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }

  const strokeColor = isPositive ? '#2ea043' : '#f85149';
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();

  ctx.lineTo(x + width, y + height);
  ctx.lineTo(x, y + height);
  ctx.closePath();

  const gradient = ctx.createLinearGradient(0, y, 0, y + height);
  gradient.addColorStop(0, isPositive ? 'rgba(46, 160, 67, 0.35)' : 'rgba(248, 81, 73, 0.35)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.restore();
}

function drawTraderBars(ctx, history, isPositiveOverall, x, y, width, height) {
  if (!history || history.length < 2) return;
  const min = Math.min(...history);
  const max = Math.max(...history);
  const range = (max - min) || 1;

  const barCount = history.length;
  const barWidth = Math.max(3, (width / barCount) - 2);

  for (let i = 0; i < barCount; i++) {
    const val = history[i];
    const prev = i > 0 ? history[i - 1] : val;
    const barIsUp = val >= prev;

    const bx = x + (i * (width / barCount));
    const normalizedH = Math.max(4, ((val - min) / range) * height);
    const by = y + height - normalizedH;

    ctx.fillStyle = barIsUp ? '#00ff66' : '#ff3344';
    ctx.fillRect(bx, by, barWidth, normalizedH);
  }
}

// Router Principal de Renderização
function renderAssetScreen(asset, quote, meta = {}, layout = 'fintech') {
  const canvas = createCanvas(240, 240);
  const ctx = canvas.getContext('2d');

  if (layout === 'minimal') {
    renderMinimalLayout(ctx, asset, quote, meta);
  } else if (layout === 'trader') {
    renderTraderLayout(ctx, asset, quote, meta);
  } else {
    renderFintechLayout(ctx, asset, quote, meta);
  }

  return canvas.toBuffer('image/jpeg');
}

module.exports = {
  renderAssetScreen
};
