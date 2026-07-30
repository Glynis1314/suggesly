const contactService = require('../services/contact.service');
const createCrudRouter = require('./builder.routes');
const { sendSuccess, sendError } = require('../views/response.view');
const mongoose = require('mongoose');

const router = createCrudRouter('contact', contactService, (router) => {
  router.get('/company/:companyId', async (req, res) => {
    try {
      const contacts = await contactService.getContactsByCompany(req.params.companyId);
      return sendSuccess(res, 200, contacts);
    } catch (error) {
      return sendError(res, 500, error.message);
    }
  });

  router.post('/bulk-import', async (req, res) => {
    try {
      const summary = await contactService.bulkImportContacts(req.body);
      return sendSuccess(res, 200, summary);
    } catch (error) {
      return sendError(res, 500, error.message);
    }
  });

  router.patch('/bulk-update', async (req, res) => {
    try {
      const { ids, updates } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return sendError(res, 400, 'ids must be a non-empty array');
      }
      const isValid = ids.every(id => mongoose.Types.ObjectId.isValid(id));
      if (!isValid) {
        return sendError(res, 400, 'One or more provided ids are invalid');
      }
      if (!updates || typeof updates !== 'object' || Object.keys(updates).length === 0) {
        return sendError(res, 400, 'updates must be a non-empty object');
      }
      const result = await contactService.bulkUpdate(ids, updates);
      return sendSuccess(res, 200, result);
    } catch (error) {
      return sendError(res, 500, error.message);
    }
  });

  router.delete('/bulk-delete', async (req, res) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return sendError(res, 400, 'ids must be a non-empty array');
      }
      const isValid = ids.every(id => mongoose.Types.ObjectId.isValid(id));
      if (!isValid) {
        return sendError(res, 400, 'One or more provided ids are invalid');
      }
      const result = await contactService.bulkDelete(ids);
      return sendSuccess(res, 200, result);
    } catch (error) {
      return sendError(res, 500, error.message);
    }
  });
});

module.exports = router;
