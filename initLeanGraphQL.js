const R = require('ramda');
const express = require('express');
const { promisify } = require('util');
const { readdirSync, readFileSync, existsSync } = require('fs');
const { join } = require('path');
const graphqlHTTP = require('express-graphql');
const makeExecutableSchema = require('graphql-tools').makeExecutableSchema;

const vehicles = require('./mongo/vehicles.json');

module.exports = () => (app) => {

  const modelsPath = join(__dirname, 'models_lean');
  const models = readdirSync(modelsPath);
  const getDefinitionPath = (model) => join(__dirname, 'models_lean', model, 'definition.graphql');

  const composeDefinitions = R.pipe(
    R.map(getDefinitionPath),
    R.filter(existsSync),
    R.map(R.flip(R.curry(readFileSync))('utf-8')),
    R.reduce(R.concat, '')
  );

  const typeDefs = composeDefinitions(models);

  const resolvers = {
    Query: {
      vehicles: () => vehicles,
      vehicle: (_, { name: targetName }, context) => vehicles.find(({ name }) => name === targetName)
    },
    Mutation: {
      createVehicle: (_, { input }) => {
        vehicles.push(input);
        return input;
      }
    }
  };

  const schema = makeExecutableSchema({ typeDefs, resolvers });
  
  app.use(
    '/leangraphql',
    graphqlHTTP({
      schema,
      graphiql: true
    })
  );
};