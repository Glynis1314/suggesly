const dealService = require('../services/deal.service');
const createCrudRouter = require('./builder.routes');
const { sendSuccess, sendError } = require('../views/response.view');

const router = createCrudRouter('deal', dealService, (router) => {
  router.post('/bulk-import', async (req, res) => {
    try {
      const summary = await dealService.bulkImportDeals(req.body);
      return sendSuccess(res, 200, summary);
    } catch (error) {
      return sendError(res, 500, error.message);
    }
  });
});

module.exports = router;
