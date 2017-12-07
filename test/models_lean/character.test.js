const express = require('express');
const mongodb = require('mongodb');
const { request } = require('graphql-request');
const expect = require('expect.js');
const initSystem = require('../../system');
const vehicles = require('../../mongo/vehicles.json');

const app = express();
let mockSwapiResponse = [];

const swapiStub = {
  get: (link) => mockSwapiResponse.pop()
};

const config = {
  app: {
    port: process.env.PORT || 5000
  },
  mongo: {
    options: {
      auth: {
        user: process.env.MONGO_DB_APP_USERNAME || 'node',
        password: process.env.MONGO_DB_APP_PASSWORD || 'node'
      },
      keepAlive: true,
      reconnectTries: 30,
      socketTimeoutMS: 0
    }
  }
};

let charactersCollection;
const url = `http://localhost:${config.app.port}/leangraphql`;
const system = initSystem({ mongodb, app, swapi: swapiStub, config });
const TEST_CHARACTER = 'Felipe Polo';


describe('Character Queries / Mutations', () => {
  
  before(() =>
    system.start()
      .then(({ mongo }) => {
        charactersCollection = mongo.collection('characters');
        return console.log(`Test Server listening at localhost:${config.app.port}`);
      }));

  beforeEach(() => charactersCollection.remove({ name: TEST_CHARACTER }));

  after(system.stop);

  const getCharacter = (name) => {
    const baseQuery = `
      query ($name: String!) {
        character(name: $name) {
          name
          gender
          mass
          hair_color
        }
      }
    `;
    return request(url, baseQuery, { name })
  };

  const addNewCharacter = (input) => {
    const baseQuery = `
      mutation ($input: InputCharacter) {
        addCharacter(input: $input) {
          name
          gender
          height
        }
      }
    `;
    return request(url, baseQuery, input)
  };

  const updateCharacter = (input) => {
    const baseQuery = `
      mutation ($input: InputCharacter) {
        updateCharacter(input: $input) {
          name
          gender
          height
        }
      }
    `;
    return request(url, baseQuery, input)
  };

  const removeCharacter = (name) => {
    const baseQuery = `
      mutation ($name: String!) {
        deleteCharacter(name: $name) {
          name
        }
      }
    `;
    return request(url, baseQuery, { name })
  };

  it('queries a single character with few fields', () => {
    return getCharacter('Luke Skywalker')
      .then(({ character }) => {
        expect(Object.keys(character)).to.eql([ 'name', 'gender', 'mass', 'hair_color' ]);
        expect(character.name).to.equal('Luke Skywalker');
        expect(character.gender).to.equal('male');
        expect(character.mass).to.equal('77');
        expect(character.hair_color).to.equal('blond');
      });
  });

  it('queries vehicles related to a single character getting them from an external source', () => {
    mockSwapiResponse.push(vehicles[0])
    mockSwapiResponse.push(vehicles[0])
    const baseQuery = `
      query ($name: String!) {
        character(name: $name) {
          name
          gender
          vehicles {
            name
            model
            manufacturer
          }
        }
      }
    `;
    return request(url, baseQuery, { name: 'Luke Skywalker' })
      .then(({ character }) => {
        expect(character.name).to.equal('Luke Skywalker');
        expect(character.gender).to.equal('male');
        expect(character.vehicles.length).to.equal(2);
        expect(character.vehicles[0]).to.eql({ name: 'Sand Crawler', model: 'Digger Crawler', manufacturer: 'Corellia Mining Corporation' });
        expect(character.vehicles[0]).to.eql({ name: 'Sand Crawler', model: 'Digger Crawler', manufacturer: 'Corellia Mining Corporation' });
      });
  });

  it('adds a new character', () => {
    const addition = {
      input: {
        name: TEST_CHARACTER,
        gender: 'male'
      }
    };
    return addNewCharacter(addition)
      .then(({ addCharacter }) => {
        expect(addCharacter.name).to.equal(TEST_CHARACTER);
        expect(addCharacter.gender).to.equal('male');
      });
  });

  it('removes a character', () => {
    const addition = {
      input: {
        name: TEST_CHARACTER,
        gender: 'male'
      }
    };
    return addNewCharacter(addition)
      .then(() => getCharacter(TEST_CHARACTER))
      .then(({ character }) => expect(character.name).to.equal(TEST_CHARACTER))
      .then(() => removeCharacter(TEST_CHARACTER))
      .then(() => getCharacter(TEST_CHARACTER))
      .then(({ character }) => expect(character).to.equal(null));
  });

  it('updates a character', () => {
    const addition = {
      input: {
        name: TEST_CHARACTER,
        gender: 'male'
      }
    };
    return addNewCharacter(addition)
      .then(() => getCharacter(TEST_CHARACTER))
      .then(({ character }) => expect(character.hair_color).to.equal(null))
      .then(() => updateCharacter({ input: { name: TEST_CHARACTER, hair_color: 'brown' }}))
      .then(() => getCharacter(TEST_CHARACTER))
      .then(({ character }) => expect(character.hair_color).to.equal('brown'));
  });
});
