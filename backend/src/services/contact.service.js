const Contact = require('../models/contact.model');

async function createContact(payload) {
  const contact = await Contact.create(payload);
  return contact;
}

async function getAllContacts() {
  const contacts = await Contact.find().sort({ createdAt: -1 });
  return contacts;
}

async function getContactById(id) {
  const contact = await Contact.findById(id);
  return contact;
}

async function getContactsByCompany(companyId) {
  const contacts = await Contact.find({ company: companyId }).sort({ createdAt: -1 });
  return contacts;
}

async function updateContact(id, payload) {
  const contact = await Contact.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return contact;
}

async function deleteContact(id) {
  const contact = await Contact.findByIdAndDelete(id);
  return contact;
}

module.exports = {
  createContact,
  getAllContacts,
  getContactById,
  getContactsByCompany,
  updateContact,
  deleteContact,
};
