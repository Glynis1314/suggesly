const express = require('express');
const mongoose = require('mongoose');
const { sendSuccess, sendError } = require('../views/response.view');

function createCrudRouter(entityName, serviceObject, customRoutes = null) {
  const router = express.Router();

  // Helper middleware to validate ObjectId
  const validateId = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return sendError(res, 400, `Invalid ${entityName} id`);
    }
    next();
  };

  // POST /
  router.post('/', async (req, res) => {
    try {
      const doc = await serviceObject.create(req.body);
      return sendSuccess(res, 201, doc);
    } catch (error) {
      return sendError(res, 400, error.message);
    }
  });

  // GET /
  router.get('/', async (req, res) => {
    try {
      const docs = await serviceObject.getAll(req.query);
      return sendSuccess(res, 200, docs);
    } catch (error) {
      return sendError(res, 500, error.message);
    }
  });

  // GET /:id
  router.get('/:id', validateId, async (req, res) => {
    try {
      const doc = await serviceObject.getById(req.params.id);
      if (!doc) {
        return sendError(res, 404, `${entityName} not found`);
      }
      return sendSuccess(res, 200, doc);
    } catch (error) {
      return sendError(res, 500, error.message);
    }
  });

  // PUT /:id
  router.put('/:id', validateId, async (req, res) => {
    try {
      const doc = await serviceObject.update(req.params.id, req.body);
      if (!doc) {
        return sendError(res, 404, `${entityName} not found`);
      }
      return sendSuccess(res, 200, doc);
    } catch (error) {
      return sendError(res, 400, error.message);
    }
  });

  // DELETE /:id
  router.delete('/:id', validateId, async (req, res) => {
    try {
      const doc = await serviceObject.delete(req.params.id);
      if (!doc) {
        return sendError(res, 404, `${entityName} not found`);
      }
      return sendSuccess(res, 200, doc);
    } catch (error) {
      return sendError(res, 500, error.message);
    }
  });

  if (customRoutes) {
    customRoutes(router, validateId);
  }

  return router;
}

module.exports = createCrudRouter;
