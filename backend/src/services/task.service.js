const mongoose = require('mongoose');
const Task = require('../models/task.model');
const Deal = require('../models/deal.model');
const Company = require('../models/company.model');
const Contact = require('../models/contact.model');
const createCrudService = require('./crud.service');
const { resolveUser, resolveCompany, resolveContact } = require('./resolver');

const populateOptions = [
  { path: 'assignedTo', select: 'firstName lastName email' },
  { path: 'associatedDeals', select: 'dealName' },
  { path: 'associatedContacts', select: 'firstName lastName email' },
  { path: 'associatedCompanies', select: 'company' },
];

const transformFn = (obj) => {
  if (!obj) return null;

  const assignedToName = obj.assignedTo
    ? `${obj.assignedTo.firstName || ''} ${obj.assignedTo.lastName || ''}`.trim() || obj.assignedTo.email
    : '';

  const formatAssociated = (item, type) => {
    if (!item) return null;
    if (typeof item === 'string') return { id: item, name: item };
    let name = '';
    if (type === 'deal') name = item.dealName || '';
    if (type === 'contact') name = `${item.firstName || ''} ${item.lastName || ''}`.trim() || item.name || '';
    if (type === 'company') name = item.company || '';
    return { id: item._id || item.id, name };
  };

  return {
    ...obj,
    id: obj._id || obj.id,
    assignedTo: assignedToName || (typeof obj.assignedTo === 'string' ? obj.assignedTo : ''),
    associatedDeals: (obj.associatedDeals || []).map((d) => formatAssociated(d, 'deal')).filter(Boolean),
    associatedContacts: (obj.associatedContacts || []).map((c) => formatAssociated(c, 'contact')).filter(Boolean),
    associatedCompanies: (obj.associatedCompanies || []).map((c) => formatAssociated(c, 'company')).filter(Boolean),
  };
};

function formatTask(doc) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject({ virtuals: true }) : doc;
  return transformFn(obj);
}

const crud = createCrudService(Task, populateOptions, transformFn);

async function resolveDeal(name) {
  if (!name) return null;
  const cleanName = name.toString().trim();
  if (mongoose.Types.ObjectId.isValid(cleanName)) return cleanName;
  const deal = await Deal.findOne({ dealName: cleanName });
  return deal ? deal._id : null;
}

async function resolvePayload(payload, { isUpdate = false } = {}) {
  const cleanPayload = { ...payload };

  if (cleanPayload.assignedTo) {
    cleanPayload.assignedTo = await resolveUser(cleanPayload.assignedTo);
  } else if (!isUpdate) {
    cleanPayload.assignedTo = null;
  }

  // Handle deals
  if (cleanPayload.associatedDeals !== undefined) {
    if (Array.isArray(cleanPayload.associatedDeals)) {
      const resolved = [];
      for (const item of cleanPayload.associatedDeals) {
        if (!item) continue;
        const id = await resolveDeal(item);
        if (id) resolved.push(id);
      }
      cleanPayload.associatedDeals = resolved;
    }
  } else if (!isUpdate) {
    cleanPayload.associatedDeals = [];
  }

  // Handle contacts
  if (cleanPayload.associatedContacts !== undefined) {
    if (Array.isArray(cleanPayload.associatedContacts)) {
      const resolved = [];
      for (const item of cleanPayload.associatedContacts) {
        if (!item) continue;
        const id = await resolveContact(item, true);
        if (id) resolved.push(id);
      }
      cleanPayload.associatedContacts = resolved;
    }
  } else if (!isUpdate) {
    cleanPayload.associatedContacts = [];
  }

  // Handle companies
  if (cleanPayload.associatedCompanies !== undefined) {
    if (Array.isArray(cleanPayload.associatedCompanies)) {
      const resolved = [];
      for (const item of cleanPayload.associatedCompanies) {
        if (!item) continue;
        const id = await resolveCompany(item, true);
        if (id) resolved.push(id);
      }
      cleanPayload.associatedCompanies = resolved;
    }
  } else if (!isUpdate) {
    cleanPayload.associatedCompanies = [];
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

async function getTasksByFilter(query = {}) {
  const filter = {};

  if (query.owner) {
    const ownerId = await resolveUser(query.owner, false);
    if (ownerId) {
      filter.assignedTo = ownerId;
    }
  }

  if (query.status) {
    filter.status = query.status;
  }

  // Date filters: dueBefore, dueAfter
  if (query.dueBefore || query.dueAfter) {
    filter.dueDate = {};
    if (query.dueBefore) {
      filter.dueDate.$lte = new Date(query.dueBefore);
    }
    if (query.dueAfter) {
      filter.dueDate.$gte = new Date(query.dueAfter);
    }
  }

  if (query.company) {
    const companyId = await resolveCompany(query.company, false);
    if (companyId) {
      filter.associatedCompanies = companyId;
    }
  }

  // Record details view (specific associated record fetches)
  if (query.associatedDeals) {
    filter.associatedDeals = query.associatedDeals;
  }
  if (query.associatedContacts) {
    filter.associatedContacts = query.associatedContacts;
  }
  if (query.associatedCompanies) {
    filter.associatedCompanies = query.associatedCompanies;
  }

  return filter;
}

async function getAll(query) {
  const filter = await getTasksByFilter(query);
  return await crud.getAll(filter);
}

module.exports = {
  create,
  getAll,
  getById: crud.getById,
  update,
  delete: crud.delete,
  formatTask,
};
