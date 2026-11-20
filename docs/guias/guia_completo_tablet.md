# Guia Completo: Como Rodar e Usar o GeekMagic Monitor no Tablet

Existem **duas maneiras diferentes** de usar o sistema no seu tablet. Abaixo você entenderá como funciona cada uma, os passos práticos para configurar e exatamente quais comandos funcionam em cada cenário.

---

## Comparativo Rápido das 2 Opções

| Recurso / Comando | Opção 1: Tablet como Painel (PC ligado) | Opção 2: Servidor 100% no Tablet (PC desligado) |
| :--- | :---: | :---: |
| **Complexidade de Instalação** | 🟢 **Zero** (abre no navegador) | 🟡 **Média** (instala Termux + Node.js) |
| **PC precisa ficar ligado?** | Sim | **Não** (independente do PC) |
| **Cotações em tempo real (Binance, B3, Câmbio)** | ✅ 100% Funciona | ✅ 100% Funciona |
| **Envio para o Relógio via Wi-Fi** | ✅ 100% Funciona | ✅ 100% Funciona |
| **Troca de Layouts (Fintech, Minimal, Trader)** | ✅ 100% Funciona | ✅ 100% Funciona |
| **Desmarcar Fotos de Fábrica Automaticamente** | ✅ 100% Funciona | ✅ 100% Funciona |
| **Auto-Detectar IP do Relógio** | ✅ 100% Funciona | ✅ 100% Funciona |
| **Reinício do Relógio via Wi-Fi (`/restart`)** | ✅ 100% Funciona | ✅ 100% Funciona |
| **Reinício por Cabo USB Físico (`COM7`)** | ✅ Funciona (PC conectado ao cabo) | ⚠️ Requer adaptador OTG USB-C |
| **Transformar em "App" na Tela Inicial (PWA)** | ✅ Sim (ícone direto na tela) | ✅ Sim (ícone direto na tela) |

---

## OPÇÃO 1: Usar o Tablet como Controle Remoto (Mais Fácil e Recomendada)

Nesta opção, o computador processa as cotações e o envio, e o seu tablet funciona como um **painel de comando touch** elegante ao lado da sua mesa.

### Como Acessar:
1. Certifique-se de que o PC está ligado com o monitor rodando e conectado ao mesmo Wi-Fi do tablet (`brisa-1291089`).
2. No tablet, abra o navegador (Chrome, Safari ou Edge).
3. Na barra de endereços, digite o IP local do seu computador:
   👉 **`http://192.168.1.8:3333`**
4. O painel completo abrirá com a nova interface adaptada para tablet!

### Como transformar em um "App" no Tablet (Sem barra de navegador):
* **No Android (Google Chrome):**
  1. Toque nos **3 pontinhos** no canto superior direito do navegador.
  2. Toque em **"Adicionar à tela inicial"** ou **"Instalar aplicativo"**.
  3. Um ícone exclusivo chamado **"Monitor GeekMagic"** será criado na área de trabalho do seu tablet. Ao abrir por ele, a barra de navegação some e ele se comporta exatamente como um aplicativo nativo!
* **No iPad (Safari):**
  1. Toque no botão de **Compartilhar** (quadrado com seta para cima).
  2. Escolha **"Adicionar à Tela de Início"**.

---

## OPÇÃO 2: Rodar o Servidor 100% Dentro do Tablet Android (Sem precisar do PC)

Se você quiser desligar o computador e deixar o tablet funcionando como a central permanente que envia as cotações para o relógio:

```
[Internet: Binance / B3]
         │
         ▼ (Wi-Fi)
[Tablet Android rodando Node.js no Termux]
         │
         ▼ (Wi-Fi local: 192.168.1.2)
[Relógio GeekMagic na tomada]
```

### O que acontece com o Relógio?
* O relógio não precisa mais ficar ligado na USB do computador: você pode ligar o cabo USB dele em **qualquer carregador de tomada de celular**.
* O tablet e o relógio conversam diretamente através da rede Wi-Fi da sua casa.

### Passo a Passo para Configurar no Tablet Android:

#### 1. Instalar o Termux
O Termux é um terminal Linux gratuito e seguro para Android.
* Baixe e instale o **Termux** pelo site oficial [F-Droid](https://f-droid.org/packages/com.termux/) (evite a versão antiga da Play Store, pois a da F-Droid é a versão atualizada).

#### 2. Instalar o Node.js no Tablet
Abra o aplicativo Termux e digite os seguintes comandos (pressione Enter após cada um):
```bash
pkg update && pkg upgrade -y
pkg install nodejs git curl -y
```

#### 3. Copiar a Pasta do Projeto para o Tablet
Você pode transferir a pasta `GeekMagicMonitor` do PC para o tablet via cabo USB, Google Drive, ou clonar direto no Termux.

#### 4. Instalar as dependências e Iniciar
Dentro da pasta do projeto no Termux:
```bash
npm install
node server.js
```

#### 5. Abrir no Tablet
Abra o navegador do tablet em `http://localhost:3333` e pronto! O monitor estará rodando de forma 100% autônoma, sem depender de nenhum computador.

---

## O que muda nos comandos ao rodar no Tablet?

1. **Comandos Wi-Fi (Cotações, Upload, Rotação, Limpeza de slots):**
   * **Funcionam exatamente igual.** O tablet envia as requisições HTTP para a Binance e para o IP do relógio (`192.168.1.2`) pela rede local com a mesma velocidade do PC.
2. **Reinício do Relógio:**
   * **Pela rede Wi-Fi:** O comando de reiniciar o sistema (`GET /restart`) funciona perfeitamente pelo tablet.
   * **Pelo cabo USB (`COM7`):** Como o cabo USB não estará ligado na porta serial do PC, o pulso elétrico por hardware (DTR/RTS) não atua. Mas o reinício via comando de rede funciona normalmente sempre que o relógio estiver conectado ao Wi-Fi.

---

## Qual opção escolher?

* Se você já usa o computador durante o dia e quer apenas a comodidade de controlar a tela pelo tablet: **Opção 1 (PWA no navegador)** é instantânea, não precisa instalar nada e já está pronta agora mesmo.
* Se você quer deixar o relógio funcionando 24 horas por dia na sua estante com o computador desligado: **Opção 2 (Termux no tablet)** é a melhor escolha.
