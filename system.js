const initGraphQL = require('./initGraphQL');
const initLeanGraphQL = require('./initLeanGraphQL');

module.exports = ({ mongodb, app, swapi, config }) => {

  const start = () =>
    mongodb.connect('mongodb://127.0.0.1/starwars', config.mongo.options)
      .then((mongo) => {
        app.listen(config.app.port);
        console.log('Connected to mongo DB!');
        initGraphQL({ mongo, swapi })(app);
        initLeanGraphQL()(app);
      });

  return {
    start
  };

};