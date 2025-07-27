// Simple MongoDB connection for Chrome Extension
// This uses a simple backend server to connect to MongoDB

class SimpleMongoDB {
  constructor() {
    // Simple backend server URL (you'll need to create this)
    this.backendUrl = 'http://localhost:3000'; // Change this to your server URL
    this.database = 'deepfake_votes';
    this.collection = 'image_votes';
  }

  // Simple schema for image votes:
  // {
  //   imageUrl: "string",
  //   fakeVotes: number,
  //   realVotes: number,
  //   lastUpdated: "date"
  // }

  async findImageVotes(imageUrl) {
    try {
      const response = await fetch(`${this.backendUrl}/api/votes/${encodeURIComponent(imageUrl)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        return result || { imageUrl, fakeVotes: 0, realVotes: 0, lastUpdated: new Date().toISOString() };
      } else {
        return { imageUrl, fakeVotes: 0, realVotes: 0, lastUpdated: new Date().toISOString() };
      }
    } catch (error) {
      console.error('Error finding image votes:', error);
      return { imageUrl, fakeVotes: 0, realVotes: 0, lastUpdated: new Date().toISOString() };
    }
  }

  async updateImageVotes(imageUrl, isFake) {
    try {
      const response = await fetch(`${this.backendUrl}/api/votes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageUrl: imageUrl,
          isFake: isFake
        })
      });

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error updating image votes:', error);
      return false;
    }
  }

  // For demo purposes, create a mock implementation that works without any backend
  async mockFindImageVotes(imageUrl) {
    // Use chrome.storage as a simple local database
    return new Promise((resolve) => {
      chrome.storage.local.get(['imageVotes'], (result) => {
        const votes = result.imageVotes || {};
        const imageVotes = votes[imageUrl] || { imageUrl, fakeVotes: 0, realVotes: 0, lastUpdated: new Date().toISOString() };
        resolve(imageVotes);
      });
    });
  }

  async mockUpdateImageVotes(imageUrl, isFake) {
    return new Promise((resolve) => {
      chrome.storage.local.get(['imageVotes'], (result) => {
        const votes = result.imageVotes || {};
        const existingVotes = votes[imageUrl] || { fakeVotes: 0, realVotes: 0 };
        
        votes[imageUrl] = {
          imageUrl: imageUrl,
          fakeVotes: existingVotes.fakeVotes + (isFake ? 1 : 0),
          realVotes: existingVotes.realVotes + (isFake ? 0 : 1),
          lastUpdated: new Date().toISOString()
        };

        chrome.storage.local.set({ imageVotes: votes }, () => {
          resolve(true);
        });
      });
    });
  }

  // Use mock methods for now (no backend setup required)
  async getImageVotes(imageUrl) {
    return await this.mockFindImageVotes(imageUrl);
  }

  async voteForImage(imageUrl, isFake) {
    return await this.mockUpdateImageVotes(imageUrl, isFake);
  }
}

// Create global instance
window.simpleMongoDB = new SimpleMongoDB(); 