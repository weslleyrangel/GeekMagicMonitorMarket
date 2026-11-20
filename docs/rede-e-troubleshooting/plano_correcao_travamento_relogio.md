# Plano de Correção: Erro ao Iniciar Monitoramento no Relógio Físico

## Diagnóstico do Problema (Análise da Imagem e Logs)

Ao analisar a imagem enviada e cruzar com os testes em tempo real no relógio (`192.168.1.2`):

```
Status: Aviso: Relógio não respondeu no IP 192.168.1.2 
(Command 'curl.exe -s -H Connection: close --connect-timeout 3 -F imageFile=@temp_frame.jpg;type=image/jpeg;filename=file1.jpg http://192.168.1.2/upload')
```

### Por que o botão "Testar Conexão" dá verde, mas o monitoramento falha?

```mermaid
sequenceDiagram
    autonumber
    actor User as Usuário (Painel Web)
    participant Server as Servidor Node.js
    participant Clock as Relógio Físico (ESP8266)

    Note over User,Clock: Cenário 1: Teste de Conexão (Funciona de Imediato)
    User->>Server: Clica em "Testar Conexão"
    Server->>Clock: GET / (Apenas leitura leve do HTML)
    Clock-->>Server: HTTP 200 OK (em ~70ms)
    Server-->>User: ✅ Relógio conectado com sucesso!

    Note over User,Clock: Cenário 2: Iniciar Monitoramento (Origem do Travamento)
    User->>Server: Clica em "▶ INICIAR MONITORAMENTO"
    Server->>Clock: Dispara 6 GETs simultâneos (file1, file2, file3, file4, file5, themeselect)
    Note over Clock: ESP8266 tenta gravar 6 estados na memória Flash de uma só vez (sobrecarregado)
    Server->>Clock: Imediato: curl.exe upload POST temp_frame.jpg (18 KB) com timeout de 3s
    Note over Clock: Relógio ainda ocupado processando a Flash; rejeita/atrasa conexão TCP
    Server-->>User: ❌ curl.exe timeout (código 28) -> Exibe aviso em vermelho!
```

### Causas Raízes Identificadas:

1. **Sobrecarga de Requisições na Inicialização (`cleanClockSlots`):**
   No arquivo `server.js`, ao clicar em iniciar, a função `cleanClockSlots` envia 6 requisições consecutivas sem qualquer pausa para desmarcar as fotos de fábrica. O microcontrolador ESP8266 do relógio precisa gravar essas alterações na sua memória Flash interna; ao receber tantas conexões seguidas, sua pilha TCP (*lwIP*) esgota as portas temporariamente.
2. **Timeout de Conexão Muito Estrito (`--connect-timeout 3`):**
   No `uploader.js`, o `curl.exe` foi configurado com `--connect-timeout 3`. Quando o relógio está terminando de gravar os slots de fotos ou decodificando a tela anterior, ele leva ~4 segundos para aceitar uma nova conexão TCP. O `curl.exe` desiste aos 3 segundos exatos (código 28).
3. **Tamanho Excessivo do JPEG (`18 KB`):**
   O `renderer.js` gera imagens JPEG na qualidade padrão máxima (`~18 KB`). O firmware original do relógio opera idealmente com imagens de **3 KB a 6 KB** (qualidade 0.70). Imagens pesadas demoram mais para serem gravadas na memória SPIFFS do relógio e bloqueiam o loop do display.
4. **Instâncias Múltiplas Concorrentes:**
   Ao rodar `Iniciar_Monitor.bat` tendo outro processo em execução anterior, dois servidores passam a disputar o envio de imagens para o relógio, causando colisões e *ECONNRESET*.

---

## Proposta de Mudanças

### 1. Camada de Envio (`uploader.js`)
#### [MODIFY] `uploader.js`
- Aumentar `--connect-timeout` de `3` para `6` segundos e tempo limite global `-m` para `10` segundos.
- No `cleanClockSlots`, adicionar um intervalo suave de `200ms` entre cada chamada HTTP para dar tempo ao ESP8266 salvar na Flash sem congelar.
- Tratar o código de encerramento do `curl.exe`: reconhecer resposta positiva do relógio mesmo quando o firmware encerrar a conexão antes de esgotar o buffer de resposta.

### 2. Camada de Renderização (`renderer.js`)
#### [MODIFY] `renderer.js`
- Ajustar `canvas.toBuffer('image/jpeg', { quality: 0.72 })`.
- Isso reduz o peso do arquivo de **18 KB** para aproximadamente **5 KB** (redução de ~70% no tráfego), mantendo a fidelidade visual cristalina na tela de 240×240 e permitindo que o relógio grave a imagem em menos de 100ms.

### 3. Ciclo de Monitoramento (`server.js`)
#### [MODIFY] `server.js`
- No `/api/start`, adicionar uma pausa segura de `1.5s` após `cleanClockSlots` antes do primeiro envio de imagem.
- Isso garante que o relógio conclua a transição para o Modo Foto antes de receber o primeiro frame de cotação.

### 4. Inicializador (`Iniciar_Monitor.bat`)
#### [MODIFY] `Iniciar_Monitor.bat`
- Encerrar qualquer processo Node zumbi prévio na porta 3333 antes de subir o servidor, prevenindo concorrência duplicada contra o IP do relógio.

---

## Plano de Verificação

### Testes Manuais
1. **Reinício Físico do Relógio:**
   - Desconectar e reconectar o cabo de energia USB do relógio para garantir que o microcontrolador inicie com memória limpa.
2. **Execução pelo Atalho Oficial:**
   - Executar `Iniciar_Monitor.bat` diretamente (fora da IDE).
3. **Validação do Fluxo:**
   - Clicar em "Testar Conexão" -> Deve retornar verde com tempo de resposta ágil.
   - Clicar em "▶ INICIAR MONITORAMENTO":
     - O relógio deve receber o comando de limpeza de slots com pausas seguras.
     - A primeira imagem compactada (~5KB) deve carregar em ~1-2 segundos.
     - O visor físico do relógio deve trocar para o gráfico financeiro.
     - O status no painel deve permanecer com `Status: Atualizado em [Horário]` e `Avisos: Nenhum` (verde).
