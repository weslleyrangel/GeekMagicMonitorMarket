/**
 * market_service.js
 * Coleta de dados financeiros em tempo real com normalização inteligente de símbolos
 */

// Dicionário de sinônimos/nomes populares para pares da Binance
const CRYPTO_ALIASES = {
  'ADA': 'ADAUSDT',
  'CARDANO': 'ADAUSDT',
  'BTC': 'BTCUSDT',
  'BITCOIN': 'BTCUSDT',
  'ETH': 'ETHUSDT',
  'ETHEREUM': 'ETHUSDT',
  'SOL': 'SOLUSDT',
  'SOLANA': 'SOLUSDT',
  'BNB': 'BNBUSDT',
  'BINANCECOIN': 'BNBUSDT',
  'XRP': 'XRPUSDT',
  'RIPPLE': 'XRPUSDT',
  'DOGE': 'DOGEUSDT',
  'DOGECOIN': 'DOGEUSDT',
  'AVAX': 'AVAXUSDT',
  'AVALANCHE': 'AVAXUSDT',
  'DOT': 'DOTUSDT',
  'POLKADOT': 'DOTUSDT',
  'LINK': 'LINKUSDT',
  'CHAINLINK': 'LINKUSDT',
  'MATIC': 'MATICUSDT',
  'POLYGON': 'MATICUSDT',
  'POL': 'POLUSDT',
  'NEAR': 'NEARUSDT',
  'SHIB': 'SHIBUSDT',
  'PEPE': 'PEPEUSDT',
  'LTC': 'LTCUSDT',
  'LITECOIN': 'LTCUSDT'
};

function normalizeCryptoSymbol(rawSym, currency = 'USD') {
  if (!rawSym) return currency === 'BRL' ? 'BTCBRL' : 'BTCUSDT';
  let sym = rawSym.toUpperCase().trim().replace(/[\s\/\-_]/g, '');

  const isBrl = (currency && currency.toUpperCase() === 'BRL') || sym.endsWith('BRL');

  // Suporte a Real (BRL) na Binance
  if (isBrl) {
    const base = sym.endsWith('BRL') ? sym.slice(0, -3) : sym;
    let cleanBase = base;
    if (base === 'CARDANO') cleanBase = 'ADA';
    else if (base === 'BITCOIN') cleanBase = 'BTC';
    else if (base === 'ETHEREUM') cleanBase = 'ETH';
    else if (base === 'SOLANA') cleanBase = 'SOL';
    else if (base === 'DOGECOIN') cleanBase = 'DOGE';
    else if (base === 'RIPPLE') cleanBase = 'XRP';
    else if (base === 'BINANCECOIN') cleanBase = 'BNB';
    return cleanBase + 'BRL';
  }

  // 1. Checar aliases diretos em USDT (ex: "ADA" ou "CARDANO")
  if (CRYPTO_ALIASES[sym]) {
    return CRYPTO_ALIASES[sym];
  }

  // 2. Se não terminar com par conhecido (USDT, BRL, BTC, BUSD), anexa USDT
  if (!sym.endsWith('USDT') && !sym.endsWith('BRL') && !sym.endsWith('BTC') && !sym.endsWith('BUSD')) {
    sym += 'USDT';
  }

  return sym;
}

// Cache em memória para evitar requisições redundantes e rate-limiting
const quoteCache = new Map();
const CACHE_TTL_MS = 12000; // 12 segundos de validade

