FROM node:14.2.0-alpine3.11

WORKDIR /usr/src/app

COPY . .

RUN apk add --update -qq make python3 g++ && \
  npm install && \
  npm ci --only=production && \
  npm run webpack-build && \
  rm -rf node_modules src webpack.config.js package.json package-lock.json

EXPOSE 3001

ARG MONGODB_URI
ARG PORT
ARG IP
ARG JWT_SECRET

CMD IP=$IP \
  PORT=$PORT \
  MONGODB_URI=$MONGODB_URI \
  JWT_SECRET=$JWT_SECRET \
  node build
