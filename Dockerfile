FROM node:14.1.0-alpine3.11

WORKDIR /usr/src/app

COPY . .

RUN npm install && \
  npm ci --only=production && \
  npm run webpack-build && \
  rm -rf node_modules src webpack.config.js package.json package-lock.json

EXPOSE 3001

ARG MONGODB_HOSTNAME
ARG MONGODB_DATABASE
ARG PORT

CMD PORT=$PORT MONGODB_HOSTNAME=$MONGODB_HOSTNAME MONGODB_DATABASE=$MONGODB_DATABASE node build
