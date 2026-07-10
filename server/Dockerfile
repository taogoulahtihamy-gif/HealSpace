FROM node:20-bookworm-slim

WORKDIR /app

ENV NODE_ENV=development

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ca-certificates \
    openssl \
  && rm -rf /var/lib/apt/lists/*

RUN chown -R node:node /app

USER node

COPY --chown=node:node package*.json ./

RUN npm ci

COPY --chown=node:node prisma ./prisma

RUN npx prisma generate

COPY --chown=node:node . .

RUN chmod +x scripts/docker-entrypoint.sh

EXPOSE 5000

ENTRYPOINT ["./scripts/docker-entrypoint.sh"]

CMD ["npm", "run", "dev"]
