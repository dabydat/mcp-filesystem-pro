# === Stage 1: Builder ===
FROM oven/bun:1-alpine AS builder

ARG VERSION=0.0.0
ARG GITHUB_SHA=unknown

WORKDIR /app

COPY package.json tsconfig.json ./
COPY src/ ./src/
COPY tests/ ./tests/

RUN bun install && bun run build

# === Stage 2: Runtime ===
FROM oven/bun:1-alpine AS runtime

ARG VERSION=0.0.0
ARG GITHUB_SHA=unknown

WORKDIR /app

RUN apk add --no-cache curl git \
    && addgroup -S app \
    && adduser -S app -G app \
    && rm -rf /var/cache/apk/*

COPY package.json .
RUN bun install --production \
    && rm -rf ~/.bun

COPY --from=builder --chown=app:app /app/dist ./dist
COPY --from=builder --chown=app:app /app/node_modules ./node_modules
COPY --from=builder --chown=app:app /app/tests ./tests
COPY --from=builder --chown=app:app /app/src ./src

USER app

STOPSIGNAL SIGTERM

ENTRYPOINT ["bun", "run", "dist/index.js"]

LABEL org.opencontainers.image.version=$VERSION
LABEL org.opencontainers.image.source=https://github.com/alejandro-builder/mcp-filesystem-pro
LABEL org.opencontainers.image.revision=$GITHUB_SHA
LABEL org.opencontainers.image.licenses=MIT
LABEL org.opencontainers.image.description="Production-grade MCP server for filesystem and git operations"
LABEL org.opencontainers.image.tools.kubernetes.io/displayname="mcp-filesystem-pro"
LABEL org.opencontainers.image.security.policy="臣 This image follows OCI best practices"
LABEL org.opencontainers.image.author="alejandro-builder"
