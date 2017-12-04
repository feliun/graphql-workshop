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
    return Object.assign(total, require(`./models/${model}/query`)(schemas));
  }, {});

  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',
      fields: queryOps
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