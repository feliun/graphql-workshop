const { GraphQLString } = require('graphql');

module.exports = (schemas) => ({
  character: {
    type: schemas.character,
    args: {
      name: { type: GraphQLString } 
    },
    resolve: (root, { name }, context) => {
      if (!name) throw new Error('A name needs to be provided to get a character!');
      return context.controllers.character.getByName(name);
    }
  }
});