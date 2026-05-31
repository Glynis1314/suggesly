const Account = require('../models/account.model');

async function createAccount(payload) {
  const account = await Account.create(payload);
  return account;
}

async function getAllAccounts() {
  const accounts = await Account.find().sort({ createdAt: -1 });
  return accounts;
}

async function getAccountById(id) {
  const account = await Account.findById(id);
  return account;
}

async function updateAccount(id, payload) {
  const account = await Account.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return account;
}

async function deleteAccount(id) {
  const account = await Account.findByIdAndDelete(id);
  return account;
}

module.exports = {
  createAccount,
  getAllAccounts,
  getAccountById,
  updateAccount,
  deleteAccount,
};
