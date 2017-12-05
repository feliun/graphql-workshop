const express = require('express');
const mongodb = require('mongodb');
const swapi = require('swapi-node');
const initSystem = require('./system');

const app = express();
const args = process.argv;
const shouldMock = (args.length === 3 && args[2] === '--mock');
const swapiMock = {
  get: (link) => ({ name:link })
};
const api = shouldMock ? swapiMock : swapi;

const config = {
  app: {
    port: process.env.PORT || 8080
  },
  mongo: {
    options: {
      auth: {
        user: process.env.MONGO_DB_APP_USERNAME || 'node',
        password: process.env.MONGO_DB_APP_PASSWORD || 'node'
      },
      keepAlive: true,
      reconnectTries: 30,
      socketTimeoutMS: 0
    }
  }
};

const system = initSystem({ mongodb, app, swapi: api, config });
system.start()
  .then(() => console.log(`Server listening at localhost:${config.app.port}`))
  .catch(console.error);