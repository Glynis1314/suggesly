const express = require('express');
const mongoose = require('mongoose');
const companyService = require('../services/company.service');
const { sendSuccess, sendError } = require('../views/account.view');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const company = await companyService.createCompany(req.body);
    return sendSuccess(res, 201, company);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
});

router.get('/', async (req, res) => {
  try {
    const companies = await companyService.getAllCompanies(req.query);
    return sendSuccess(res, 200, companies);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return sendError(res, 400, 'Invalid company id');
    }
    const company = await companyService.getCompanyById(req.params.id);
    if (!company) {
      return sendError(res, 404, 'Company not found');
    }
    return sendSuccess(res, 200, company);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
});

router.put('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return sendError(res, 400, 'Invalid company id');
    }
    const company = await companyService.updateCompany(req.params.id, req.body);
    if (!company) {
      return sendError(res, 404, 'Company not found');
    }
    return sendSuccess(res, 200, company);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return sendError(res, 400, 'Invalid company id');
    }
    const company = await companyService.deleteCompany(req.params.id);
    if (!company) {
      return sendError(res, 404, 'Company not found');
    }
    return sendSuccess(res, 200, company);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
});

module.exports = router;