async function fetchCryptoData(symbol, currency = 'USD') {
  try {
    const cleanSym = normalizeCryptoSymbol(symbol, currency);
    const tickerRes = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${cleanSym}`, {
      signal: AbortSignal.timeout(5000)
    });
    if (!tickerRes.ok) {
      if (tickerRes.status === 400) {
        throw new Error(`Símbolo '${symbol}' não encontrado na Binance. Tente outro formato como ${cleanSym}.`);
      }
      throw new Error(`Binance HTTP ${tickerRes.status}`);
    }
    const ticker = await tickerRes.json();

    // Histórico de 24h para sparkline (intervalo de 1 hora, 24 pontos)
    let history = [];
    try {
      const klineRes = await fetch(`https://api.binance.com/api/v3/klines?symbol=${cleanSym}&interval=1h&limit=24`, {
        signal: AbortSignal.timeout(4000)
      });
      if (klineRes.ok) {
        const klines = await klineRes.json();
        history = klines.map(k => parseFloat(k[4])); // Fechamento
      }
    } catch (_) {}

    const price = parseFloat(ticker.lastPrice);
    const changePct = parseFloat(ticker.priceChangePercent);

    return {
      success: true,
      price,
      changePct,
      high: parseFloat(ticker.highPrice),
      low: parseFloat(ticker.lowPrice),
      open: parseFloat(ticker.openPrice),
      history: history.length > 0 ? history : [parseFloat(ticker.openPrice), price]
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function fetchFiatData(symbol) {
  try {
    let pair = symbol.toUpperCase().trim();
    if (!pair.includes('-') && pair.length === 6) {
      pair = pair.slice(0, 3) + '-' + pair.slice(3);
    }
    const key = pair.replace('-', '');
    const res = await fetch(`https://economia.awesomeapi.com.br/last/${pair}`, {
      signal: AbortSignal.timeout(5000)
    });
    if (!res.ok) throw new Error(`AwesomeAPI status ${res.status}`);
    const data = await res.json();
    const item = data[key];
    if (!item) throw new Error('Par de moedas não encontrado');

    const price = parseFloat(item.bid);
    const changePct = parseFloat(item.pctChange);

    let history = [];
    try {
      const histRes = await fetch(`https://economia.awesomeapi.com.br/json/daily/${key}/24`, {
        signal: AbortSignal.timeout(4000)
      });
      if (histRes.ok) {
        const histData = await histRes.json();
        history = histData.map(h => parseFloat(h.bid)).reverse();
      }
    } catch (_) {}

    return {
      success: true,
      price,
      changePct,
      high: parseFloat(item.high),
      low: parseFloat(item.low),
      open: price - (price * (changePct / 100)),
      history: history.length > 0 ? history : [price, price]
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function fetchStockData(symbol) {
  try {
    const sym = symbol.toUpperCase().trim();
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=15m&range=1d`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(6000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!res.ok) throw new Error(`Yahoo status ${res.status}`);
    const data = await res.json();
    const result = data.chart?.result?.[0];
    if (!result) throw new Error('Dados da ação não encontrados');

    const meta = result.meta;
    const price = meta.regularMarketPrice ?? meta.chartPreviousClose;
    const prevClose = meta.chartPreviousClose || meta.previousClose;
    const changePct = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;

    const closes = result.indicators?.quote?.[0]?.close || [];
    const history = [];
    for (let i = 0; i < closes.length; i++) {
      if (closes[i] !== null && closes[i] !== undefined) {
        history.push(closes[i]);
      }
    }

    return {
      success: true,
      price,
      changePct,
      high: meta.regularMarketDayHigh ?? price,
      low: meta.regularMarketDayLow ?? price,
      open: prevClose,
      history: history.length > 0 ? history : [prevClose, price]
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function getAssetQuote(asset) {
  if (!asset || !asset.symbol) {
    return { success: false, error: 'Ativo inválido ou sem símbolo' };
  }

  const cacheKey = `${asset.type}:${asset.symbol}:${asset.currency || ''}`;
  const cached = quoteCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    return cached.data;
  }

  let result;
  if (asset.type === 'crypto') {
    result = await fetchCryptoData(asset.symbol, asset.currency);
  } else if (asset.type === 'fiat') {
    result = await fetchFiatData(asset.symbol);
  } else if (asset.type === 'stock') {
    result = await fetchStockData(asset.symbol);
  } else {
    result = { success: false, error: 'Tipo de ativo desconhecido' };
  }

  if (result.success) {
    quoteCache.set(cacheKey, { timestamp: Date.now(), data: result });
  }

  return result;
}

module.exports = {
  getAssetQuote,
  normalizeCryptoSymbol,
  fetchCryptoData,
  fetchFiatData,
  fetchStockData
};
