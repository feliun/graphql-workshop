module.exports = ({ mongo }) => ({
  getByName: (name) => mongo.collection('characters').findOne({ name }),
  addCharacter: (input) => mongo.collection('characters').insertOne(input).then(({ ops }) => ops && ops[0]),
  updateCharacter: (input) => 
    mongo.collection('characters')
    .findOneAndUpdate({ name: input.name }, input, { returnNewDocument: true })
    .then((res) => res.value),
  deleteCharacter: (query) => mongo.collection('characters').deleteOne(query)
});