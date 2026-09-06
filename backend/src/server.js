const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initSchema } = require('./database/init');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Employee Attendance API Service is live!' });
});

// Auto-initialize DB and start server
async function startServer() {
  try {
    await initSchema();
    app.listen(PORT, () => {
      console.log(`🚀 Employee Attendance Backend running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
}

startServer();
