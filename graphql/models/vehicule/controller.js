module.exports = ({ swapi }) => ({
  getByLink: (link) => swapi.get(link)
});