const express = require('express');
const mongodb = require('mongodb');
const graphqlHTTP = require('express-graphql');
const { makeExecutableSchema } = require('graphql-tools');

const port = process.env.PORT || 8080;

const app = express();

const typeDefs = `
  type Query {
    sample: A
  }

  type A {
    x: String
  }
`;

const resolvers = {
  Query: {
    sample: (root, args, context) => ({ x: "a simpler way to define graphqQL!" })
  }
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

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
    app.use(
      '/graphql',
      graphqlHTTP({
        schema,
        context: { mongo },
        graphiql: true
      })
    );
    console.log(`Server listening at localhost:${port}`);
  })
  .catch(console.error);