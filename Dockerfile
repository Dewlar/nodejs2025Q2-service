FROM node:24.11-alpine as build

WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npm ci
COPY . .
RUN npm run build


FROM node:24.11-alpine as production

WORKDIR /app

COPY --from=build /app/package*.json ./

RUN npm ci --only=production && \
  npm cache clean --force \

COPY --from=build /app/dist ./dist/
COPY --from=build /app/prisma ./prisma/
COPY --from=build /app/doc/api.yaml ./doc/api.yaml

EXPOSE 4000

CMD ["npm", "run", "start:dev:migrate"]
