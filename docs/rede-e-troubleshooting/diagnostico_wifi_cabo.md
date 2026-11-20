# Diagnóstico: Wi-Fi Reconhecido vs Prioridade do Cabo de Rede

## 1. O Wi-Fi foi reconhecido?
**SIM! Reconhecido e conectado com sucesso:**
* **Dispositivo detectado:** `Realtek RTL8188FTV Wireless LAN 802.11n USB 2.0`
* **Rede conectada:** `brisa-1291089`
* **IP obtido via Wi-Fi:** `192.168.1.8`

---

## 2. Por que ainda não enviou os dados?
Você matou a charada: **como o cabo de rede ainda está plugado, o Windows dá prioridade máxima para o cabo** e ignora a placa Wi-Fi:
* No Windows, a conexão cabeada tem métrica de rota menor (prioridade 25) do que o Wi-Fi (prioridade 55).
* Toda vez que o aplicativo tenta enviar a tela para o IP `192.168.1.18`, o Windows insiste em mandar os pacotes pelo cabo de rede em vez da anteninha Wi-Fi.

---

## 3. O que fazer para ativar imediatamente:

1. **Desconecte o cabo de rede do computador** (basta puxar o conector RJ45 atrás do gabinete)  
   *(OU desative a interface Ethernet em Painel de Controle > Conexões de Rede).*
2. O computador passará a usar automaticamente a antena Wi-Fi (`192.168.1.8`), que já possui internet e está na mesma frequência do relógio.
3. Abra o painel no navegador: 👉 `http://localhost:3333`
4. Clique no botão **"Testar Conexão"** — agora aparecerá a confirmação verde!
5. Clique em **"▶ INICIAR MONITORAMENTO"** e veja as cotações aparecerem no relógio físico.
