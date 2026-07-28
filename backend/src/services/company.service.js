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

    if (!companyName || !ownerName || !stage) {
      errors.push({
        row: rowNumber,
        reason: 'Missing required fields: Company Name, Owner, or Stage',
      });
      skippedCount++;
      continue;
    }

    const ownerId = await resolveUser(ownerName, false);
    if (!ownerId) {
      errors.push({
        row: rowNumber,
        reason: `Owner '${ownerName}' not found — please add this user first`,
      });
      skippedCount++;
      continue;
    }

    const payload = {
      company: companyName.toString().trim(),
      owner: ownerId,
      stage: stage.toString().trim(),
      site: row['Site'] || row['site'] || row['Linkedin URL'] || row['LinkedIn URL'] || '',
      source: row['Source'] ? [row['Source']] : [],
      priority: row['Priority'] || '',
      country: row['Country'] || '',
      city: row['City'] || '',
      employeeSize: row['Employee Size'] || '',
      linkedin: row['Linkedin URL'] || row['LinkedIn URL'] || '',
      notes: row['Notes'] || '',
      nextSteps: row['Next Step'] || row['Next Steps'] || '',
      nextActionDate: row['Next Action Date'] || '',
      lastActivityDate: row['Last Activity Date'] || '',
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
