const Company = require('../models/company.model');
const createCrudService = require('./crud.service');
const { resolveUser } = require('./resolver');

const populateOptions = [{ path: 'owner', select: 'firstName lastName email' }];

const transformFn = (obj) => {
  if (!obj) return null;
  const ownerName = obj.owner ? `${obj.owner.firstName || ''} ${obj.owner.lastName || ''}`.trim() : '';
  return {
    ...obj,
    owner: ownerName || (typeof obj.owner === 'string' ? obj.owner : ''),
  };
};

const crud = createCrudService(Company, populateOptions, transformFn);

async function create(payload) {
  if (payload.owner) {
    payload.owner = await resolveUser(payload.owner);
  }
  return await crud.create(payload);
}

async function update(id, payload) {
  if (payload.owner) {
    payload.owner = await resolveUser(payload.owner);
  }
  return await crud.update(id, payload);
}

async function getAllCompanies(query = {}) {
  const filter = {};
  if (query.q) {
    filter.company = { $regex: query.q, $options: 'i' };
  }
  return await crud.getAll(filter);
}

async function bulkImportCompanies(rowsInput) {
  const rows = Array.isArray(rowsInput) ? rowsInput : (rowsInput && rowsInput.rows) || [];
  let insertedCount = 0;
  let skippedCount = 0;
  const errors = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNumber = i + 2;

    const companyName = row['Company Name'] || row['Company name'] || row['company'] || '';
    const ownerName = row['Owner'] || row['owner'] || '';
    const stage = row['Stage'] || row['stage'] || '';

    console.log(`[bulkImportCompanies] row ${rowNumber} raw data:`, JSON.stringify(row));

    const missing = [];
    if (!companyName) missing.push('Company Name');
    if (!ownerName) missing.push('Owner');
    if (!stage) missing.push('Stage');

    if (missing.length > 0) {
      errors.push({
        row: rowNumber,
        reason: `Missing required fields: ${missing.join(', ')}`,
      });
      skippedCount++;
      continue;
    }

    const ownerId = await resolveUser(ownerName, true);
    if (!ownerId) {
      errors.push({
        row: rowNumber,
        reason: `Owner '${ownerName}' not found and could not be created`,
      });
      skippedCount++;
      continue;
    }

    const payload = {
      company: companyName.toString().trim(),
      owner: ownerId,
      stage: stage.toString().trim(),
      site: row['Site'] || row['site'] || row['Linkedin URL'] || row['LinkedIn URL'] || row['linkedin'] || '',
      source: row['Source'] ? (Array.isArray(row['Source']) ? row['Source'] : [row['Source']]) : (row['source'] ? (Array.isArray(row['source']) ? row['source'] : [row['source']]) : []),
      priority: row['Priority'] || row['priority'] || '',
      country: row['Country'] || row['country'] || '',
      city: row['City'] || row['city'] || '',
      employeeSize: row['Employee Size'] || row['employeeSize'] || '',
      linkedin: row['Linkedin URL'] || row['LinkedIn URL'] || row['linkedin'] || '',
      notes: row['Notes'] || row['notes'] || '',
      nextSteps: row['Next Step'] || row['Next Steps'] || row['nextSteps'] || '',
      nextActionDate: row['Next Action Date'] || row['nextActionDate'] || '',
      lastActivityDate: row['Last Activity Date'] || row['lastActivityDate'] || '',
    };

    try {
      await Company.create(payload);
      insertedCount++;
    } catch (err) {
      errors.push({
        row: rowNumber,
        reason: err.message,
      });
      skippedCount++;
    }
  }

  return {
    insertedCount,
    skippedCount,
    errors,
  };
}

module.exports = {
  create,
  getAll: getAllCompanies,
  getById: crud.getById,
  update,
  delete: crud.delete,

  // Keep original function mappings for backwards compatibility if needed
  createCompany: create,
  getAllCompanies,
  getCompanyById: crud.getById,
  updateCompany: update,
  deleteCompany: crud.delete,
  bulkImportCompanies,
};
