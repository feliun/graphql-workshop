module.exports = {
  films: (root, args, context) => context.controllers.film.getAll(),
  film: (root, { episode_id }, context) => context.controllers.film.getById(episode_id)
};