const express = require('express');
const graphqlHTTP = require('express-graphql');
const mongodb = require('mongodb');
const swapi = require('swapi-node');
const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLList } = require('graphql');
const createController = require('./lib/controller');

const port = process.env.PORT || 8080;
const args = process.argv;
const shouldMock = (args.length === 3 && args[2] === '--mock');
const swapiMock = {
  get: (link) => ({ name:link })
};

const app = express();

// TODO this code will start getting messy very soon
// each model specifies its own schema with its definition, its resolver(s) and its controller capabilities
// The aim is to encapsulate this information and merge everything together in the main schema

const Vehicule = new GraphQLObjectType({
  name: 'Vehicule',
  description: 'A Star Wars vehicule description',
  fields: {
    name: { type: GraphQLString },
    model: { type: GraphQLString },
    manufacturer: { type: GraphQLString },
    cost_in_credits: { type: GraphQLString },
    length: { type: GraphQLString },
    max_atmosphering_speed: { type: GraphQLString },
    crew: { type: GraphQLString },
    passengers: { type: GraphQLString },
    cargo_capacity: { type: GraphQLString },
    consumables: { type: GraphQLString },
    vehicle_class: { type: GraphQLString },
    pilots: { type: new GraphQLList(GraphQLString) } ,
    films: { type: new GraphQLList(GraphQLString) },
    created: { type: GraphQLString },
    edited: { type: GraphQLString },
    url: { type: GraphQLString }
  }
});

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
      type: new GraphQLList(Vehicule),
      resolve: (root, args, context) => Promise.all(root.vehicles.map(context.controller.vehicule.getByLink))
    },
    species: { type: new GraphQLList(GraphQLString) },
    created: { type: GraphQLString },
    edited: { type: GraphQLString },
    url: { type: GraphQLString },
    desc: { type: new GraphQLList(GraphQLString) }
  }
});

const Character = new GraphQLObjectType({
  name: 'Character',
  description: 'A Star Wars character',
  fields: {
    name: { type: GraphQLString },
    height: { type: GraphQLString },
    mass: { type: GraphQLString },
    hair_color: { type: GraphQLString },
    skin_color: { type: GraphQLString },
    eye_color: { type: GraphQLString },
    birth_year: { type: GraphQLString },
    gender: { type: GraphQLString },
    homeworld: { type: GraphQLString },
    films: { type: new GraphQLList(GraphQLString) },
    species: { type: new GraphQLList(GraphQLString) },
    vehicles: {
      type: new GraphQLList(Vehicule),
      resolve: (root, args, context) => Promise.all(root.vehicles.map(context.controller.vehicule.getByLink))
    },
    starships: { type: new GraphQLList(GraphQLString) },
    created: { type: GraphQLString },
    edited: { type: GraphQLString },
    url: { type: GraphQLString },
    desc: { type: new GraphQLList(GraphQLString) }
  }
});

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
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
      character: {
        type: Character,
        args: { name: { type: GraphQLString } },
        resolve: (root, { name }, context) => {
          if (!name) throw new Error('A name needs to be provided to get a character!');
          return context.controller.character.getByName(name);
        },
      }
    }
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
    const api = shouldMock ? swapiMock : swapi;
    const controller = createController(mongo, api);
    app.use(
      '/graphql',
      graphqlHTTP({
        schema,
        context: { controller },
        graphiql: true
      })
    );
    console.log(`Server listening at localhost:${port}`);
  })
  .catch(console.error);