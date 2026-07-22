const express = require('express');
const mongoose = require('mongoose');
const contactService = require('../services/contact.service');
const { sendSuccess, sendError } = require('../views/response.view');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const contact = await contactService.createContact(req.body);
    return sendSuccess(res, 201, contact);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
});

router.get('/', async (req, res) => {
  try {
    const contacts = await contactService.getAllContacts();
    return sendSuccess(res, 200, contacts);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return sendError(res, 400, 'Invalid contact id');
    }
    const contact = await contactService.getContactById(req.params.id);
    if (!contact) {
      return sendError(res, 404, 'Contact not found');
    }
    return sendSuccess(res, 200, contact);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
});

router.get('/company/:companyId', async (req, res) => {
  try {
    const contacts = await contactService.getContactsByCompany(req.params.companyId);
    return sendSuccess(res, 200, contacts);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
});

router.put('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return sendError(res, 400, 'Invalid contact id');
    }
    const contact = await contactService.updateContact(req.params.id, req.body);
    if (!contact) {
      return sendError(res, 404, 'Contact not found');
    }
    return sendSuccess(res, 200, contact);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return sendError(res, 400, 'Invalid contact id');
    }
    const contact = await contactService.deleteContact(req.params.id);
    if (!contact) {
      return sendError(res, 404, 'Contact not found');
    }
    return sendSuccess(res, 200, contact);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
});

module.exports = router;
