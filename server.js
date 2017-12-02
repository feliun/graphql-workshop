const express = require('express');
const graphqlHTTP = require('express-graphql');
const { GraphQLSchema, GraphQLObjectType } = require('graphql');

const port = process.env.PORT || 8080;

const app = express();

const FILMS = require('./mongo/films.json');
const CHARACTERS = require('./mongo/characters.json');

const Film = // ...
const Character = // ...

// TODO: define a schema with operations to
// 1. get one film by id
// 2. get a character by name
// 3. Get all films
const schema = // ...

app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    graphiql: true
  })
);

app.listen(port);
console.log(`Server listening at localhost:${port}`);
