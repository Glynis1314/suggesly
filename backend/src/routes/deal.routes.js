const dealService = require('../services/deal.service');
const createCrudRouter = require('./builder.routes');

const router = createCrudRouter('deal', dealService);

module.exports = router;
