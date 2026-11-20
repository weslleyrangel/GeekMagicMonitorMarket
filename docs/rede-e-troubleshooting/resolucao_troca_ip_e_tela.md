# Solução: Mudança Dinâmica de IP e Ativação da Tela no Relógio

## 1. Por que o IP muda toda vez que o relógio reinicia?
O roteador da Brisanet está configurado com **DHCP dinâmico sem reserva de IP**:
* Cada vez que o relógio liga ou perde sinal, ele pede um endereço novo para o roteador, que sorteia um IP vago na rede (por isso ele variou entre `.18` e `.2`).

### Como resolvemos no sistema (Varredura Automática):
Podemos fazer o nosso painel do monitor ter um botão **"🔍 Localizar Relógio Automaticamente"**:
* O sistema faz uma varredura rápida na rede em busca do aparelho que responde como *Smart Weather Clock* e atualiza o IP sozinho, sem você precisar adivinhar!

---

## 2. Por que o relógio ainda não trocou a tela física?
No firmware original desse modelo de relógio, a imagem que enviamos já foi gravada com sucesso na memória dele (`file1.jpg`). Porém, o relógio precisa receber o comando visual para sair da tela do astronauta/clima e entrar no **Modo Foto (Photo Mode)**:

### Como fazer o visor físico mudar para a tela de cotações:

#### Método A: Pelo Sensor de Toque Físico no Aparelho
A maioria dos modelos GeekMagic / SmallTV possui um **sensor de toque capacitivo no topo da carcaça**:
* Dê um leve toque com o dedo na **parte de cima do relógio**.
* Ele alternará as telas: **Relógio Clássico -> Astronauta -> Modo Foto (Cotações) -> Relógio de Ponteiro**.

#### Método B: Pela Página Web Oficial do Relógio
1. No seu navegador, acesse a página do relógio: 👉 `http://192.168.1.2/`
2. No primeiro menu onde diz **"theme"**:
   * Mude o menu de **Classic** para **Photo**.
3. O visor mudará imediatamente para a exibição das fotos e cotações financeiras!

#### Método C: Pelo Atalho Foto
1. Acesse: 👉 `http://192.168.1.2/photo`
2. Marque a caixinha do **"file1-switch"** (ela ativa a exibição do primeiro arquivo gravado).
3. O gráfico de Bitcoin/Mercado passará a ser exibido na tela!
