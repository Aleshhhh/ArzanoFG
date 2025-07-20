# Dockerfile

# Fase 1: Installazione delle dipendenze
FROM node:20-alpine AS deps
WORKDIR /app

# Copia package.json e package-lock.json
COPY package.json ./
# Invece di package-lock.json, npm e Next.js potrebbero usare yarn.lock o pnpm-lock.yaml. Adatta se necessario.
# COPY package-lock.json ./ 

# Installa le dipendenze
RUN npm install

# Fase 2: Build dell'applicazione
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Esegui il build di Next.js
RUN npm run build

# Fase 3: Immagine di produzione
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copia l'output standalone dalla fase di build
COPY --from=builder /app/.next/standalone ./
# Copia la cartella static da .next
COPY --from=builder /app/.next/static ./.next/static


# La porta di default esposta da Next.js è la 3000
EXPOSE 3000

# Il comando per avviare l'applicazione
CMD ["node", "server.js"]
