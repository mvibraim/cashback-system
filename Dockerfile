FROM node:14.0.0-alpine3.11

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 3001

ARG MONGODB_HOSTNAME
ARG MONGODB_DATABASE
ARG PORT

CMD PORT=$PORT MONGODB_HOSTNAME=$MONGODB_HOSTNAME MONGODB_DATABASE=$MONGODB_DATABASE node src
