const mongoose = require('mongoose');
const User = require('../models/user.model');
const Company = require('../models/company.model');
const Contact = require('../models/contact.model');

async function resolveUser(name, autoCreate = true) {
  if (!name) return null;
  const cleanName = name.toString().trim();
  if (mongoose.Types.ObjectId.isValid(cleanName)) return cleanName;

  const parts = cleanName.split(/\s+/);
  const first = parts[0] || '';
  const last = parts.slice(1).join(' ') || 'User';

  let user = await User.findOne({
    firstName: { $regex: new RegExp(`^${first}$`, 'i') },
    lastName: { $regex: new RegExp(`^${last}$`, 'i') },
  });

  if (!user && autoCreate) {
    user = await User.create({
      firstName: first,
      lastName: last,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
      password: 'password123',
    });
  }

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

async function resolveContact(name, autoCreate = true, defaultOwnerId = null) {
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
    let ownerId = defaultOwnerId;
    if (!ownerId) {
      const firstUser = await User.findOne();
      if (firstUser) {
        ownerId = firstUser._id;
      }
    }
    if (!ownerId) {
      ownerId = await resolveUser('System Owner', true);
    }
    const cleanEmail = cleanName.includes('@') ? cleanName.toLowerCase() : `${firstNameVal.toLowerCase()}.${(lastNameVal || 'contact').toLowerCase().replace(/\s+/g, '')}@example.com`;

    contact = await Contact.create({
      firstName: firstNameVal,
      lastName: lastNameVal || '-',
      email: cleanEmail,
      owner: ownerId
    });
  }
  return contact ? contact._id : null;
}

module.exports = {
  resolveUser,
  resolveCompany,
  resolveContact,
};
