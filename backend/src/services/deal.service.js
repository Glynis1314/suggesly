const Deal = require('../models/deal.model');

async function createDeal(payload) {
  const deal = await Deal.create(payload);
  return deal;
}

async function getAllDeals() {
  const deals = await Deal.find().sort({ createdAt: -1 });
  return deals;
}

async function getDealById(id) {
  const deal = await Deal.findById(id);
  return deal;
}

async function updateDeal(id, payload) {
  const deal = await Deal.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return deal;
}

async function deleteDeal(id) {
  const deal = await Deal.findByIdAndDelete(id);
  return deal;
}

module.exports = {
  createDeal,
  getAllDeals,
  getDealById,
  updateDeal,
  deleteDeal,
};
