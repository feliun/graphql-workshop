const express = require('express');
const graphqlHTTP = require('express-graphql');
const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLList } = require('graphql');

const port = process.env.PORT || 8080;

const app = express();

const FILMS = require('./mongo/films.json');
const CHARACTERS = require('./mongo/characters.json');

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

// const Character = // ...

// TODO: define a schema with operations to
// 1. get one film by id
// 2. get a character by name
// 3. Get all films

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      film: {
        type: Film,
        args: { filmId: { type: GraphQLInt } },
        resolve: (root, { filmId }, context) => {
          if (!filmId) throw new Error('A filmId needs to be provided to get a film!');
          return FILMS.find((film) => film.episode_id === filmId);
        },
      }
    }
  })
});

app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    graphiql: true
  })
);

app.listen(port);
console.log(`Server listening at localhost:${port}`);
