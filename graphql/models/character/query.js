const { GraphQLString, GraphQLNonNull } = require('graphql');

module.exports = (schemas) => ({
  character: {
    type: schemas.character,
    args: {
      name: { type: new GraphQLNonNull(GraphQLString) }
    },
    resolve: (root, { name }, context) => context.controllers.character.getByName(name)
  }
});