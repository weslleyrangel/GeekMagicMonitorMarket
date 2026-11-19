/**
 * app.js
 * Lógica do Frontend para o GeekMagic Market Monitor Dashboard
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elementos da UI
  const systemStatusBadge = document.getElementById('systemStatusBadge');
  const btnStart = document.getElementById('btnStart');
  const btnStop = document.getElementById('btnStop');
  const livePreviewImg = document.getElementById('livePreviewImg');
  const screenOverlay = document.getElementById('screenOverlay');
  const lblCurrentAsset = document.getElementById('lblCurrentAsset');
  const lblLastUpdate = document.getElementById('lblLastUpdate');
  const rowError = document.getElementById('rowError');
  const lblError = document.getElementById('lblError');

  const assetsContainer = document.getElementById('assetsContainer');
  const assetCount = document.getElementById('assetCount');
  const inputClockIp = document.getElementById('inputClockIp');
  const inputInterval = document.getElementById('inputInterval');
  const btnSaveConfig = document.getElementById('btnSaveConfig');
  const btnTestClock = document.getElementById('btnTestClock');
  const clockTestResult = document.getElementById('clockTestResult');

  // Modal de Adição
  const addModal = document.getElementById('addModal');
  const btnOpenAddModal = document.getElementById('btnOpenAddModal');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const formAddAsset = document.getElementById('formAddAsset');

  let pollInterval = null;

  // Seletor de Layouts
  document.querySelectorAll('.btn-layout').forEach(btn => {
    btn.addEventListener('click', async () => {
      const selectedLayout = btn.dataset.layout;
      document.querySelectorAll('.btn-layout').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      try {
        await fetch('/api/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ layout: selectedLayout })
        });
        // Atualiza o preview e status na hora
        livePreviewImg.src = `/api/preview.jpg?t=${Date.now()}`;
        loadStatus();
      } catch (err) {
        console.error('Erro ao salvar layout:', err);
      }
    });
  });

  // Carregar dados iniciais
  loadStatus();
  loadConfig();
  startPolling();

  // Iniciar Monitoramento
  btnStart.addEventListener('click', async () => {
    try {
      btnStart.disabled = true;
      const res = await fetch('/api/start', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await loadStatus();
      }
    } catch (err) {
      alert('Erro ao iniciar: ' + err.message);
    }
  });

  // Parar Monitoramento
  btnStop.addEventListener('click', async () => {
    try {
      btnStop.disabled = true;
      const res = await fetch('/api/stop', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await loadStatus();
      }
    } catch (err) {
      alert('Erro ao parar: ' + err.message);
    }
  });

  // Salvar Configurações
  btnSaveConfig.addEventListener('click', async () => {
    const clock_ip = inputClockIp.value.trim();
    const rotation_interval_seconds = parseInt(inputInterval.value, 10);
    try {
      btnSaveConfig.disabled = true;
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clock_ip, rotation_interval_seconds })
      });
      const data = await res.json();
      if (data.success) {
        alert('Configurações salvas com sucesso!');
      }
    } catch (err) {
      alert('Erro ao salvar: ' + err.message);
    } finally {
      btnSaveConfig.disabled = false;
    }
  });

  // Testar Conexão com o Relógio
  btnTestClock.addEventListener('click', async () => {
    const ip = inputClockIp.value.trim();
    clockTestResult.style.color = '#58a6ff';
    clockTestResult.textContent = 'Testando resposta de ' + ip + '...';
    try {
      const res = await fetch('/api/test-clock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip })
      });
      const data = await res.json();
      if (data.success) {
        clockTestResult.style.color = '#3fb950';
        clockTestResult.textContent = '✅ Relógio conectado com sucesso no IP ' + ip + '!';
      } else {
        clockTestResult.style.color = '#f85149';
        clockTestResult.textContent = '⚠️ Relógio não respondeu no IP ' + ip + ' (' + data.error + ')';
      }
    } catch (err) {
      clockTestResult.style.color = '#f85149';
      clockTestResult.textContent = 'Erro no teste: ' + err.message;
    }
  });

  // Auto-Detectar IP na rede
  const btnScanIp = document.getElementById('btnScanIp');
  if (btnScanIp) {
    btnScanIp.addEventListener('click', async () => {
      btnScanIp.disabled = true;
      clockTestResult.style.color = '#58a6ff';
      clockTestResult.textContent = '🔍 Varrendo a rede Wi-Fi em busca do relógio...';
      try {
        const res = await fetch('/api/scan-ip', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          inputClockIp.value = data.ip;
          clockTestResult.style.color = '#3fb950';
          clockTestResult.textContent = '🎉 Relógio localizado com sucesso no IP ' + data.ip + '! Configuração salva.';
        } else {
          clockTestResult.style.color = '#f85149';
          clockTestResult.textContent = '⚠️ ' + data.error;
        }
      } catch (err) {
        clockTestResult.style.color = '#f85149';
        clockTestResult.textContent = 'Erro na busca: ' + err.message;
      } finally {
        btnScanIp.disabled = false;
      }
    });
  }

  // Desmarcar Slots de Fábrica
  const btnCleanSlots = document.getElementById('btnCleanSlots');
  if (btnCleanSlots) {
    btnCleanSlots.addEventListener('click', async () => {
      btnCleanSlots.disabled = true;
      clockTestResult.style.color = '#58a6ff';
      clockTestResult.textContent = 'Enviando comando para desmarcar caixas 2 a 5 no relógio...';
      try {
        const res = await fetch('/api/clean-slots', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          clockTestResult.style.color = '#3fb950';
          clockTestResult.textContent = '✅ Fotos de fábrica desmarcadas com sucesso! Apenas a tela do mercado será exibida.';
        } else {
          clockTestResult.style.color = '#f85149';
          clockTestResult.textContent = 'Aviso: ' + (data.error || 'Falha ao desmarcar');
        }
      } catch (err) {
        clockTestResult.style.color = '#f85149';
        clockTestResult.textContent = 'Erro: ' + err.message;
      } finally {
        btnCleanSlots.disabled = false;
      }
    });
  }

  // Reiniciar o Relógio
  const btnRestartClock = document.getElementById('btnRestartClock');
  if (btnRestartClock) {
    btnRestartClock.addEventListener('click', async () => {
      if (!confirm('Deseja realmente reiniciar o aparelho GeekMagic?')) {
        return;
      }
      btnRestartClock.disabled = true;
      clockTestResult.style.color = '#f0883e';
      clockTestResult.textContent = '🔄 Enviando comando de reinicialização para o relógio...';
      try {
        const ip = inputClockIp.value.trim();
        const res = await fetch('/api/restart-clock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ip })
        });
        const data = await res.json();
        if (data.success) {
          clockTestResult.style.color = '#58a6ff';
          clockTestResult.textContent = '⏳ ' + (data.message || 'Comando enviado! O relógio está reiniciando (~10 segundos)...');
          setTimeout(async () => {
            clockTestResult.textContent = '🔍 Reconectando e aplicando configurações...';
            await fetch('/api/clean-slots', { method: 'POST' }).catch(() => {});
            clockTestResult.style.color = '#3fb950';
            clockTestResult.textContent = '✅ Relógio reiniciado com sucesso!';
            btnRestartClock.disabled = false;
          }, 9000);
        } else {
          clockTestResult.style.color = '#f85149';
          clockTestResult.textContent = 'Erro ao reiniciar: ' + data.error;
          btnRestartClock.disabled = false;
        }
      } catch (err) {
        clockTestResult.style.color = '#f85149';
        clockTestResult.textContent = 'Erro de comunicação: ' + err.message;
        btnRestartClock.disabled = false;
      }
    });
  }

  // Abrir / Fechar Modal
  btnOpenAddModal.addEventListener('click', () => {
    addModal.classList.add('active');
  });

  btnCloseModal.addEventListener('click', () => {
    addModal.classList.remove('active');
  });

  addModal.addEventListener('click', (e) => {
    if (e.target === addModal) addModal.classList.remove('active');
  });

  // Presets Rápidos
  document.querySelectorAll('.preset-chip').forEach(chip => {
    chip.addEventListener('click', async () => {
      const type = chip.dataset.type;
      const symbol = chip.dataset.sym;
      const name = chip.dataset.name;
      const currency = chip.dataset.curr;
      await addAsset({ type, symbol, name, currency });
      addModal.classList.remove('active');
    });
  });

  // Submissão Manual
  formAddAsset.addEventListener('submit', async (e) => {
    e.preventDefault();
    const type = document.getElementById('assetType').value;
    const symbol = document.getElementById('assetSymbol').value.trim();
    const name = document.getElementById('assetName').value.trim();
    const currency = document.getElementById('assetCurrency').value;

    await addAsset({ type, symbol, name, currency });
    formAddAsset.reset();
    addModal.classList.remove('active');
  });

  async function addAsset(assetData) {
    try {
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assetData)
      });
      const data = await res.json();
      if (data.success) {
        await loadConfig();
      } else {
        alert(data.error || 'Erro ao adicionar ativo.');
      }
    } catch (err) {
      alert('Erro: ' + err.message);
    }
  }

  async function deleteAsset(id) {
    if (!confirm('Deseja remover este ativo da rotação?')) return;
    try {
      const res = await fetch(`/api/assets/${encodeURIComponent(id)}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        await loadConfig();
      }
    } catch (err) {
      alert('Erro ao excluir: ' + err.message);
    }
  }

  // Carregar Configurações & Lista de Ativos
  async function loadConfig() {
    try {
      const res = await fetch('/api/config');
      const cfg = await res.json();
      inputClockIp.value = cfg.clock_ip || '192.168.1.2';
      inputInterval.value = cfg.rotation_interval_seconds || 10;
      
      // Atualiza botão do layout ativo
      if (cfg.layout) {
        document.querySelectorAll('.btn-layout').forEach(b => {
          b.classList.toggle('active', b.dataset.layout === cfg.layout);
        });
      }

      renderAssets(cfg.assets || []);
    } catch (err) {
      console.error('Falha ao carregar config:', err);
    }
  }

  function renderAssets(assets) {
    assetCount.textContent = assets.length;
    assetsContainer.innerHTML = '';

    if (assets.length === 0) {
      assetsContainer.innerHTML = '<p style="color: var(--text-secondary); font-size: 13px;">Nenhum ativo configurado. Clique em Adicionar Ativo acima.</p>';
      return;
    }

    assets.forEach(asset => {
      const card = document.createElement('div');
      card.className = 'asset-card';
      card.dataset.sym = asset.symbol;
      card.dataset.id = asset.id || asset.symbol;
      card.title = 'Clique para ver este ativo no relógio e no preview agora';

      let tagClass = 'tag-crypto';
      let tagText = 'CRYPTO';
      if (asset.type === 'fiat') {
        tagClass = 'tag-fiat';
        tagText = 'CÂMBIO';
      } else if (asset.type === 'stock') {
        tagClass = 'tag-stock';
        tagText = 'AÇÃO';
      }

      card.innerHTML = `
        <div class="asset-card-top">
          <span class="tag-badge ${tagClass}">${tagText}</span>
          <button class="btn-delete-asset" title="Remover">&times;</button>
        </div>
        <div>
          <div class="asset-symbol">${escapeHtml(asset.symbol)}</div>
          <div class="asset-name">${escapeHtml(asset.name)}</div>
        </div>
      `;

      card.addEventListener('click', async (e) => {
        if (e.target.closest('.btn-delete-asset')) return;
        await focusAsset(asset);
      });

      card.querySelector('.btn-delete-asset').addEventListener('click', (e) => {
        e.stopPropagation();
        deleteAsset(asset.id || asset.symbol);
      });

      assetsContainer.appendChild(card);
    });
  }

  async function focusAsset(asset) {
    try {
      document.querySelectorAll('.asset-card').forEach(c => {
        c.classList.toggle('active', c.dataset.sym === asset.symbol);
      });

      lblCurrentAsset.textContent = `${asset.name} (${asset.symbol}) [Carregando...]`;

      const res = await fetch('/api/focus-asset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: asset.id || asset.symbol, symbol: asset.symbol })
      });
      const data = await res.json();
      if (data.success) {
        livePreviewImg.src = `/api/preview.jpg?t=${Date.now()}`;
        screenOverlay.classList.add('hidden');
        lblCurrentAsset.textContent = `${asset.name} (${asset.symbol})`;
        lblLastUpdate.textContent = new Date().toLocaleTimeString('pt-BR');
      }
    } catch (err) {
      console.error('Erro ao focar ativo:', err);
    }
  }

  // Carregar Status do Backend
  async function loadStatus() {
    try {
      const res = await fetch('/api/status');
      const status = await res.json();

      if (status.running) {
        systemStatusBadge.className = 'status-badge running';
        systemStatusBadge.querySelector('.status-text').textContent = 'MONITORANDO';
        btnStart.disabled = true;
        btnStop.disabled = false;
        screenOverlay.classList.add('hidden');
      } else {
        systemStatusBadge.className = 'status-badge';
        systemStatusBadge.querySelector('.status-text').textContent = 'PARADO';
        btnStart.disabled = false;
        btnStop.disabled = true;
        screenOverlay.classList.remove('hidden');
      }

      if (status.currentAsset) {
        lblCurrentAsset.textContent = `${status.currentAsset.name} (${status.currentAsset.symbol})`;
        document.querySelectorAll('.asset-card').forEach(c => {
          c.classList.toggle('active', c.dataset.sym === status.currentAsset.symbol);
        });
      } else {
        lblCurrentAsset.textContent = '--';
      }

      if (status.lastUpdate) {
        const d = new Date(status.lastUpdate);
        lblLastUpdate.textContent = d.toLocaleTimeString('pt-BR');
        livePreviewImg.src = `/api/preview.jpg?t=${Date.now()}`;
      } else {
        lblLastUpdate.textContent = '--';
      }

      if (status.lastError) {
        rowError.style.display = 'flex';
        lblError.textContent = status.lastError;
      } else {
        rowError.style.display = 'none';
      }
    } catch (err) {
      console.error('Falha ao checar status:', err);
    }
  }

  function startPolling() {
    if (pollInterval) clearInterval(pollInterval);
    pollInterval = setInterval(loadStatus, 2500);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function(m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }
});
