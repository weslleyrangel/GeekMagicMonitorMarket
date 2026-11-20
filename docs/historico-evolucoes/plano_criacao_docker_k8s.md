# Plano de Implementação: Docker & Kubernetes para o GeekMagic Market Monitor

## Objetivo
Criar os arquivos de conteinerização e orquestração para permitir que o **GeekMagic Market Monitor** seja executado de forma contínua e autônoma em servidores locais, mini-PCs, Raspberry Pi, Docker Desktop ou clusters Kubernetes (K3s / MicroK8s / K8s).

---

## User Review Required

> [!NOTE]
> No Docker Compose, utilizaremos `network_mode: "host"` por padrão no ambiente Linux/Homelab para permitir comunicação transparente com o relógio físico na LAN (`192.168.1.2`). No Windows/macOS (onde o host networking possui limitações do Docker Desktop), incluímos o mapeamento de portas `- "3333:3333"`.

> [!IMPORTANT]
> O arquivo `config.json` será mapeado como um volume externo persistente para garantir que qualquer ativo ou layout configurado pelo tablet permaneça salvo permanentemente.

---

## Arquivos Propostos

### 1. `[NEW] Dockerfile`
- Base: `node:20-slim`.
- Instalação de dependências do sistema: `curl` e `ca-certificates`.
- Execução como usuário não-root (ou gerenciado) com `npm ci --omit=dev`.
- `HEALTHCHECK` integrado consultando `/api/status` a cada 30 segundos.

### 2. `[NEW] .dockerignore`
- Impede que `node_modules`, `.git`, arquivos temporários de imagens (`temp_*.jpg`) e logs locais sejam copiados para dentro da imagem durante o build.

### 3. `[NEW] docker-compose.yml`
- Definição do serviço `geekmagic-monitor`.
- Montagem do volume de persistência para `./config.json:/app/config.json`.
- Política de reinício `restart: unless-stopped`.

### 4. `[NEW] k8s/deployment.yaml`
- Manifesto Kubernetes completo contendo:
  - `ConfigMap` com a configuração inicial de ativos.
  - `Deployment` com réplica única (1 pod) para evitar concorrência no IP do relógio.
  - `Service` expondo a porta `3333` via `NodePort: 30333`.
  - `livenessProbe` e `readinessProbe` monitorando `/api/status`.

### 5. `[MODIFY] README.md`
- Adição da seção **"Executando com Docker e Docker Compose"** com exemplos práticos de comandos.

---

## Plano de Verificação

1. **Validação de Sintaxe Docker e Compose:**
   - Conferência das instruções do `Dockerfile` e `.dockerignore`.
   - Validação da estrutura YAML do `docker-compose.yml` e `k8s/deployment.yaml`.
2. **Teste de Execução Local:**
   - Garantir que o `server.js` continue funcionando 100% tanto nativamente quanto conteinerizado.
