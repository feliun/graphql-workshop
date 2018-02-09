const express = require('express');
const mongodb = require('mongodb');
const graphqlHTTP = require('express-graphql');
const { makeExecutableSchema } = require('graphql-tools');

const port = process.env.PORT || 8080;

const app = express();

const typeDefs = `
  type Query {
    character(name: String!): Character
    films:[Film]
    film(episode_id: Int!): Film
  }

  type Mutation {
    addCharacter(input: InputCharacter): Character
    updateCharacter(input: InputCharacter): Character
    deleteCharacter(name: String!): Character
  }

  type Film {
    title: String
    episode_id: Int
    opening_crawl: String
    director: String
    producer: String
    release_date: String
    characters: [String]
    planets: [String]
    starships: [String]
    vehicles: [String]
    species: [String]
    created: String
    edited: String
    url: String
    desc: [String]
  }

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
    vehicles: [String]
    starships: [String]
    created: String
    edited: String
    url: String
    desc: [String]
  }

  input InputCharacter {
    name: String!
    gender: String
    height: String
    mass: String
    hair_color: String
    skin_color: String
    eye_color: String
    birth_year: String
    homeworld: String
    created: String
    edited: String
    url: String
  }
`;

const resolvers = {
  Query: {
    character: (root, { name }, context) => context.mongo.collection('characters').findOne({ name }),
    films: (root, args, context) => context.mongo.collection('films').find({}).toArray(),
    film: (root, { episode_id }, context) => context.mongo.collection('films').findOne({ episode_id })
  },
  Mutation: {
    addCharacter: (root, { input }, context) => context.mongo.collection('characters').insertOne(input).then(({ ops }) => ops && ops[0]),
    updateCharacter: (root, { input }, context) =>
      context.mongo.collection('characters')
      .findOneAndUpdate({ name: input.name }, input, { returnNewDocument: true })
      .then((res) => res.value),
    deleteCharacter: (root, args, context) => context.mongo.collection('characters').deleteOne(args)
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