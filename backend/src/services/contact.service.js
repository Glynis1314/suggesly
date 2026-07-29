const Contact = require('../models/contact.model');
const createCrudService = require('./crud.service');
const { resolveUser, resolveCompany } = require('./resolver');

const populateOptions = [
  { path: 'owner', select: 'firstName lastName email' },
  { path: 'company', select: 'company site' },
];

const transformFn = (obj) => {
  if (!obj) return null;
  const name = `${obj.firstName || ''} ${obj.lastName || ''}`.trim() || obj.name || '';
  const first = obj.firstName ? obj.firstName.charAt(0) : '';
  const last = obj.lastName ? obj.lastName.charAt(0) : '';
  const initials = `${first}${last}`.toUpperCase() || obj.initials || '?';
  const ownerName = obj.owner ? `${obj.owner.firstName || ''} ${obj.owner.lastName || ''}`.trim() : '';
  const companyName = obj.company?.company || '';

  return {
    ...obj,
    name,
    initials,
    owner: ownerName || (typeof obj.owner === 'string' ? obj.owner : ''),
    company: companyName || (typeof obj.company === 'string' ? obj.company : ''),
    associatedCompany: companyName || (typeof obj.company === 'string' ? obj.company : ''),
  };
};

const crud = createCrudService(Contact, populateOptions, transformFn);

async function resolvePayload(payload) {
  const cleanPayload = { ...payload };
  if (cleanPayload.name) {
    const parts = cleanPayload.name.trim().split(/\s+/);
    cleanPayload.firstName = parts[0] || '';
    cleanPayload.lastName = parts.slice(1).join(' ') || '';
    delete cleanPayload.name;
  }
  if (cleanPayload.owner) {
    cleanPayload.owner = await resolveUser(cleanPayload.owner);
  }
  if (cleanPayload.company) {
    cleanPayload.company = await resolveCompany(cleanPayload.company, true);
  } else {
    cleanPayload.company = null;
  }
  if (cleanPayload.createdBy) {
    cleanPayload.createdBy = await resolveUser(cleanPayload.createdBy);
  }
  if (cleanPayload.updatedBy) {
    cleanPayload.updatedBy = await resolveUser(cleanPayload.updatedBy);
  }
  return cleanPayload;
}

async function create(payload) {
  const resolved = await resolvePayload(payload);
  return await crud.create(resolved);
}

async function update(id, payload) {
  const resolved = await resolvePayload(payload);
  return await crud.update(id, resolved);
}

async function getContactsByCompany(companyId) {
  const docs = await Contact.find({ company: companyId })
    .populate('owner', 'name email')
    .populate('company', 'company site')
    .sort({ createdAt: -1 });
  return docs.map(transformFn);
}

async function bulkImportContacts(rowsInput) {
  const rows = Array.isArray(rowsInput) ? rowsInput : (rowsInput && rowsInput.rows) || [];
  let insertedCount = 0;
  let skippedCount = 0;
  const errors = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNumber = i + 2;

    let firstName = row['First Name'] || row['firstName'] || '';
    let lastName = row['Last Name'] || row['lastName'] || '';
    if ((!firstName || !lastName) && (row['name'] || row['Name'] || row['Contact Name'] || row['contactName'])) {
      const fullName = (row['name'] || row['Name'] || row['Contact Name'] || row['contactName']).toString().trim();
      const parts = fullName.split(/\s+/);
      firstName = parts[0] || '';
      lastName = parts.slice(1).join(' ') || '-';
    }

    const ownerName = row['Owner'] || row['owner'] || row['Contact Owner'] || '';
    const companyName = row['Company name'] || row['Company Name'] || row['Associated Company Name'] || row['company'] || '';
    const jobTitle = row['Job Title'] || row['jobTitle'] || row['Contact Job Title'] || '';
    const email = row['Email'] || row['email'] || row['Contact Email'] || '';
    const stage = row['Stage'] || row['stage'] || row['Contact Stage'] || '';

    if (!firstName || !lastName || !ownerName || !email || !stage) {
      errors.push({
        row: rowNumber,
        reason: 'Missing required fields: First Name, Last Name, Owner, Email, or Stage',
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

    let companyId = null;
    if (companyName) {
      companyId = await resolveCompany(companyName, true);
      if (!companyId) {
        errors.push({
          row: rowNumber,
          reason: `Company '${companyName}' not found and could not be created`,
        });
        skippedCount++;
        continue;
      }
    }

    const payload = {
      firstName: firstName.toString().trim(),
      lastName: lastName.toString().trim(),
      owner: ownerId,
      company: companyId,
      jobTitle: jobTitle.toString().trim(),
      email: email.toString().trim(),
      phone: row['Phone Number'] || row['Contact Phone Number'] || row['phone'] || '',
      linkedin: row['Linkedin'] || row['Contact LinkedIn'] || row['linkedin'] || '',
      stage: stage.toString().trim(),
      country: row['Country'] || row['Contact Country'] || row['country'] || '',
      city: row['City'] || row['Contact City'] || row['city'] || '',
      notes: row['Notes'] || row['notes'] || '',
    };

    try {
      await Contact.create(payload);
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
  getAll: (query) => crud.getAll(),
  getById: crud.getById,
  update,
  delete: crud.delete,
  getContactsByCompany,

  // Keep original function mappings for backwards compatibility if needed
  createContact: create,
  getAllContacts: () => crud.getAll(),
  getContactById: crud.getById,
  updateContact: update,
  deleteContact: crud.delete,
  bulkImportContacts,
};
