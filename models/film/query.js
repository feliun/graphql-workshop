const { GraphQLList, GraphQLInt, GraphQLNonNull } = require('graphql');

module.exports = (schemas) => ({
  films: {
    type: new GraphQLList(schemas.film),
    resolve: (root, args, context) => context.controllers.film.getAll()
  },
  film: {
    type: schemas.film,
    args: { filmId: { type: new GraphQLNonNull(GraphQLInt) } },
    resolve: (root, { filmId }, context) => context.controllers.film.getById(filmId)
  },
});