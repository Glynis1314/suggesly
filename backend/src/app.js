const express = require('express');
const accountRoutes = require('./routes/account.routes');
const authRoutes = require('./routes/auth.routes');

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Backend is running' });
});

app.use('/api/accounts', accountRoutes);
app.use('/api/auth', authRoutes);

module.exports = app;
