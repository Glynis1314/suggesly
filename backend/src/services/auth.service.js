const User = require('../models/user.model');

async function register(payload) {
  const email = payload.email?.toLowerCase().trim();

  const existing = await User.findOne({ email });
  if (existing) {
    throw new Error('User already exists');
  }

  const parts = (payload.name || '').trim().split(/\s+/);
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ') || ' ';

  const user = await User.create({
    firstName,
    lastName,
    email,
    password: payload.password,
  });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
  };
}

async function login(payload) {
  const email = payload.email?.toLowerCase().trim();

  const user = await User.findOne({ email }).select('+password');

  if (!user || user.password !== payload.password) {
    throw new Error('Invalid email or password');
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    message: 'Login successful',
  };
}

module.exports = {
  register,
  login,
};
