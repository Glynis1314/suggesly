const Deal = require('../models/deal.model');
const createCrudService = require('./crud.service');
const { resolveUser, resolveCompany, resolveContact } = require('./resolver');

const populateOptions = [
  { path: 'dealOwner', select: 'name email' },
  { path: 'associatedCompany', select: 'company site' },
  { path: 'primaryContact', select: 'firstName lastName name email' },
];

const transformFn = (obj) => {
  if (!obj) return null;

  let primaryContactName = '';
  if (obj.primaryContact) {
    if (typeof obj.primaryContact === 'string') {
      primaryContactName = obj.primaryContact;
    } else {
      primaryContactName = `${obj.primaryContact.firstName || ''} ${obj.primaryContact.lastName || ''}`.trim() || obj.primaryContact.name || '';
    }
  }

  return {
    ...obj,
    dealOwner: obj.dealOwner?.name || (typeof obj.dealOwner === 'string' ? obj.dealOwner : ''),
    associatedCompany: obj.associatedCompany?.company || (typeof obj.associatedCompany === 'string' ? obj.associatedCompany : ''),
    primaryContact: primaryContactName,
  };
};

const crud = createCrudService(Deal, populateOptions, transformFn);

async function resolvePayload(payload) {
  const cleanPayload = { ...payload };
  if (cleanPayload.dealOwner) {
    cleanPayload.dealOwner = await resolveUser(cleanPayload.dealOwner);
  }
  if (cleanPayload.associatedCompany) {
    cleanPayload.associatedCompany = await resolveCompany(cleanPayload.associatedCompany, true);
  }
  if (cleanPayload.primaryContact) {
    cleanPayload.primaryContact = await resolveContact(cleanPayload.primaryContact, true);
  }
  if (!cleanPayload.currency) {
    cleanPayload.currency = 'USD';
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

async function bulkImportDeals(rows) {
  let insertedCount = 0;
  let skippedCount = 0;
  const errors = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNumber = i + 2;

    const dealName = row['Deal Name'] || row['dealName'] || '';
    const associatedCompany = row['Associated Company'] || row['associatedCompany'] || '';
    const ownerName = row['Owner'] || row['owner'] || '';
    const dealStage = row['Deal Stage'] || row['dealStage'] || '';
    const dealValue = row['Deal Value'] || row['dealValue'] || row['dealSize'] || '';
    const currency = row['Currency'] || row['currency'] || 'USD';

    if (!dealName || !associatedCompany || !ownerName || !dealStage || !dealValue || !currency) {
      errors.push({
        row: rowNumber,
        reason: 'Missing required fields: Deal Name, Associated Company, Owner, Deal Stage, Deal Value, or Currency',
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

    const companyId = await resolveCompany(associatedCompany, false);
    if (!companyId) {
      errors.push({
        row: rowNumber,
        reason: `Company '${associatedCompany}' not found — please create this company first`,
      });
      skippedCount++;
      continue;
    }

    let contactId = null;
    const associatedContact = row['Associated Contact'] || row['primaryContact'] || '';
    if (associatedContact) {
      contactId = await resolveContact(associatedContact, false);
      if (!contactId) {
        errors.push({
          row: rowNumber,
          reason: `Contact '${associatedContact}' not found`,
        });
        skippedCount++;
        continue;
      }
    }

    const payload = {
      dealName: dealName.toString().trim(),
      dealSize: Number(dealValue) || 0,
      currency: currency.toString().trim(),
      dealOwner: ownerId,
      dealStage: dealStage.toString().trim(),
      associatedCompany: companyId,
      primaryContact: contactId,
      source: row['Deal Source'] || row['source'] || '',
      remarks: row['Notes'] || row['notes'] || row['remarks'] || '',
    };

    try {
      await Deal.create(payload);
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

  // Keep original function mappings for backwards compatibility if needed
  createDeal: create,
  getAllDeals: () => crud.getAll(),
  getDealById: crud.getById,
  updateDeal: update,
  deleteDeal: crud.delete,
  bulkImportDeals,
};
