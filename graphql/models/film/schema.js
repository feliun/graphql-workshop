const { GraphQLObjectType, GraphQLString, GraphQLList, GraphQLInt } = require('graphql');

module.exports = (schemas) => {
  const Film = new GraphQLObjectType({
    name: 'Film',
    description: 'A Star Wars film',
    fields: () => ({
      title: { type: GraphQLString },
      episode_id: { type: GraphQLInt },
      opening_crawl: { type: GraphQLString },
      director: { type: GraphQLString },
      producer: { type: GraphQLString },
      release_date: { type: GraphQLString },
      characters: { type: new GraphQLList(GraphQLString) },
      planets: { type: new GraphQLList(GraphQLString) },
      starships: { type: new GraphQLList(GraphQLString) },
      vehicles: {
        type: new GraphQLList(schemas.vehicule),
        resolve: (root, args, context) => Promise.all(root.vehicles.map(context.controllers.vehicule.getByLink))
      },
      species: { type: new GraphQLList(GraphQLString) },
      created: { type: GraphQLString },
      edited: { type: GraphQLString },
      url: { type: GraphQLString },
      desc: { type: new GraphQLList(GraphQLString) }
    })
  });
  return Film;
};