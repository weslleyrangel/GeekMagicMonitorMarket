# 📚 Base de Conhecimento e Documentação Técnica

Bem-vindo à documentação técnica do **GeekMagic Market Monitor**. Aqui estão reunidos todos os guias, estudos arquiteturais, análises de rede e planos de evolução desenvolvidos para o projeto.

---

## 🧭 Sumário da Documentação

### 📖 1. Guias Práticos
* [Guia Completo: Tablet como Monitor Dedicado](guias/guia_completo_tablet.md) — Como transformar seu tablet Android em uma central de monitoramento sem fio.
* [Passo a Passo: Termux (Android)](guias/passo_a_passo_termux.md) — Comandos para clonar, instalar dependências e rodar o servidor 24/7 no Termux com `termux-wake-lock`.

---

### 🏗️ 2. Arquitetura e Decisões Técnicas
* [Arquitetura Thin-Client Centralizada](arquitetura/arquitetura_monitor_centralizado.md) — Por que usar o Tablet/PC como cérebro e o GeekMagic como visor dedicado é a melhor escolha para expansão futura.
* [Estudo de Viabilidade de Firmwares Alternativos](arquitetura/plano_firmware_geekmagic.md) — Comparativo entre firmwares de fábrica, `smalltv-mod`, `ESPHome` e APIs JSON locais, incluindo processo de backup da Flash via `esptool.py`.
* [Plano Docker & Kubernetes](arquitetura/plano_docker_kubernetes_geekmagic.md) — Arquitetura de conteinerização com Docker e manifestos para Kubernetes (K3s/K8s).
* [Origem das Imagens e Renderização](arquitetura/origem_das_imagens.md) — Como o motor gráfico desenha os 3 layouts visuais a 240×240 pixels.

---

### 🌐 3. Rede, Conectividade e Resolução de Problemas
* [Diagnóstico: Wi-Fi vs Prioridade do Cabo de Rede](rede-e-troubleshooting/diagnostico_wifi_cabo.md) — Como o Windows gerencia a métrica de rota de adaptadores e como forçar a placa Wi-Fi.
* [Análise Brisanet: Bloqueio de Portas e Isolamento](rede-e-troubleshooting/analise_brisanet_solucoes.md) — Como contornar limitações de roteadores de operadoras com firmware bloqueado.
* [Resolução de Conexão e Descoberta de IP](rede-e-troubleshooting/resolucao_conexao_ip.md) — Varredura automática e diagnóstico de portas locais.
* [Resolução de Troca de IP e Seleção de Tema](rede-e-troubleshooting/resolucao_troca_ip_e_tela.md) — Como alternar o aparelho fisicamente para o Modo Foto.
* [Correção de Travamento de Porta e Pacing de Upload](rede-e-troubleshooting/plano_correcao_travamento_relogio.md) — Diagnóstico aprofundado do timeout do `curl.exe` e otimização de compressão JPEG de 18 KB para 7 KB.

---

### 📜 4. Histórico de Evolução do Projeto
* [Plano Inicial do Monitor de Mercado](historico-evolucoes/plano_monitoramento_mercado.md) — Especificação original da integração com a Binance e AwesomeAPI.
* [Criação dos 3 Novos Layouts Visuais](historico-evolucoes/plano_novos_layouts_e_tablet.md) — Fintech Clássico, Minimalista e Trader Pro.
* [Responsividade Mobile & Criptomoedas em Real](historico-evolucoes/plano_responsividade_e_brl.md) — Adaptação para telas pequenas e pares `ADABRL`, `BTCBRL`, etc.
* [Normalização Inteligente de Pares BRL](historico-evolucoes/plano_adicao_ativos_brl.md) — Mapeamento e normalização de tickers da Binance.
* [Criação de Dockerfile e Manifestos K8s](historico-evolucoes/plano_criacao_docker_k8s.md) — Plano de execução da conteinerização.
* [Walkthrough Fase 1: Layouts e Responsividade](historico-evolucoes/walkthrough_fase1_layouts.md) — Testes e validação da primeira fase.
* [Walkthrough Fase 2: Docker e Otimização de Performance](historico-evolucoes/walkthrough_fase2_docker.md) — Testes e validação da segunda fase.
