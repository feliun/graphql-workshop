const express = require('express');
const graphqlHTTP = require('express-graphql');
const mongodb = require('mongodb');
const swapi = require('swapi-node');
const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLList } = require('graphql');
const createController = require('./lib/controller');

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

schemas.vehicule = vehiculeSchema;
schemas.character = characterSchema;

const characterQuery = require('./models/character/query')(schemas);

const Film = new GraphQLObjectType({
  name: 'Film',
  description: 'A Star Wars film',
  fields: {
    title: { type: GraphQLString },
    episode_id: { type: GraphQLInt },
    opening_crawl: { type: GraphQLString },
    director: { type: GraphQLString },
    producer: { type: GraphQLString },
    release_date: { type: GraphQLString },
    characters: { type: new GraphQLList(GraphQLString) },
    planets: { type: new GraphQLList(GraphQLString) },
    starships: { type: new GraphQLList(GraphQLString) },
    vehicles: {
      type: new GraphQLList(schemas.vehicule),
      resolve: (root, args, context) => Promise.all(root.vehicles.map(context.controllers.vehicule.getByLink))
    },
    species: { type: new GraphQLList(GraphQLString) },
    created: { type: GraphQLString },
    edited: { type: GraphQLString },
    url: { type: GraphQLString },
    desc: { type: new GraphQLList(GraphQLString) }
  }
});

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: Object.assign({
      films: {
        type: new GraphQLList(Film),
        resolve: (root, args, context) => context.controller.film.getAll()
      },
      film: {
        type: Film,
        args: { filmId: { type: GraphQLInt } },
        resolve: (root, { filmId }, context) => {
          if (!filmId) throw new Error('A filmId needs to be provided to get a film!');
          return context.controller.film.getById(filmId);
        },
      },
    }, characterQuery)
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
    const controller = createController(mongo, api);
    const vehiculeController = require('./models/vehicule/controller')({ swapi: api });
    const characterController = require('./models/character/controller')({ swapi: api, mongo });
    controllers.vehicule = vehiculeController;
    controllers.character = characterController;
    app.use(
      '/graphql',
      graphqlHTTP({
        schema,
        context: { controller, controllers },
        graphiql: true
      })
    );
    console.log(`Server listening at localhost:${port}`);
  })
  .catch(console.error);