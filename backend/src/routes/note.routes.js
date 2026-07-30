const express = require('express');
const noteService = require('../services/note.service');
const { sendSuccess, sendError } = require('../views/response.view');

const router = express.Router();

// GET /api/notes?entityType=deal&entityId=...
router.get('/', async (req, res) => {
  try {
    const { entityType, entityId } = req.query;
    if (!entityType || !entityId) {
      return sendError(res, 400, 'entityType and entityId query params are required');
    }
    const notes = await noteService.getNotesForEntity(entityType, entityId);
    return sendSuccess(res, 200, notes);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
});

// POST /api/notes
router.post('/', async (req, res) => {
  try {
    const { entityType, entityId, text, author } = req.body;
    if (!entityType || !entityId || !text) {
      return sendError(res, 400, 'entityType, entityId, and text are required');
    }
    const note = await noteService.createNote({ entityType, entityId, text, author });
    return sendSuccess(res, 201, note);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await noteService.deleteNote(req.params.id);
    if (!deleted) return sendError(res, 404, 'Note not found');
    return sendSuccess(res, 200, { id: req.params.id });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
});

module.exports = router;
