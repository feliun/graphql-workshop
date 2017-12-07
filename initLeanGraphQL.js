const express = require('express');
const graphqlHTTP = require('express-graphql');
const { readdirSync } = require('fs');
const { join } = require('path');
const makeExecutableSchema = require('graphql-tools').makeExecutableSchema;

const models = readdirSync(join(__dirname, 'models'));

const vehicles = require('./mongo/vehicles.json');

module.exports = ({ swapi, mongo }) => (app) => {

  const controllers = models.reduce((total, model) => {
    return Object.assign(total, {
      [model]: require(`./models/${model}/controller`)({ swapi, mongo })
    });
  }, {});

  const typeDefs = `
    
    type Character {
      name: String
      height: String
      mass: String
      hair_color: String
      skin_color: String
      eye_color: String
      birth_year: String
      gender: String
      homeworld: String
      films: [String]
      species: [String]
      vehicles: [Vehicle]
      starships: [String]
      created: String
      edited: String
      url: String
      desc: [String]
    }

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
      character(name: String!): Character
    }

    type Mutation {
      createVehicle(input: VehicleInput): Vehicle
    }
  `;

  const resolvers = {
    Query: {
      character: (root, { name }, context) => context.controllers.character.getByName(name)
    },
    Mutation: {
      createVehicle: (_, { input }) => {
        vehicles.push(input);
        return input;
      }
    },
    Character: {
      vehicles: () => vehicles,
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