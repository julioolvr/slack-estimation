FROM node:16 AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:16
WORKDIR /usr/src/app
COPY package.json .
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/build ./build
EXPOSE 3000
CMD ["npm", "run", "run"]
