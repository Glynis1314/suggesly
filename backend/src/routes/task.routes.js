const taskService = require('../services/task.service');
const createCrudRouter = require('./builder.routes');

const router = createCrudRouter('task', taskService);

module.exports = router;
