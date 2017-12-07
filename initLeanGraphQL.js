const R = require('ramda');
const express = require('express');
const { promisify } = require('util');
const { readdirSync, readFileSync, existsSync } = require('fs');
const { join } = require('path');
const graphqlHTTP = require('express-graphql');
const makeExecutableSchema = require('graphql-tools').makeExecutableSchema;

const vehicles = require('./mongo/vehicles.json');

module.exports = ({ mongo, swapi }) => (app) => {

  const modelsPath = join(__dirname, 'models_lean');
  const toFilePath = (file) => (model) => join(__dirname, 'models_lean', model, file);
  const models = readdirSync(modelsPath);

  const mergeControllers = R.pipe(
    R.map(toFilePath('controller.js')),
    R.filter(existsSync),
    R.map(require),
    R.map(R.applyTo({ mongo, swapi })),
    R.reduce(R.merge, {})
  );

  const buildDefinitions = R.pipe(
    R.map(toFilePath('definition.graphql')),
    R.filter(existsSync),
    R.map(R.flip(R.curry(readFileSync))('utf-8')),
    R.reduce(R.concat, '')
  );

  const typeDefs = buildDefinitions(models);
  const controllers = mergeControllers(models);

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
      graphiql: true,
      context: { controllers }
    })
  );
};