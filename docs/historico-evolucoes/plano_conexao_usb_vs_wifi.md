# Análise Técnica: Conexão Direta por Cabo USB vs Wi-Fi

## 1. O cabo USB pode enviar dados para o sistema atual de fábrica?

> [!WARNING]
> **No firmware original de fábrica: NÃO.**
> Fizemos testes diretos na porta serial `COM7` do seu relógio e analisamos o código do GeekMagic. No sistema original que vem instalado nele:
> * A porta USB serve **apenas para alimentação de energia**, saída de logs de texto na inicialização e **gravação/atualização de firmware** via modo de flash.
> * O sistema original **não possui um receptor de comandos de tela na porta serial**. Os desenvolvedores da GeekMagic programaram o aparelho para receber imagens **exclusivamente através do servidor Web Wi-Fi** (`POST /doUpload`).

---

## 2. Seria possível fazer por USB trocando o firmware?

**Tecnicamente sim, mas com alto custo de perda de recursos:**
* Seria necessário compilar um **firmware customizado** (em C++/Arduino) e gravar no chip ESP8266 usando a porta `COM7`.
* **Desvantagem crítica:** Isso **apagaria completamente o sistema original de fábrica** do relógio (você perderia os temas originais, a interface web de configuração e o clima nativo). Por isso, a própria comunidade internacional do GeekMagic **não recomenda** essa troca e sempre utiliza a API via rede.

---

## 3. Qual é a melhor saída para resolver o seu caso?

Como o sistema que criamos no seu PC já está pronto e funcionando perfeitamente (buscando cotações e desenhando os gráficos 240x240), só precisamos que os dados cheguem até o relógio. 

Aqui estão as **duas soluções mais práticas e sem riscos**:

### Solução A: Usar o Celular como "Antena Wi-Fi" do PC (Mais rápida — Sem mexer no roteador)
Como o seu celular já está no Wi-Fi e consegue conversar com o relógio:
1. Conecte o seu celular ao computador pelo cabo USB (mantendo o celular conectado no Wi-Fi `brisa-1291089`).
2. No celular, vá em **Configurações > Ponto de Acesso / Conexões** e ative **Ancoragem USB** (Compartilhamento por USB).
3. O computador receberá uma conexão de rede dentro do Wi-Fi do relógio.
4. O aplicativo no PC conseguirá enviar as cotações imediatamente!

---

### Solução B: Desativar o "Isolamento de AP" no Roteador da Brisa (Definitiva)
Essa configuração existe em todos os roteadores da Brisa e resolve de forma permanente:
1. No próprio celular, abra o navegador e entre em `http://192.168.1.1`.
2. Acesse as configurações de **Wi-Fi (2.4 GHz) > Avançado**.
3. Desative a opção **Isolamento de AP** (ou *AP Isolation*).
4. Ao desativar, o roteador passa a deixar o cabo do PC se comunicar com o Wi-Fi do relógio.
