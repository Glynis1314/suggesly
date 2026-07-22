const Deal = require('../models/deal.model');
const createCrudService = require('./crud.service');

const crud = createCrudService(Deal);

module.exports = {
  create: crud.create,
  getAll: (query) => crud.getAll(),
  getById: crud.getById,
  update: crud.update,
  delete: crud.delete,

  // Keep original function mappings for backwards compatibility if needed
  createDeal: crud.create,
  getAllDeals: () => crud.getAll(),
  getDealById: crud.getById,
  updateDeal: crud.update,
  deleteDeal: crud.delete,
};
