FROM node:24.11-alpine as build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --legacy-peer-deps

COPY . .

FROM node:24.11-alpine as start

WORKDIR /app

COPY --from=build /app /app

EXPOSE 4000

CMD npx prisma migrate dev && npm run start:dev
