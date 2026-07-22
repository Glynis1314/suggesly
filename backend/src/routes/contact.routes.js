const contactService = require('../services/contact.service');
const createCrudRouter = require('./builder.routes');
const { sendSuccess, sendError } = require('../views/response.view');

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
});

module.exports = router;
