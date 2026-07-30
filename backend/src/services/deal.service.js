const Deal = require('../models/deal.model');
const { DEAL_STAGE_OPTIONS } = Deal;
const createCrudService = require('./crud.service');
const { resolveUser, resolveCompany, resolveContact } = require('./resolver');

const populateOptions = [
  { path: 'owner', select: 'firstName lastName email' },
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

  const ownerName = obj.owner ? `${obj.owner.firstName || ''} ${obj.owner.lastName || ''}`.trim() : '';
  const companyName = obj.associatedCompany?.company || '';

  return {
    ...obj,
    dealOwner: ownerName || (typeof obj.owner === 'string' ? obj.owner : ''),
    dealSize: obj.dealValue || 0,
    associatedCompany: companyName || (typeof obj.associatedCompany === 'string' ? obj.associatedCompany : ''),
    primaryContact: primaryContactName,
  };
};

const crud = createCrudService(Deal, populateOptions, transformFn);

async function resolvePayload(payload, { isUpdate = false } = {}) {
  const cleanPayload = { ...payload };
  if (cleanPayload.dealOwner) {
    cleanPayload.owner = await resolveUser(cleanPayload.dealOwner);
    delete cleanPayload.dealOwner;
  } else if (cleanPayload.owner) {
    cleanPayload.owner = await resolveUser(cleanPayload.owner);
  }
  if (cleanPayload.dealSize !== undefined) {
    cleanPayload.dealValue = Number(cleanPayload.dealSize) || 0;
    delete cleanPayload.dealSize;
  }
  if (cleanPayload.associatedCompany) {
    cleanPayload.associatedCompany = await resolveCompany(cleanPayload.associatedCompany, true);
  } else if (!isUpdate) {
    cleanPayload.associatedCompany = null;
  } else {
    delete cleanPayload.associatedCompany;
  }
  if (cleanPayload.primaryContact) {
    cleanPayload.primaryContact = await resolveContact(cleanPayload.primaryContact, true, cleanPayload.owner);
  } else if (!isUpdate) {
    cleanPayload.primaryContact = null;
  } else {
    delete cleanPayload.primaryContact;
  }
  if (!cleanPayload.currency && !isUpdate) {
    cleanPayload.currency = 'USD';
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
  const resolved = await resolvePayload(payload, { isUpdate: false });
  return await crud.create(resolved);
}

async function update(id, payload) {
  const resolved = await resolvePayload(payload, { isUpdate: true });
  return await crud.update(id, resolved);
}

const DEAL_STAGE_ALIASES = {
  'closed forever': 'Closed Lost',
  // add any other known synonyms here as they come up, e.g.:
  // 'lost forever': 'Closed Lost',
  // 'dead': 'Closed Lost',
};

function normalizeDealStage(rawValue) {
  if (!rawValue) return '';

  // Strip a trailing parenthetical suffix like "(Outbound)", "(Inbound)", etc.
  const withoutSuffix = String(rawValue).replace(/\s*\([^)]*\)\s*$/, '').trim();
  const normalizedKey = withoutSuffix.toLowerCase();

  // Check manual aliases first (business-defined synonyms that don't match any enum value directly)
  if (DEAL_STAGE_ALIASES[normalizedKey]) {
    return DEAL_STAGE_ALIASES[normalizedKey];
  }

  // Fall back to case-insensitive exact match against the canonical enum list
  const match = DEAL_STAGE_OPTIONS.find(
    (option) => option.toLowerCase() === normalizedKey
  );
  return match || '';
}

async function bulkImportDeals(rowsInput) {
  const rows = Array.isArray(rowsInput) ? rowsInput : (rowsInput && rowsInput.rows) || [];
  let insertedCount = 0;
  let skippedCount = 0;
  const errors = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNumber = i + 2;

    const dealName = row['Deal Name'] || row['dealName'] || '';
    const associatedCompany = row['Associated Company'] || row['associatedCompany'] || '';
    const ownerName = row['Owner'] || row['owner'] || row['Deal Owner'] || row['dealOwner'] || '';
    const rawDealStage = row['Deal Stage'] || row['dealStage'] || '';
    const dealStage = normalizeDealStage(rawDealStage);
    const dealValue = row['Deal Value'] || row['dealValue'] || row['dealSize'] || '';
    const currency = row['Currency'] || row['currency'] || 'USD';

    console.log(`[bulkImportDeals] row ${rowNumber} raw data:`, JSON.stringify(row));

    const missing = [];
    if (!dealName) missing.push('Deal Name');
    if (!associatedCompany) missing.push('Associated Company');
    if (!ownerName) missing.push('Owner');
    if (!rawDealStage) missing.push('Deal Stage');
    if (!dealValue) missing.push('Deal Value');

    if (missing.length > 0) {
      errors.push({
        row: rowNumber,
        reason: `Missing required fields: ${missing.join(', ')}`,
      });
      skippedCount++;
      continue;
    }

    if (rawDealStage && !dealStage) {
      errors.push({
        row: rowNumber,
        reason: `Unrecognized deal stage "${rawDealStage}" — expected one of: ${DEAL_STAGE_OPTIONS.join(', ')}`,
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

    const companyId = await resolveCompany(associatedCompany, true);
    if (!companyId) {
      errors.push({
        row: rowNumber,
        reason: `Company '${associatedCompany}' not found and could not be created`,
      });
      skippedCount++;
      continue;
    }

    let contactId = null;
    const associatedContact = row['Associated Contact'] || row['associatedContact'] || row['primaryContact'] || row['Associated Contacts'] || row['associatedContacts'] || '';
    if (associatedContact) {
      contactId = await resolveContact(associatedContact, true, ownerId);
      if (!contactId) {
        errors.push({
          row: rowNumber,
          reason: `Contact '${associatedContact}' not found and could not be created`,
        });
        skippedCount++;
        continue;
      }
    }

    const payload = {
      dealName: dealName.toString().trim(),
      dealValue: Number(dealValue) || 0,
      currency: currency.toString().trim(),
      owner: ownerId,
      dealStage: dealStage.toString().trim(),
      associatedCompany: companyId,
      primaryContact: contactId,
      dealSource: row['Deal Source'] || row['source'] || row['dealSource'] || '',
      notes: row['Notes'] || row['notes'] || row['remarks'] || row['Deal Notes'] || row['dealNotes'] || '',
      nextSteps: row['Next Step'] || row['nextStep'] || row['nextSteps'] || '',
      nextActionDate: row['Next Action Date'] || row['nextActionDate'] || row['Next Step Due Date'] || row['nextStepDueDate'] || '',
      lastActivityDate: row['Last Activity Date'] || row['lastActivityDate'] || '',
      expectedCloseDate: row['Expected Close Date'] || row['expectedCloseDate'] || null,
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

async function bulkUpdate(ids, updates) {
  const resolved = await resolvePayload(updates, { isUpdate: true });
  return await crud.bulkUpdate(ids, resolved);
}

async function bulkDelete(ids) {
  return await crud.bulkDelete(ids);
}

module.exports = {
  create,
  getAll: (query) => crud.getAll(),
  getById: crud.getById,
  update,
  delete: crud.delete,
  bulkUpdate,
  bulkDelete,

  // Keep original function mappings for backwards compatibility if needed
  createDeal: create,
  getAllDeals: () => crud.getAll(),
  getDealById: crud.getById,
  updateDeal: update,
  deleteDeal: crud.delete,
  bulkImportDeals,
};
