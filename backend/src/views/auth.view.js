const express = require('express');
const authService = require('../services/auth.service');
const { sendSuccess, sendError } = require('./account.view');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 400, 'name, email and password are required');
    }

    const user = await authService.register({ name, email, password });
    return sendSuccess(res, 201, user);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, 'email and password are required');
    }

    const result = await authService.login({ email, password });
    return sendSuccess(res, 200, result);
  } catch (error) {
    return sendError(res, 401, error.message);
  }
});

module.exports = router;
