# Imagem base oficial do Node.js 20 LTS (Slim / Debian)
FROM node:20-slim

# Metadados
LABEL maintainer="Weslley Bezerril"
LABEL description="GeekMagic SmallTV Market Monitor - Docker Image"

# Instala o curl (usado no envio para o relógio e healthcheck) e certificados SSL
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Diretório de trabalho
WORKDIR /app

# Copia arquivos de definição de pacotes primeiro para aproveitar o cache de camadas do Docker
COPY package*.json ./

# Instala apenas dependências de produção
RUN npm ci --omit=dev

# Copia o restante do código-fonte
COPY . .

# Expõe a porta do painel web
EXPOSE 3333

# Monitoramento de saúde do container
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3333/api/status || exit 1

# Inicializa o servidor Node.js
CMD ["node", "server.js"]
