const R = require('ramda');
const express = require('express');
const mongodb = require('mongodb');
const { request } = require('graphql-request');
const expect = require('expect.js');
const initSystem = require('../../system');

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
const url = `http://localhost:${config.app.port}/graphql`;
const system = initSystem({ mongodb, app, swapi: swapiStub, config });

describe('Film Queries', () => {
  before(() =>
    system.start()
      .then(({ mongo }) => {
        charactersCollection = mongo.collection('characters');
        return console.log(`Test Server listening at localhost:${config.app.port}`);
      }));

  after(system.stop);

  it('queries a single film with few fields', () => {
    const baseQuery = `
      query {
        film(episode_id: 5) {
          director
          title
        }
      }
    `;
    return request(url, baseQuery)
      .then(({ film }) => {
        expect(Object.keys(film)).to.eql([ 'director', 'title' ]);
        expect(film.director).to.equal('Irvin Kershner');
        expect(film.title).to.equal('The Empire Strikes Back');
      });
  });

  it('queries multiple films', () => {
    const sortByEpisode = (a, b) => a.episode_id > b.episode_id;
    const baseQuery = `
      query {
        films {
          title
          episode_id
        }
      }
    `;
    return request(url, baseQuery)
      .then(({ films }) => {
        const expectedOutput = [ 
          { title: 'The Phantom Menace', episode_id: 1 },
          { title: 'Attack of the Clones', episode_id: 2 },
          { title: 'Revenge of the Sith', episode_id: 3 },
          { title: 'A New Hope', episode_id: 4 },
          { title: 'The Empire Strikes Back', episode_id: 5 },
          { title: 'Return of the Jedi', episode_id: 6 },
          { title: 'The Force Awakens', episode_id: 7 } 
        ];
        expect(films.sort(sortByEpisode)).to.eql(expectedOutput);
      });
  });
});