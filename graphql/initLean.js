const R = require('ramda');
const express = require('express');
const { promisify } = require('util');
const { readdirSync, readFileSync, existsSync } = require('fs');
const { join } = require('path');
const graphqlHTTP = require('express-graphql');
const makeExecutableSchema = require('graphql-tools').makeExecutableSchema;

module.exports = ({ mongo, swapi }) => (app) => {

  const modelsPath = join(__dirname, 'models_lean');
  const toFilePath = (file) => (model) => join(__dirname, 'models_lean', model, file);
  const models = readdirSync(modelsPath);

  const buildDefinitions = R.pipe(
    R.map(toFilePath('definition.graphql')),
    R.filter(existsSync),
    R.map(R.flip(R.curry(readFileSync))('utf-8')),
    R.reduce(R.concat, '')
  );

  const mergeControllers = R.pipe(
    R.map(toFilePath('controller.js')),
    R.filter(existsSync),
    R.map(require),
    R.map(R.applyTo({ mongo, swapi })),
    R.reduce(R.merge, {})
  );

  const mergeResolvers = (resolverFile) =>
    R.pipe(
      R.map(toFilePath(resolverFile)),
      R.filter(existsSync),
      R.map(require),
      R.reduce(R.merge, {})
    );

  const mergeQueries = mergeResolvers('query.js');
  const mergeMutations = mergeResolvers('mutation.js');
  const mergeCustomResolvers = mergeResolvers('resolver.js');

  const typeDefs = buildDefinitions(models);
  const controllers = mergeControllers(models);
  const queries = mergeQueries(models);
  const mutations = mergeMutations(models);
  const customResolvers = mergeCustomResolvers(models);

  const resolvers = R.merge({
    Query: queries,
    Mutation: mutations
  }, customResolvers);

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