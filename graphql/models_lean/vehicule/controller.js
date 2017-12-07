module.exports = ({ swapi }) => ({
  vehicule: {
    getByLink: (link) => swapi.get(link)
  }
});