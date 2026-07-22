const companyService = require('../services/company.service');
const createCrudRouter = require('./builder.routes');

const router = createCrudRouter('company', companyService);

module.exports = router;
