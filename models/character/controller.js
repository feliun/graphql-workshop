module.exports = ({ mongo }) => ({
  getByName: (name) => mongo.collection('characters').findOne({ name }),
});