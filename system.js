const initGraphQL = require('./initGraphQL');
const initLeanGraphQL = require('./initLeanGraphQL');

module.exports = ({ mongodb, app, swapi, config }) => {

  let server;
  let mongoInstance;

  const start = () =>
    mongodb.connect('mongodb://127.0.0.1/starwars', config.mongo.options)
      .then((mongo) => {
        server = app.listen(config.app.port);
        mongoInstance = mongo;
        console.log('Connected to mongo DB!');
        initGraphQL({ mongo, swapi })(app);
        initLeanGraphQL()(app);
        return { mongo, app };
      });

  const stop = () =>
    mongoInstance.close()
      .then(() => server.close());

  return {
    start,
    stop
  };

};