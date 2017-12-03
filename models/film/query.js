const { GraphQLList, GraphQLInt } = require('graphql');

module.exports = (schemas) => ({
  films: {
    type: new GraphQLList(schemas.film),
    resolve: (root, args, context) => context.controllers.film.getAll()
  },
  film: {
    type: schemas.film,
    args: { filmId: { type: GraphQLInt } },
    resolve: (root, { filmId }, context) => {
      if (!filmId) throw new Error('A filmId needs to be provided to get a film!');
      return context.controllers.film.getById(filmId);
    },
  },
});