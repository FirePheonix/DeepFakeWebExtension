const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const uri = "mongodb+srv://shubhsoch:igloo19@cluster0.uckbg2d.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Connect to MongoDB
async function connectToMongo() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

connectToMongo();

// Routes

// Get votes for an image
app.get('/api/votes/:imageUrl', async (req, res) => {
  try {
    const imageUrl = decodeURIComponent(req.params.imageUrl);
    const database = client.db('deepfake_votes');
    const collection = database.collection('image_votes');
    
    const votes = await collection.findOne({ imageUrl: imageUrl });
    
    if (votes) {
      res.json(votes);
    } else {
      res.json({ 
        imageUrl: imageUrl, 
        fakeVotes: 0, 
        realVotes: 0, 
        lastUpdated: new Date().toISOString() 
      });
    }
  } catch (error) {
    console.error('Error getting votes:', error);
    res.status(500).json({ error: 'Failed to get votes' });
  }
});

// Add a vote for an image
app.post('/api/votes', async (req, res) => {
  try {
    const { imageUrl, isFake } = req.body;
    const database = client.db('deepfake_votes');
    const collection = database.collection('image_votes');
    
    // Find existing votes
    const existingVotes = await collection.findOne({ imageUrl: imageUrl });
    
    const updateData = {
      imageUrl: imageUrl,
      fakeVotes: (existingVotes?.fakeVotes || 0) + (isFake ? 1 : 0),
      realVotes: (existingVotes?.realVotes || 0) + (isFake ? 0 : 1),
      lastUpdated: new Date().toISOString()
    };
    
    // Update or insert
    await collection.updateOne(
      { imageUrl: imageUrl },
      { $set: updateData },
      { upsert: true }
    );
    
    res.json({ success: true, votes: updateData });
  } catch (error) {
    console.error('Error updating votes:', error);
    res.status(500).json({ error: 'Failed to update votes' });
  }
});

// Get all votes (for debugging)
app.get('/api/votes', async (req, res) => {
  try {
    const database = client.db('deepfake_votes');
    const collection = database.collection('image_votes');
    
    const allVotes = await collection.find({}).toArray();
    res.json(allVotes);
  } catch (error) {
    console.error('Error getting all votes:', error);
    res.status(500).json({ error: 'Failed to get all votes' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  GET  /api/votes/:imageUrl - Get votes for an image');
  console.log('  POST /api/votes - Add a vote');
  console.log('  GET  /api/votes - Get all votes');
  console.log('  GET  /health - Health check');
}); 