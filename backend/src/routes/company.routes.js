const companyService = require('../services/company.service');
const createCrudRouter = require('./builder.routes');
const { sendSuccess, sendError } = require('../views/response.view');

const router = createCrudRouter('company', companyService, (router) => {
  router.post('/bulk-import', async (req, res) => {
    try {
      const summary = await companyService.bulkImportCompanies(req.body);
      return sendSuccess(res, 200, summary);
    } catch (error) {
      return sendError(res, 500, error.message);
    }
  });
});

module.exports = router;
