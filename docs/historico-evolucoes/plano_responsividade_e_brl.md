# Plano de Implementação: Suporte a Criptos em BRL e Responsividade para Tablet e Celular

Este plano detalha as alterações para atender a duas melhorias fundamentais solicitadas:
1. **Suporte nativo e automático a criptomoedas em Real (BRL)** na Binance (ex: Cardano BRL, Bitcoin BRL, Ethereum BRL, Solana BRL), com normalização inteligente e botões de atalho rápido.
2. **Design e Responsividade Profissional para Dispositivos Móveis (Tablets e Telefones celulares)**, garantindo navegação fluida, botões otimizados para toque (*touch target*), grades adaptativas e sem barras de rolagem horizontais.

---

## 1. Suporte Inteligente a Criptomoedas em Real (BRL)

### O Problema Atual:
Atualmente, o normalizador do sistema converte qualquer criptomoeda para pares com `USDT` (ex: `ADA` -> `ADAUSDT`), mesmo que o usuário selecione `Moeda: Real (BRL)` no formulário.

### A Solução:
* Atualizar a função `normalizeCryptoSymbol(rawSym, currency)` em `market_service.js`.
* Se o usuário selecionar ou especificar a moeda `BRL`:
  * `ADA` ou `CARDANO` $\rightarrow$ `ADABRL`
  * `BTC` ou `BITCOIN` $\rightarrow$ `BTCBRL`
  * `ETH` ou `ETHEREUM` $\rightarrow$ `ETHBRL`
  * `SOL` ou `SOLANA` $\rightarrow$ `SOLBRL`
  * Qualquer outro símbolo que não termine com `BRL` receberá `BRL` ao final em vez de `USDT`.
* Se a moeda for `USD` (padrão), continuará aplicando `...USDT`.
* Incluir chips de 1 clique no modal para **Cardano (BRL)**, **Bitcoin (BRL)**, **Ethereum (BRL)** e **Solana (BRL)**.

---

## 2. Aprimoramento de Responsividade (Tablet e Celular)

```
+-------------------------------------------------------------------+
|  [Desktop / PC (>= 901px)]                                        |
|  +--------------------+  +-------------------------------------+  |
|  | Espelho do Relógio |  | Ativos Monitorados (Grid 3 colunas) |  |
|  | + Controles        |  | + Configurações de Conexão          |  |
|  +--------------------+  +-------------------------------------+  |
+-------------------------------------------------------------------+

+-------------------------------------------------------------------+
|  [Tablet (601px - 900px)]                                         |
|  +-------------------------------------------------------------+  |
|  | Header compacto + Status                                    |  |
|  | Espelho do Relógio Centralizado + Ações Rápidas             |  |
|  | Ativos Monitorados (Grid 2 colunas fluido)                  |  |
|  | Configurações com Botões em Linhas Alinhadas                |  |
|  +-------------------------------------------------------------+  |
+-------------------------------------------------------------------+

+-------------------------------------------------------------------+
|  [Smartphone / Celular (<= 600px)]                                |
|  +-------------------------------------------------------------+  |
|  | Header verticalizado com toque confortável                  |  |
|  | Espelho 240x240 com margem ajustada                         |  |
|  | Seletor de layout (3 botões grandes para o polegar)        |  |
|  | Grid de Ativos (2 colunas compactas ou 1 coluna)            |  |
|  | Botões de conexão em formato 2x2 com ícones                 |  |
|  | Modal com rolagem suave que não é ocultada pelo teclado     |  |
|  +-------------------------------------------------------------+  |
+-------------------------------------------------------------------+
```

### Melhorias Específicas de Interface (CSS/HTML):
1. **Margens e Espaçamento Adaptativo:**
   * Reduzir `padding` do `body` de `24px` para `12px` em celulares, aproveitando 100% da largura útil da tela sem cortes.
2. **Grid de Ativos (`.assets-grid`):**
   * Em telas grandes: `minmax(200px, 1fr)`.
   * Em celulares e tablets pequenos: `minmax(140px, 1fr)`, exibindo 2 colunas organizadas e fáceis de tocar.
3. **Botões de Configuração e Ação:**
   * Em celulares, os botões `Testar Conexão`, `Auto-Detectar`, `Desmarcar Fotos` e `Reiniciar Relógio` passam a ocupar grade `2x2` com `flex: 1 1 calc(50% - 6px)`, eliminando quebras desiguais.
4. **Modal de Adição de Ativos:**
   * Limitar altura máxima para `85vh` com `overflow-y: auto`, garantindo que em tablets e celulares em orientação paisagem o usuário consiga rolar até o botão "Adicionar".
5. **Tags de Toque (*Touch Targets*):**
   * Área de clique mínima de 44px de altura nos botões para toque confortável no dedo.

---

## 3. Arquivos Propostos para Modificação

### 1. `market_service.js`
* Modificar `normalizeCryptoSymbol(rawSym, currency = 'USD')` para suportar `BRL`.

### 2. `server.js`
* Na rota `POST /api/assets`, passar `currency` para `normalizeCryptoSymbol(symbol, currency)`.

### 3. `public/index.html`
* Adicionar os botões de atalho para **Cardano (BRL)**, **Bitcoin (BRL)** e **Ethereum (BRL)**.
* Atualizar o placeholder e instrução do campo para indicar suporte a `ADABRL` e `BRL`.

### 4. `public/style.css`
* Adicionar regras responsivas completas para `@media (max-width: 900px)` e `@media (max-width: 600px)`.
* Otimizar tamanhos de fonte, cards de ativos, botões de ação e modal.

---

## 4. Plano de Verificação

1. **Teste Automatizado de API:**
   * Cadastrar ativo `ADA` com moeda `BRL` e verificar que o símbolo vira `ADABRL`.
   * Testar requisição direta na Binance para garantir que cotação em Real é calculada e formatada com `R$`.
2. **Teste de Responsividade:**
   * Testar layout em resoluções de desktop (1920x1080), tablet (768x1024) e mobile (375x667 e 412x915).
   * Verificar se não há barra de rolagem horizontal e se todos os botões são facilmente clicáveis.
