# Plano de Resolução: Comunicação do PC com o IP do Relógio (192.168.1.18)

## Diagnóstico do Problema
* **No Celular (Wi-Fi):** O IP `http://192.168.1.18` abre perfeitamente porque tanto o celular quanto o relógio estão conectados diretamente à rede sem fio (`brisa-1291089`).
* **No Computador (Cabo Ethernet):** O computador não consegue alcançar o relógio devido a duas barreiras comuns de isolamento de rede:
  1. **Perfil de Rede do Windows:** A conexão Ethernet do PC está definida como **"Pública"** (`NetworkCategory: Public`), o que faz o Firewall do Windows bloquear conexões com outros dispositivos na rede local.
  2. **Isolamento de AP (Roteador da Brisa):** Roteadores de operadora costumam vir com o recurso *AP Isolation* (ou *Isolamento de Clientes*) ativado, que impede que a rede cabeada (LAN) converse com os aparelhos conectados no Wi-Fi (WLAN).

---

## Passo a Passo para Resolver

### Passo 1: Mudar a Rede do Windows de "Pública" para "Privada"
Isso orienta o Firewall do Windows a permitir a comunicação com dispositivos da sua casa (impressoras, relógios, smart TVs):

1. No seu teclado, pressione as teclas **`Windows + I`** para abrir as **Configurações**.
2. Clique em **Rede e Internet** no menu lateral esquerdo.
3. Clique em **Ethernet** (sua conexão com fio).
4. Onde diz **"Tipo de perfil de rede"**, selecione a opção **Privada** (em vez de Pública).

---

### Passo 2: Desativar o "Isolamento de AP" no Roteador (Se o Passo 1 não for suficiente)
Se após o Passo 1 o PC ainda não conseguir falar com o relógio, o roteador da Brisa está separando o cabo do Wi-Fi:

1. No navegador (pode ser pelo celular ou pelo PC), acesse o endereço do roteador:  
   👉 `http://192.168.1.1`
2. Faça login com o usuário e senha do seu roteador (geralmente constam na etiqueta embaixo do aparelho).
3. Vá no menu **Wi-Fi / Rede Sem Fio (2.4 GHz)** -> **Configurações Avançadas**.
4. Procure pela opção:
   * **Isolamento de AP** (ou **AP Isolation**, **Isolamento de Clientes**, **WLAN Partition**).
5. Mude para **Desativar** (Disabled) e clique em **Salvar / Aplicar**.

---

### Solução Alternativa Sem Mexer no Roteador: Ancoragem USB pelo Celular
Se você não quiser mexer nas configurações do roteador da Brisa:
1. Conecte seu celular ao computador com um cabo USB (o celular conectado ao Wi-Fi `brisa-1291089`).
2. No celular, vá em **Configurações > Ponto de Acesso / Conexões > Ancoragem USB** (ou *Compartilhamento de Internet por USB*).
3. O computador receberá uma placa de rede virtual que está dentro do mesmo Wi-Fi do relógio.
4. O monitoramento funcionará instantaneamente!
