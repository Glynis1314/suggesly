const Contact = require('../models/contact.model');
const createCrudService = require('./crud.service');
const { resolveUser, resolveCompany } = require('./resolver');

const populateOptions = [
  { path: 'owner', select: 'name email' },
  { path: 'company', select: 'company site' },
];

const transformFn = (obj) => {
  if (!obj) return null;
  const name = `${obj.firstName || ''} ${obj.lastName || ''}`.trim() || obj.name || '';
  const first = obj.firstName ? obj.firstName.charAt(0) : '';
  const last = obj.lastName ? obj.lastName.charAt(0) : '';
  const initials = `${first}${last}`.toUpperCase() || obj.initials || '?';

  return {
    ...obj,
    name,
    initials,
    owner: obj.owner?.name || (typeof obj.owner === 'string' ? obj.owner : ''),
    company: obj.company?.company || (typeof obj.company === 'string' ? obj.company : ''),
    associatedCompany: obj.company?.company || (typeof obj.company === 'string' ? obj.company : ''),
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

async function bulkImportContacts(rows) {
  let insertedCount = 0;
  let skippedCount = 0;
  const errors = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNumber = i + 2;

    const firstName = row['First Name'] || row['firstName'] || '';
    const lastName = row['Last Name'] || row['lastName'] || '';
    const ownerName = row['Owner'] || row['owner'] || row['Contact Owner'] || '';
    const companyName = row['Company name'] || row['Company Name'] || row['Associated Company Name'] || row['company'] || '';
    const jobTitle = row['Job Title'] || row['jobTitle'] || row['Contact Job Title'] || '';
    const email = row['Email'] || row['email'] || row['Contact Email'] || '';
    const stage = row['Stage'] || row['stage'] || row['Contact Stage'] || '';

    if (!firstName || !lastName || !ownerName || !companyName || !jobTitle || !email || !stage) {
      errors.push({
        row: rowNumber,
        reason: 'Missing required fields: First Name, Last Name, Owner, Company name, Job Title, Email, or Stage',
      });
      skippedCount++;
      continue;
    }

    const ownerId = await resolveUser(ownerName);
    if (!ownerId) {
      errors.push({
        row: rowNumber,
        reason: `Owner '${ownerName}' not found — please add this user first`,
      });
      skippedCount++;
      continue;
    }

    const companyId = await resolveCompany(companyName, false);
    if (!companyId) {
      errors.push({
        row: rowNumber,
        reason: `Company '${companyName}' not found — please create this company first`,
      });
      skippedCount++;
      continue;
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
      country: row['Country'] || row['Contact Country'] || '',
      city: row['City'] || row['Contact City'] || '',
      notes: row['Notes'] || '',
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
