const express = require('express');
const graphqlHTTP = require('express-graphql');
const gql = require('graphql');
const makeExecutableSchema = require('graphql-tools').makeExecutableSchema;

const vehicles = require('./mongo/vehicles.json');

module.exports = () => (app) => {

  const typeDefs = `
    type Vehicle {
      name: String
      model: String
      manufacturer: String
      cost_in_credits: String
      length: String
      max_atmosphering_speed: String
      crew: String
      passengers: String
      cargo_capacity: String
      consumables: String
      vehicle_class: String
      pilots: [String]
      films: [String]
      created: String
      edited: String
      url: String
    }

    input VehicleInput {
      name: String!
      model: String
      manufacturer: String
    }

    type Query {
      vehicles: [Vehicle]
      vehicle(name: String!): Vehicle
    }

    type Mutation {
      createVehicle(input: VehicleInput): Vehicle
    }
  `;

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