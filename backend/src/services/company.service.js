const Company = require('../models/company.model');

async function createCompany(payload) {
  const company = await Company.create(payload);
  return company;
}

async function getAllCompanies(query = {}) {
  const filter = {};
  if (query.q) {
    filter.company = { $regex: query.q, $options: 'i' };
  }
  const companies = await Company.find(filter).sort({ createdAt: -1 });
  return companies;
}

async function getCompanyById(id) {
  const company = await Company.findById(id);
  return company;
}

async function updateCompany(id, payload) {
  const company = await Company.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return company;
}

async function deleteCompany(id) {
  const company = await Company.findByIdAndDelete(id);
  return company;
}

module.exports = {
  createCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
};
