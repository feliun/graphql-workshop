const express = require('express');
const mongodb = require('mongodb');
const swapi = require('swapi-node');
const initGraphQL = require('./initGraphQL');

const port = process.env.PORT || 8080;
const app = express();
const args = process.argv;
const shouldMock = (args.length === 3 && args[2] === '--mock');
const swapiMock = {
  get: (link) => ({ name:link })
};
const api = shouldMock ? swapiMock : swapi;

const options = {
  auth: {
    user: process.env.MONGO_DB_APP_USERNAME || 'node',
    password: process.env.MONGO_DB_APP_PASSWORD || 'node'
  },
  keepAlive: true,
  reconnectTries: 30,
  socketTimeoutMS: 0
};

// TODO build a second endpoint to serve a schema
// with the simple graphQL format

mongodb.connect('mongodb://127.0.0.1/starwars', options)
  .then((mongo) => {
    app.listen(port);
    console.log('Connected to mongo DB!');
    initGraphQL({ mongo, swapi: api })(app);
    console.log(`Server listening at localhost:${port}`);
  })
  .catch(console.error);