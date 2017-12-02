module.exports = (mongo) => ({
	getAllFilms: () => mongo.collection('films').find({}).toArray(),
	getFilmById: (episode_id) => mongo.collection('films').findOne({ episode_id }),
	getCharacterByName: (name) => mongo.collection('characters').findOne({ name })
});