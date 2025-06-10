const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.send('Voice Chatbot API is running');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 