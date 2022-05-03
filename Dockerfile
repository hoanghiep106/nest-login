# Build
FROM node:14-alpine as builder
WORKDIR /app/

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfiles --ignore-scripts

COPY . .
RUN yarn build

# Run
FROM node:14-alpine as runner
WORKDIR /app/

RUN npm install -g pm2

USER node
COPY --from=builder --chown=node:node /app ./

CMD ["pm2-runtime", "start", "dist/main.js"]
