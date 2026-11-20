# Walkthrough: Conteinerização com Docker e Orquestração Kubernetes

Os arquivos para execução conteinerizada do **GeekMagic Market Monitor** foram criados e estruturados no repositório.

---

## 1. O que foi adicionado:

### 1. `Dockerfile`
- Base oficial `node:20-slim`.
- Instalação de certificados de segurança e `curl` nativo para envio e health checks.
- Instalação limpa via `npm ci --omit=dev`.
- `HEALTHCHECK` automático checando `http://localhost:3333/api/status`.

### 2. `.dockerignore`
- Garante builds rápidos e imagens enxutas, ignorando `node_modules`, `.git`, logs e arquivos de imagens temporárias.

### 3. `docker-compose.yml`
- Serviço `geekmagic-monitor` configurado com `restart: unless-stopped`.
- Mapeamento da porta `3333:3333`.
- Volume de persistência: `./config.json:/app/config.json` (mantém as preferências salvas no disco do host).

### 4. `k8s/deployment.yaml`
- `Deployment` com réplica única para evitar colisões no microcontrolador.
- `hostNetwork: true` para visibilidade transparente da sub-rede local (`192.168.1.x`).
- Probes de integridade (`livenessProbe` e `readinessProbe`).
- `Service` do tipo `NodePort` mapeado na porta `30333`.

### 5. `README.md`
- Atualizado com as instruções oficiais de execução com Docker Compose e Kubernetes (`kubectl apply`).

---

## 2. Como usar:

* **Para subir via Docker Compose:**
  ```bash
  docker compose up -d --build
  ```
* **Para subir no Kubernetes:**
  ```bash
  kubectl apply -f k8s/deployment.yaml
  ```
* **Para acessar pelo tablet:**
  Basta abrir o navegador e digitar `http://IP_DO_SERVIDOR:3333` (ou porta `30333` se for Kubernetes NodePort).
