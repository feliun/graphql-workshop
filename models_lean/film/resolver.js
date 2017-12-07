module.exports = {
  Film: {
    vehicles: (root, args, context) => Promise.all(root.vehicles.map(context.controllers.vehicule.getByLink))
  }
};