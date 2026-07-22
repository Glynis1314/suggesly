const Company = require('../models/company.model');
const createCrudService = require('./crud.service');

const crud = createCrudService(Company);

async function getAllCompanies(query = {}) {
  const filter = {};
  if (query.q) {
    filter.company = { $regex: query.q, $options: 'i' };
  }
  return await crud.getAll(filter);
}

module.exports = {
  create: crud.create,
  getAll: getAllCompanies,
  getById: crud.getById,
  update: crud.update,
  delete: crud.delete,

  // Keep original function mappings for backwards compatibility if needed
  createCompany: crud.create,
  getAllCompanies,
  getCompanyById: crud.getById,
  updateCompany: crud.update,
  deleteCompany: crud.delete,
};
