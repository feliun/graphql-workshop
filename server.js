const express = require('express');
const graphqlHTTP = require('express-graphql');
const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLInt } = require('graphql');

const port = process.env.PORT || 8080;

const app = express();

const moto = 'May the force be with you';
const character = {
  name: "Luke Skywalker",
  height: 172
};

const schema = new GraphQLSchema({
  // query operations defined
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      mainMoto: {
        type: GraphQLString,
        resolve: () => moto
      },
      mainCharacter: {
        type: new GraphQLObjectType({
          name: 'mainCharacter',
          fields: {
            name: { type: GraphQLString },
            height: { type: GraphQLInt }
          }
        }),
        resolve: () => character
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
