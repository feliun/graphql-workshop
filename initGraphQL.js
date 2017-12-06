const graphqlHTTP = require('express-graphql');
const { readdirSync } = require('fs');
const { join } = require('path');
const { GraphQLSchema, GraphQLObjectType } = require('graphql');

const models = readdirSync(join(__dirname, 'models'));

module.exports = ({ mongo, swapi }) => (app) => {
  let schemas = {};
  
  models.forEach(model => {
    schemas[model] = require(`./models/${model}/schema`)(schemas);
  });

  const queryOps = models.reduce((total, model) => {
    let currentQuery = {};
    try {
      currentQuery = require(`./models/${model}/query`)(schemas);
    } catch (err) {
      console.warn(`WARN!: Query operations not defined for model ${model}`);
    }
    return Object.assign(total, currentQuery);
  }, {});

  const mutationOps = models.reduce((total, model) => {
    let currentMutation = {};
    try {
      currentMutation = require(`./models/${model}/mutation`)(schemas);
    } catch (err) {
      console.warn(`WARN!: Mutation operations not defined for model ${model}`);
    }
    return Object.assign(total, currentMutation);
  }, {});

  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',
      fields: queryOps
    }),
    mutation: new GraphQLObjectType({
      name: 'Mutation',
      fields: mutationOps
    })
  });

  const controllers = models.reduce((total, model) => {
    return Object.assign(total, {
      [model]: require(`./models/${model}/controller`)({ swapi, mongo })
    });
  }, {});
  
  app.use(
    '/graphql',
    graphqlHTTP({
      schema,
      context: { controllers },
      graphiql: true
    })
  );
};