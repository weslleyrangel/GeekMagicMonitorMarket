# De onde vieram essas imagens e por que estão aparecendo?

## 1. Origem das Imagens
> [!IMPORTANT]
> **Essas imagens NÃO foram baixadas por mim e NÃO vieram da internet pelo nosso script.**
> Elas são as **fotos e GIFs de demonstração que vêm pré-gravados de fábrica na memória interna (flash) do seu relógio**, colocadas pelo fabricante chinês no AliExpress para testar a tela antes da venda.

O relógio possui 5 "gavetas" de fotos na memória:
* `file1` (onde o nosso script grava as cotações financeiras em tempo real)
* `file2` (foto de demonstração de fábrica)
* `file3` (foto de demonstração de fábrica)
* `file4` (foto de demonstração de fábrica)
* `file5` (foto de demonstração de fábrica)

Como o aparelho vem de fábrica com as 5 gavetas marcadas como ativas, quando ele entra no modo de foto ele fica passando um "slideshow" que mistura a tela de cotações com as imagens antigas que já estavam salvas nele!

---

## 2. Como o nosso sistema gera as imagens?
O script que criamos em `D:\Contudos gerais\Projetos\GeekMagicMonitor` **não usa imagens prontas**:
* Ele consulta a API da Binance e Yahoo Finance.
* Pega os números reais do preço e da variação percentual.
* Desenha em tempo real um quadro de 240x240 pixels com o nome do ativo, o preço em destaque, a cor verde/vermelha e o mini-gráfico de tendência.
* Envia esse quadro desenhado diretamente para o relógio.

---

## 3. Como deixar APENAS as cotações e sumir com as fotos de fábrica:
Para o relógio parar de exibir as fotos antigas de fábrica:

1. No navegador, acesse a página de fotos do relógio:  
   👉 `http://192.168.1.2/photo`
2. Você verá as caixas de seleção:
   * **`file1-switch`:** ✅ **Deixe marcado** (este é o canal onde o nosso monitor atualiza as cotações).
   * **`file2-switch`:** ❌ **Desmarque**
   * **`file3-switch`:** ❌ **Desmarque**
   * **`file4-switch`:** ❌ **Desmarque**
   * **`file5-switch`:** ❌ **Desmarque**
3. Pronto! Ao desmarcar as opções 2, 3, 4 e 5, o relógio eliminará as imagens de fábrica e exibirá **exclusivamente as telas de monitoramento financeiro** geradas pelo seu sistema.
