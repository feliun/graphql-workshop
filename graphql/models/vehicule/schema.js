const { GraphQLObjectType, GraphQLString, GraphQLList } = require('graphql');

module.exports = () => {
  const Vehicule = new GraphQLObjectType({
    name: 'Vehicule',
    description: 'A Star Wars vehicule description',
    fields: () => ({
      name: { type: GraphQLString },
      model: { type: GraphQLString },
      manufacturer: { type: GraphQLString },
      cost_in_credits: { type: GraphQLString },
      length: { type: GraphQLString },
      max_atmosphering_speed: { type: GraphQLString },
      crew: { type: GraphQLString },
      passengers: { type: GraphQLString },
      cargo_capacity: { type: GraphQLString },
      consumables: { type: GraphQLString },
      vehicle_class: { type: GraphQLString },
      pilots: { type: new GraphQLList(GraphQLString) } ,
      films: { type: new GraphQLList(GraphQLString) },
      created: { type: GraphQLString },
      edited: { type: GraphQLString },
      url: { type: GraphQLString }
    })
  });
  return Vehicule;
};