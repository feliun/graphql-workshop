module.exports = {
  character: (root, { name }, context) => context.controllers.character.getByName(name)
};