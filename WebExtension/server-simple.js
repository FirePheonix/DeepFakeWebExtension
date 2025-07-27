const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Simple in-memory storage (for testing)
let votes = {};

// Routes

// Get votes for an image
app.get('/api/votes/:imageUrl', (req, res) => {
  const imageUrl = decodeURIComponent(req.params.imageUrl);
  const imageVotes = votes[imageUrl] || { 
    imageUrl: imageUrl, 
    fakeVotes: 0, 
    realVotes: 0, 
    lastUpdated: new Date().toISOString() 
  };
  res.json(imageVotes);
});

// Add a vote for an image
app.post('/api/votes', (req, res) => {
  const { imageUrl, isFake } = req.body;
  
  if (!votes[imageUrl]) {
    votes[imageUrl] = { 
      imageUrl: imageUrl, 
      fakeVotes: 0, 
      realVotes: 0, 
      lastUpdated: new Date().toISOString() 
    };
  }
  
  if (isFake) {
    votes[imageUrl].fakeVotes++;
  } else {
    votes[imageUrl].realVotes++;
  }
  
  votes[imageUrl].lastUpdated = new Date().toISOString();
  
  res.json({ success: true, votes: votes[imageUrl] });
});

// Get all votes (for debugging)
app.get('/api/votes', (req, res) => {
  res.json(Object.values(votes));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running (Simple Mode)' });
});

app.listen(PORT, () => {
  console.log(`Simple server running on http://localhost:${PORT}`);
  console.log('✅ No MongoDB required - using in-memory storage');
  console.log('Available endpoints:');
  console.log('  GET  /api/votes/:imageUrl - Get votes for an image');
  console.log('  POST /api/votes - Add a vote');
  console.log('  GET  /api/votes - Get all votes');
  console.log('  GET  /health - Health check');
}); 