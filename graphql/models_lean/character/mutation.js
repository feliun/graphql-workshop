module.exports = {
  addCharacter: (root, { input }, context) => context.controllers.character.addCharacter(input),
  updateCharacter: (root, { input }, context) => context.controllers.character.updateCharacter(input),
  deleteCharacter: (root, args, context) => context.controllers.character.deleteCharacter(args)
};