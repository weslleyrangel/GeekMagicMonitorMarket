# Plano de Adição de Novos Ativos (Exemplo: Cardano em BRL)

Este documento detalha o preenchimento passo a passo para cadastrar novos ativos (como a **Cardano em Real / BRL**) e propõe uma automação inteligente para que o sistema converta siglas simples (como `ADA` ou `BTC` com moeda `BRL`) diretamente para o par oficial da Binance (`ADABRL`), além de adicionar atalhos rápidos.

---

## 1. Como Preencher os Campos no Painel Atual

No painel em **`http://localhost:3333`**, clique no botão **`➕ Adicionar Ativo`** (no canto superior direito da lista de ativos).

No formulário manual **"OU DIGITE MANUALMENTE"**, preencha exatamente assim:

| Campo no Formulário | O que selecionar / digitar | Explicação |
| :--- | :--- | :--- |
| **Categoria** | `Criptomoeda` | Informa ao sistema que deve consultar a API da Binance. |
| **Símbolo / Ticker** | `ADABRL` *(ou `ADA-BRL`)* | O par oficial negociado na Binance em Reais. |
| **Nome de Exibição** | `Cardano (BRL)` | O nome que aparecerá no visor do relógio e nos cards. |
| **Moeda de Cotação** | `Real (R$ BRL)` | Garante que o valor venha com o símbolo **`R$`** no visor. |

Ao clicar em **"Adicionar à Lista"**:
1. O novo card **Cardano (BRL)** aparecerá imediatamente na sua lista.
2. Você pode clicar diretamente nele para ver a cotação em Reais (ex: `R$ 0,90`) no espelho e no relógio físico.

---

## 2. Aprimoramento Proposto: Suporte Inteligente a Criptos em BRL

Para tornar o uso ainda mais fácil e à prova de erros:

### A. Reconhecimento Automático de Moeda
Hoje, se você digitar apenas `ADA` e selecionar a moeda `Real (R$ BRL)`, o normalizador antigo forçava `ADAUSDT`.
* **Mudança Proposta:** Atualizar `normalizeCryptoSymbol(symbol, currency)` para que, ao escolher **Moeda: BRL**, siglas simples como `ADA`, `BTC`, `ETH`, `SOL` sejam automaticamente convertidas para `ADABRL`, `BTCBRL`, `ETHBRL`, etc.

### B. Botões de Preset Rápido em BRL no Modal
Adicionar chips de 1 clique para criptomoedas em Reais diretamente na nuvem de sugestões:
* **`₳ Cardano (BRL)`** (`ADABRL`)
* **`₿ Bitcoin (BRL)`** (`BTCBRL`)
* **`Ξ Ethereum (BRL)`** (`ETHBRL`)

---

## 3. Arquivos Modificados

### `market_service.js`
* Expandir `normalizeCryptoSymbol(rawSym, currency)` para respeitar a moeda selecionada (`BRL` ou `USD`).

### `server.js`
* Passar `currency` para a função de normalização na rota `POST /api/assets`.

### `public/index.html`
* Adicionar os presets rápidos de criptos em Real no modal.

---

## 4. Plano de Verificação

1. **Teste Automatizado:**
   * Executar teste via script chamando `POST /api/assets` com `{ type: 'crypto', symbol: 'ADA', name: 'Cardano BRL', currency: 'BRL' }`.
   * Verificar se o símbolo registrado é `ADABRL` e a cotação retorna em `R$`.
2. **Teste Visual:**
   * Clicar no card recém-adicionado para confirmar que o preview e o relógio renderizam o prefixo `R$` com o valor correto da Binance.
