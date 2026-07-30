const Note = require('../models/note.model');
const { resolveUser } = require('./resolver');

const ENTITY_MODEL_MAP = { deal: 'Deal', contact: 'Contact', company: 'Company' };

async function createNote({ entityType, entityId, text, author }) {
  const entityModel = ENTITY_MODEL_MAP[entityType];
  if (!entityModel) {
    throw new Error(`Invalid entityType: ${entityType}`);
  }

  const authorId = author ? await resolveUser(author, true) : null;

  const note = await Note.create({ entityType, entityId, entityModel, text, author: authorId });
  const populated = await Note.findById(note._id).populate('author', 'firstName lastName email');
  return formatNote(populated);
}

async function getNotesForEntity(entityType, entityId) {
  const notes = await Note.find({ entityType, entityId })
    .sort({ createdAt: -1 })
    .populate('author', 'firstName lastName email');
  return notes.map(formatNote);
}

async function deleteNote(id) {
  return await Note.findByIdAndDelete(id);
}

function formatNote(doc) {
  if (!doc) return null;
  const obj = doc.toObject({ virtuals: true });
  const authorName = obj.author
    ? `${obj.author.firstName || ''} ${obj.author.lastName || ''}`.trim() || obj.author.email
    : 'Unknown';
  return {
    id: obj._id,
    text: obj.text,
    author: authorName,
    timestamp: obj.createdAt,
  };
}

module.exports = { createNote, getNotesForEntity, deleteNote };
