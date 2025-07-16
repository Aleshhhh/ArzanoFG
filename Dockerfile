# Fase 1: Installazione delle dipendenze
FROM node:20-alpine AS deps
WORKDIR /app

# Copia package.json e package-lock.json
COPY package.json package-lock.json* ./

# Installa le dipendenze
RUN npm install

# Fase 2: Build dell'applicazione
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Esegui il build di Next.js
RUN npm run build

# Fase 3: Esecuzione
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copia l'output del build dalla fase builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Espone la porta su cui l'app Next.js è in esecuzione
EXPOSE 3000

# Avvia l'applicazione
CMD ["npm", "start", "-p", "3000"]
