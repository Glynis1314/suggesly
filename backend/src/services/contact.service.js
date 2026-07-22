const Contact = require('../models/contact.model');
const createCrudService = require('./crud.service');

const crud = createCrudService(Contact);

async function getContactsByCompany(companyId) {
  return await Contact.find({ company: companyId }).sort({ createdAt: -1 });
}

module.exports = {
  create: crud.create,
  getAll: (query) => crud.getAll(),
  getById: crud.getById,
  update: crud.update,
  delete: crud.delete,
  getContactsByCompany,

  // Keep original function mappings for backwards compatibility if needed
  createContact: crud.create,
  getAllContacts: () => crud.getAll(),
  getContactById: crud.getById,
  updateContact: crud.update,
  deleteContact: crud.delete,
};
