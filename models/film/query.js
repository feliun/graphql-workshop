const { GraphQLList, GraphQLInt, GraphQLNonNull } = require('graphql');

module.exports = (schemas) => ({
  films: {
    type: new GraphQLList(schemas.film),
    resolve: (root, args, context) => context.controllers.film.getAll()
  },
  film: {
    type: schemas.film,
    args: { episode_id: { type: new GraphQLNonNull(GraphQLInt) } },
    resolve: (root, { episode_id }, context) => context.controllers.film.getById(episode_id)
  },
});