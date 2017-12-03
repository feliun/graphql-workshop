const { GraphQLObjectType, GraphQLString, GraphQLList } = require('graphql');

module.exports = (schemas) => {
  const Character = new GraphQLObjectType({
    name: 'Character',
    description: 'A Star Wars character',
    fields: () => ({
      name: { type: GraphQLString },
      height: { type: GraphQLString },
      mass: { type: GraphQLString },
      hair_color: { type: GraphQLString },
      skin_color: { type: GraphQLString },
      eye_color: { type: GraphQLString },
      birth_year: { type: GraphQLString },
      gender: { type: GraphQLString },
      homeworld: { type: GraphQLString },
      films: { type: new GraphQLList(GraphQLString) },
      species: { type: new GraphQLList(GraphQLString) },
      vehicles: {
        type: new GraphQLList(schemas.vehicule),
        resolve: (root, args, context) => Promise.all(root.vehicles.map(context.controllers.vehicule.getByLink))
      },
      starships: { type: new GraphQLList(GraphQLString) },
      created: { type: GraphQLString },
      edited: { type: GraphQLString },
      url: { type: GraphQLString },
      desc: { type: new GraphQLList(GraphQLString) }
    })
  });
  return Character;
};