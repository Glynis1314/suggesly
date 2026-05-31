const express = require('express');
const mongoose = require('mongoose');
const accountService = require('../services/account.service');
const { sendSuccess, sendError } = require('../views/account.view');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const account = await accountService.createAccount(req.body);
    return sendSuccess(res, 201, account);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
});

router.get('/', async (_req, res) => {
  try {
    const accounts = await accountService.getAllAccounts();
    return sendSuccess(res, 200, accounts);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return sendError(res, 400, 'Invalid account id');
    }

    const account = await accountService.getAccountById(req.params.id);

    if (!account) {
      return sendError(res, 404, 'Account not found');
    }

    return sendSuccess(res, 200, account);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
});

router.put('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return sendError(res, 400, 'Invalid account id');
    }

    const account = await accountService.updateAccount(req.params.id, req.body);

    if (!account) {
      return sendError(res, 404, 'Account not found');
    }

    return sendSuccess(res, 200, account);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return sendError(res, 400, 'Invalid account id');
    }

    const account = await accountService.deleteAccount(req.params.id);

    if (!account) {
      return sendError(res, 404, 'Account not found');
    }

    return sendSuccess(res, 200, account);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
});

module.exports = router;
