# Passo a Passo: Rodando o GeekMagic Monitor no Tablet com Termux

O código do seu projeto já foi **enviado com sucesso para o seu GitHub**:
🔗 **`https://github.com/weslleyrangel/GeekMagicMonitorMarket.git`**

Como você já executou `pkg install nodejs git curl -y` no Termux, siga exatamente os passos abaixo diretamente no seu tablet:

---

## Passo 1: Clonar o Projeto no Termux

No aplicativo Termux do seu tablet, digite (ou copie e cole) os dois comandos abaixo:

```bash
git clone https://github.com/weslleyrangel/GeekMagicMonitorMarket.git
cd GeekMagicMonitorMarket
```

---

## Passo 2: Instalar as Dependências

Ainda dentro da pasta do projeto no Termux, execute:

```bash
npm install
```
> Isso instalará o Express, o Canvas e os módulos de cotação diretamente na arquitetura do seu tablet.

---

## Passo 3: Impedir que o Android suspenda o Termux em segundo plano

Por padrão, quando você abre outro app ou bloqueia a tela, o Android pode colocar o Termux para dormir para economizar bateria. Para que o monitor de mercado rode 24 horas sem parar, execute:

```bash
termux-wake-lock
```
*(O Android pode exibir uma notificação dizendo que o Termux está mantendo o processador ativo. Isso é normal e garante que o relógio continue recebendo as cotações).*

---

## Passo 4: Iniciar o Monitor no Tablet

Inicie o servidor:

```bash
node server.js
```

Você verá a mensagem de sucesso:
```text
=======================================================
🚀 GeekMagic Market Monitor rodando em: http://localhost:3333
=======================================================
```

---

## Passo 5: Acessar o Painel no Navegador do Tablet

1. Abra o **Google Chrome** (ou navegador de sua preferência) no tablet.
2. Acesse:
   👉 **`http://localhost:3333`**
3. O painel completo abrirá com a nova interface adaptada para tablets!
4. Toque nos **3 pontinhos** do Chrome e selecione **"Adicionar à tela inicial"** ou **"Instalar Aplicativo"**. Ele criará um ícone direto como se fosse um app instalado.

---

## Dica Pro: Como rodar em segundo plano no Termux

Se você quiser continuar usando o Termux para outras coisas ou não quiser ver o terminal aberto, você pode iniciar o servidor em background:

```bash
nohup node server.js > monitor.log 2>&1 &
```

* Para ver se está rodando: `ps aux | grep node`
* Para parar o servidor: `pkill -f node`
