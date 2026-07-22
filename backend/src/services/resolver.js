const mongoose = require('mongoose');
const User = require('../models/user.model');
const Company = require('../models/company.model');
const Contact = require('../models/contact.model');

async function resolveUser(name) {
  if (!name) return null;
  const cleanName = name.toString().trim();
  if (mongoose.Types.ObjectId.isValid(cleanName)) return cleanName;
  const user = await User.findOne({ name: { $regex: new RegExp(`^${cleanName}$`, 'i') } });
  return user ? user._id : null;
}

async function resolveCompany(name, autoCreate = true) {
  if (!name) return null;
  const cleanName = name.toString().trim();
  if (mongoose.Types.ObjectId.isValid(cleanName)) return cleanName;
  let company = await Company.findOne({ company: cleanName });
  if (!company && autoCreate) {
    company = await Company.create({ company: cleanName });
  }
  return company ? company._id : null;
}

async function resolveContact(name, autoCreate = true) {
  if (!name) return null;
  const cleanName = name.toString().trim();
  if (mongoose.Types.ObjectId.isValid(cleanName)) return cleanName;

  const parts = cleanName.split(/\s+/);
  const firstNameVal = parts[0] || '';
  const lastNameVal = parts.slice(1).join(' ') || '';

  let contact = await Contact.findOne({
    $or: [
      { email: cleanName.toLowerCase() },
      {
        firstName: { $regex: new RegExp(`^${firstNameVal}$`, 'i') },
        lastName: { $regex: new RegExp(`^${lastNameVal}$`, 'i') }
      }
    ]
  });

  if (!contact && autoCreate) {
    contact = await Contact.create({ firstName: firstNameVal, lastName: lastNameVal || ' ' });
  }
  return contact ? contact._id : null;
}

module.exports = {
  resolveUser,
  resolveCompany,
  resolveContact,
};
