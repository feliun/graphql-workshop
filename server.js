const express = require('express');
const graphqlHTTP = require('express-graphql');
const { GraphQLSchema, GraphQLObjectType, GraphQLString } = require('graphql');

const port = process.env.PORT || 8080;

const app = express();

const moto = 'May the force be with you';
const motoAsObject = { moto };

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      moto: {
        type: GraphQLString,
        resolve: () => moto
      },
      motoAsObject: {
        type: new GraphQLObjectType({
          name: 'motoAsObject',
          fields: {
            moto: { type: GraphQLString }
          }
        }),
        resolve: () => motoAsObject
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
