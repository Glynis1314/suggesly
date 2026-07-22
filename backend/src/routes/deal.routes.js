const express = require('express');
const mongoose = require('mongoose');
const dealService = require('../services/deal.service');
const { sendSuccess, sendError } = require('../views/account.view');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const deal = await dealService.createDeal(req.body);
    return sendSuccess(res, 201, deal);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
});

router.get('/', async (req, res) => {
  try {
    const deals = await dealService.getAllDeals();
    return sendSuccess(res, 200, deals);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return sendError(res, 400, 'Invalid deal id');
    }
    const deal = await dealService.getDealById(req.params.id);
    if (!deal) {
      return sendError(res, 404, 'Deal not found');
    }
    return sendSuccess(res, 200, deal);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
});

router.put('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return sendError(res, 400, 'Invalid deal id');
    }
    const deal = await dealService.updateDeal(req.params.id, req.body);
    if (!deal) {
      return sendError(res, 404, 'Deal not found');
    }
    return sendSuccess(res, 200, deal);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return sendError(res, 400, 'Invalid deal id');
    }
    const deal = await dealService.deleteDeal(req.params.id);
    if (!deal) {
      return sendError(res, 404, 'Deal not found');
    }
    return sendSuccess(res, 200, deal);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
});

module.exports = router;
