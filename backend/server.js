require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');

// Route imports - make sure these use express.Router()
const authRoutes = require('./routes/auth');
const summaryRoutes = require('./routes/summaries');
const questionRoutes = require('./routes/questions');
const articleRoutes = require('./routes/articles');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();                                                        

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../reactcode/reactcode1/build')));

// Routes - Use Express Router
app.use('/api/auth', authRoutes);
app.use('/api', summaryRoutes);
app.use('/api', questionRoutes);
app.use('/api', articleRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  process.exit(1);
});