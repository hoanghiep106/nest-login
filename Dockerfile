FROM node:latest

WORKDIR /code/

COPY package.json yarn.lock ./

# install dependencies
RUN yarn install --frozen-lockfile --ignore-scripts

COPY . .

RUN yarn remove bcrypt
RUN yarn add bcrypt

RUN yarn build

CMD ["yarn", "start:prod"]
