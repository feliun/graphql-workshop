const express = require('express');
const graphqlHTTP = require('express-graphql');
const mongodb = require('mongodb');
const swapi = require('swapi-node');
const { GraphQLSchema, GraphQLObjectType, GraphQLInt, GraphQLList } = require('graphql');

const port = process.env.PORT || 8080;
const app = express();
const args = process.argv;
const shouldMock = (args.length === 3 && args[2] === '--mock');
const swapiMock = {
  get: (link) => ({ name:link })
};
const api = shouldMock ? swapiMock : swapi;

let schemas = {};
let controllers = {};

const vehiculeSchema = require('./models/vehicule/schema')();
const characterSchema = require('./models/character/schema')(schemas);
const filmSchema = require('./models/film/schema')(schemas);

schemas.vehicule = vehiculeSchema;
schemas.character = characterSchema;
schemas.film = filmSchema;

const characterQuery = require('./models/character/query')(schemas);
const filmQuery = require('./models/film/query')(schemas);

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: Object.assign(filmQuery, characterQuery)
  })
});

const options = {
  auth: {
    user: process.env.MONGO_DB_APP_USERNAME || 'node',
    password: process.env.MONGO_DB_APP_PASSWORD || 'node'
  },
  keepAlive: true,
  reconnectTries: 30,
  socketTimeoutMS: 0
};

mongodb.connect('mongodb://127.0.0.1/starwars', options)
  .then((mongo) => {
    app.listen(port);
    console.log('Connected to mongo DB!');
    const vehiculeController = require('./models/vehicule/controller')({ swapi: api });
    const characterController = require('./models/character/controller')({ swapi: api, mongo });
    const filmController = require('./models/film/controller')({ swapi: api, mongo });
    controllers.vehicule = vehiculeController;
    controllers.character = characterController;
    controllers.film = filmController;
    app.use(
      '/graphql',
      graphqlHTTP({
        schema,
        context: { controllers },
        graphiql: true
      })
    );
    console.log(`Server listening at localhost:${port}`);
  })
  .catch(console.error);