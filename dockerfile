FROM node:lts-alpine3.23

RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

COPY . .

CMD ["pnpm","run","dev"]