const { GraphQLInputObjectType, GraphQLString, GraphQLNonNull } = require('graphql');

module.exports = (schemas) => {
  const InputCharacter = new GraphQLInputObjectType({
    name: 'InputCharacter',
    fields: {
      name: { type: new GraphQLNonNull(GraphQLString) },
      gender: { type: GraphQLString },
      height: { type: GraphQLString },
      mass: { type: GraphQLString },
      hair_color: { type: GraphQLString },
      skin_color: { type: GraphQLString },
      eye_color: { type: GraphQLString },
      birth_year: { type: GraphQLString },
      homeworld: { type: GraphQLString },
      created: { type: GraphQLString },
      edited: { type: GraphQLString },
      url: { type: GraphQLString }
    }
  });

  return {
    addCharacter: {
      type: schemas.character,
      args: {
        input: { type: InputCharacter }
      },
      resolve: (root, { input }, context) => context.controllers.character.addCharacter(input)
    },
    updateCharacter: {
      type: schemas.character,
      args: {
        input: { type: InputCharacter }
      },
      resolve: (root, { input }, context) => context.controllers.character.updateCharacter(input)
    },
    deleteCharacter: {
      type: schemas.character,
      args: {
        name: { type: GraphQLString }
      },
      resolve: (root, args, context) => context.controllers.character.deleteCharacter(args)
    }
  };
};