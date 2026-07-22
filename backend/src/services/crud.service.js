function createCrudService(Model) {
  return {
    async create(payload) {
      return await Model.create(payload);
    },
    async getAll(filter = {}, sort = { createdAt: -1 }) {
      return await Model.find(filter).sort(sort);
    },
    async getById(id) {
      return await Model.findById(id);
    },
    async update(id, payload) {
      return await Model.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
      });
    },
    async delete(id) {
      return await Model.findByIdAndDelete(id);
    },
  };
}

module.exports = createCrudService;
