function createCrudService(Model, populateOptions = [], transformFn = (x) => x) {
  const formatDoc = (doc) => {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject({ virtuals: true }) : doc;
    return transformFn(obj);
  };

  return {
    async create(payload) {
      let doc = await Model.create(payload);
      if (populateOptions.length > 0) {
        doc = await Model.findById(doc._id).populate(populateOptions);
      }
      return formatDoc(doc);
    },
    async getAll(filter = {}, sort = { createdAt: -1 }) {
      let query = Model.find(filter).sort(sort);
      populateOptions.forEach((option) => {
        query = query.populate(option);
      });
      const docs = await query;
      return docs.map(formatDoc);
    },
    async getById(id) {
      let query = Model.findById(id);
      populateOptions.forEach((option) => {
        query = query.populate(option);
      });
      const doc = await query;
      return formatDoc(doc);
    },
    async update(id, payload) {
      let query = Model.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
      });
      populateOptions.forEach((option) => {
        query = query.populate(option);
      });
      const doc = await query;
      return formatDoc(doc);
    },
    async delete(id) {
      const doc = await Model.findByIdAndDelete(id);
      return formatDoc(doc);
    },
  };
}

module.exports = createCrudService;
