FROM node:alpine

WORKDIR /src/app

COPY . /src/app

ENV NODE_OPTIONS=--openssl-legacy-provider

RUN npm install -g @angular/cli

RUN npm install

CMD ["ng", "serve", "--host", "0.0.0.0"]
