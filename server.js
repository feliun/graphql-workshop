const express = require('express');
const graphqlHTTP = require('express-graphql');
const mongodb = require('mongodb');
const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLList } = require('graphql');

const port = process.env.PORT || 8080;

const app = express();

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
    vehicles: { type: new GraphQLList(GraphQLString) },
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
    vehicles: { type: new GraphQLList(GraphQLString) },
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
        resolve: (root, args, context) => FILMS
      },
      film: {
        type: Film,
        args: { filmId: { type: GraphQLInt } },
        resolve: (root, { filmId }, context) => {
          if (!filmId) throw new Error('A filmId needs to be provided to get a film!');
          return FILMS.find((film) => film.episode_id === filmId);
        },
      },
      character: {
        type: Character,
        args: { name: { type: GraphQLString } },
        resolve: (root, { name }, context) => {
          if (!name) throw new Error('A name needs to be provided to get a character!');
          return CHARACTERS.find((character) => character.name === name);
        },
      }
    }
  })
});


const options = {
  keepAlive: true,
  reconnectTries: 30,
  socketTimeoutMS: 0
};

mongodb.connect('mongodb://127.0.0.1/starwars', options, (err, mongo) => {
  if (err) throw err;
  app.listen(port);
  console.log('Connected to mongo DB!');
  app.use(
    '/graphql',
    graphqlHTTP({
      schema,
      context: { mongo },
      graphiql: true
    })
  );
  console.log(`Server listening at localhost:${port}`);
});

