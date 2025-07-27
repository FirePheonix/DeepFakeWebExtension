// Media detection functionality
let isDetecting = false;
let detectedElements = [];

// Simple MongoDB functionality for content script
class SimpleMongoDB {
  constructor() {
    this.backendUrl = 'http://localhost:3000';
    this.database = 'deepfake_votes';
    this.collection = 'image_votes';
  }

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

  // Use real server methods (MongoDB backend)
  async getImageVotes(imageUrl) {
    return await this.findImageVotes(imageUrl);
  }

  async voteForImage(imageUrl, isFake) {
    return await this.updateImageVotes(imageUrl, isFake);
  }
}

// Create global instance
const simpleMongoDB = new SimpleMongoDB();

function getArticleText() {
  const article = document.querySelector("article");
  if (article) return article.innerText;

  // fallback
  const paragraphs = Array.from(document.querySelectorAll("p"));
  return paragraphs.map((p) => p.innerText).join("\n");
}

function createHighlightBox(element, type) {
  const rect = element.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

  // Create highlight box
  const highlight = document.createElement('div');
  highlight.className = 'media-detector-highlight';
  highlight.style.cssText = `
    position: absolute;
    top: ${rect.top + scrollTop - 5}px;
    left: ${rect.left + scrollLeft - 5}px;
    width: ${rect.width + 10}px;
    height: ${rect.height + 10}px;
    border: 3px solid #00ff00;
    background: rgba(0, 255, 0, 0.1);
    pointer-events: auto;
    z-index: 10000;
    box-sizing: border-box;
  `;

  // Create tag label (now with button and result for images)
  const tag = document.createElement('div');
  tag.className = 'media-detector-tag';
  tag.style.cssText = `
    position: absolute;
    top: -25px;
    left: 0;
    background: #00ff00;
    color: #000;
    padding: 2px 8px;
    font-size: 12px;
    font-weight: bold;
    font-family: Arial, sans-serif;
    border-radius: 3px;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 8px;
  `;
  tag.textContent = type.toUpperCase();

  if (type === 'image') {
    // Create voting buttons container
    const votingContainer = document.createElement('div');
    votingContainer.style.cssText = 'display: flex; gap: 8px; margin-top: 8px;';
    
    // Fake vote button (dislike emoji with green bg)
    const fakeBtn = document.createElement('button');
    fakeBtn.innerHTML = '👎';
    fakeBtn.title = 'Vote as Fake';
    fakeBtn.style.cssText = 'padding: 4px 8px; font-size: 14px; background: #34a853; color: white; border: none; border-radius: 3px; cursor: pointer; display: flex; align-items: center; gap: 4px;';
    
    // Real vote button (like emoji with red bg)
    const realBtn = document.createElement('button');
    realBtn.innerHTML = '👍';
    realBtn.title = 'Vote as Real';
    realBtn.style.cssText = 'padding: 4px 8px; font-size: 14px; background: #ea4335; color: white; border: none; border-radius: 3px; cursor: pointer; display: flex; align-items: center; gap: 4px;';
    
    // Vote counts display
    const voteCounts = document.createElement('div');
    voteCounts.style.cssText = 'font-size: 11px; color: #666; margin-top: 4px;';
    
    // Load initial vote counts
    const loadVoteCounts = async () => {
      try {
        const votes = await simpleMongoDB.getImageVotes(element.src);
        voteCounts.textContent = `${votes.fakeVotes} fake, ${votes.realVotes} real`;
        
        // Update highlight color based on votes
        if (votes.fakeVotes >= votes.realVotes) {
          highlight.style.borderColor = '#34a853';
          highlight.style.background = 'rgba(52, 168, 83, 0.1)';
        } else {
          highlight.style.borderColor = '#ea4335';
          highlight.style.background = 'rgba(234, 67, 53, 0.1)';
        }
      } catch (error) {
        console.error('Error loading vote counts:', error);
      }
    };
    
    // Fake vote handler
    fakeBtn.addEventListener('click', async () => {
      try {
        await simpleMongoDB.voteForImage(element.src, true);
        await loadVoteCounts();
        fakeBtn.style.background = '#2e8b57';
        setTimeout(() => fakeBtn.style.background = '#34a853', 500);
      } catch (error) {
        console.error('Error voting fake:', error);
      }
    });
    
    // Real vote handler
    realBtn.addEventListener('click', async () => {
      try {
        await simpleMongoDB.voteForImage(element.src, false);
        await loadVoteCounts();
        realBtn.style.background = '#d33b2c';
        setTimeout(() => realBtn.style.background = '#ea4335', 500);
      } catch (error) {
        console.error('Error voting real:', error);
      }
    });
    
    // Deepfake analysis button
    const detectBtn = document.createElement('button');
    detectBtn.textContent = 'AI Analysis';
    detectBtn.style.cssText = 'padding: 2px 8px; font-size: 12px; background: #4285f4; color: #fff; border: none; border-radius: 3px; cursor: pointer;';
    
    // Result span
    const resultSpan = document.createElement('span');
    resultSpan.style.cssText = 'margin-left: 6px; font-size: 12px; font-weight: bold;';
    
    // Button click handler
    detectBtn.addEventListener('click', async () => {
      console.log('[Deepfake] Button clicked for image:', element.src);
      resultSpan.textContent = 'Analyzing...';
      try {
        // Get image data as base64
        const canvas = document.createElement('canvas');
        canvas.width = element.naturalWidth;
        canvas.height = element.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(element, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg');
        // Convert base64 to blob
        const base64 = dataUrl.split(',')[1];
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/jpeg' });
        const formData = new FormData();
        formData.append('file', blob, 'image.jpg');
        // Send to Django backend API endpoint
        const endpoint = 'http://127.0.0.1:8000/api/detect/';
        console.log('[Deepfake] Sending POST to', endpoint, 'with image blob:', blob);
        const resp = await fetch(endpoint, {
          method: 'POST',
          body: formData
        });
        console.log('[Deepfake] Response status:', resp.status);
        const data = await resp.json();
        console.log('[Deepfake] Response JSON:', data);
        if (data && typeof data.fake_probability !== 'undefined') {
          const percent = (data.fake_probability * 100).toFixed(1);
          const label = data.fake_probability >= 0.5 ? 'Likely Deepfake' : 'Likely Real';
          resultSpan.textContent = ` ${percent}% - ${label}`;
        } else {
          resultSpan.textContent = ' Error: Invalid response';
        }
      } catch (err) {
        console.error('[Deepfake] Error analyzing image:', err);
        resultSpan.textContent = ' Error analyzing image';
      }
    });
    
    // Add all elements to voting container
    votingContainer.appendChild(fakeBtn);
    votingContainer.appendChild(realBtn);
    votingContainer.appendChild(detectBtn);
    votingContainer.appendChild(resultSpan);
    
    // Add voting container and vote counts to tag
    tag.appendChild(votingContainer);
    tag.appendChild(voteCounts);
    
    // Load initial vote counts after a short delay to ensure MongoDB is loaded
    setTimeout(loadVoteCounts, 100);
  }

  highlight.appendChild(tag);
  document.body.appendChild(highlight);
  return highlight;
}

function detectMedia() {
  if (isDetecting) return;
  
  isDetecting = true;
  clearHighlights();
  
  // Detect images
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    if (img.offsetWidth > 50 && img.offsetHeight > 50) { // Filter out small icons
      const highlight = createHighlightBox(img, 'image');
      detectedElements.push({ element: img, highlight, type: 'image' });
    }
  });
  
  // Detect videos
  const videos = document.querySelectorAll('video');
  videos.forEach(video => {
    const highlight = createHighlightBox(video, 'video');
    detectedElements.push({ element: video, highlight, type: 'video' });
  });
  
  // Detect embedded videos (iframes that might contain video)
  const iframes = document.querySelectorAll('iframe');
  iframes.forEach(iframe => {
    const src = iframe.src.toLowerCase();
    if (src.includes('youtube') || src.includes('vimeo') || src.includes('video') || 
        iframe.offsetWidth > 300 && iframe.offsetHeight > 200) {
      const highlight = createHighlightBox(iframe, 'video');
      detectedElements.push({ element: iframe, highlight, type: 'video' });
    }
  });
  
  console.log(`Detected ${detectedElements.length} media elements`);
}

function clearHighlights() {
  detectedElements.forEach(item => {
    if (item.highlight && item.highlight.parentNode) {
      item.highlight.parentNode.removeChild(item.highlight);
    }
  });
  detectedElements = [];
  isDetecting = false;
}

function stopDetection() {
  clearHighlights();
  console.log('Media detection stopped');
}

// Handle window resize to update highlight positions
function updateHighlightPositions() {
  detectedElements.forEach(item => {
    const rect = item.element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    if (item.highlight) {
      item.highlight.style.top = `${rect.top + scrollTop - 5}px`;
      item.highlight.style.left = `${rect.left + scrollLeft - 5}px`;
      item.highlight.style.width = `${rect.width + 10}px`;
      item.highlight.style.height = `${rect.height + 10}px`;
    }
  });
}

// Listen for scroll and resize events to update positions
window.addEventListener('scroll', updateHighlightPositions);
window.addEventListener('resize', updateHighlightPositions);

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.type === "GET_ARTICLE_TEXT") {
    const text = getArticleText();
    sendResponse({ text });
  } else if (req.type === "START_DETECTION") {
    detectMedia();
    sendResponse({ success: true, count: detectedElements.length });
  } else if (req.type === "STOP_DETECTION") {
    stopDetection();
    sendResponse({ success: true });
  } else if (req.type === "GET_DETECTION_STATUS") {
    sendResponse({ 
      isDetecting, 
      count: detectedElements.length,
      elements: detectedElements.map(item => ({
        type: item.type,
        src: item.element.src || item.element.currentSrc || 'N/A'
      }))
    });
  } else if (req.type === "GET_IMAGE_DATA") {
    // Find the image element by src
    const img = Array.from(document.querySelectorAll('img')).find(i => i.src === req.src);
    if (!img) {
      sendResponse({ error: 'Image not found' });
      return;
    }
    // Create a canvas to get base64 data
    try {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');
      sendResponse({ base64: dataUrl });
    } catch (e) {
      sendResponse({ error: 'Failed to get image data' });
    }
    return true; // async response
  } else if (req.type === "GET_CLIPBOARD_IMAGE") {
    // Handle clipboard image request
    handleClipboardImageRequest(sendResponse);
    return true; // async response
  }
});

async function handleClipboardImageRequest(sendResponse) {
  try {
    // Method 1: Try modern clipboard API
    if (navigator.clipboard && navigator.clipboard.read) {
      try {
        const clipboardItems = await navigator.clipboard.read();
        for (const clipboardItem of clipboardItems) {
          for (const type of clipboardItem.types) {
            if (type.startsWith('image/')) {
              const imageBlob = await clipboardItem.getType(type);
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              const img = new Image();
              
              img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                const dataUrl = canvas.toDataURL('image/jpeg');
                sendResponse({ imageData: dataUrl });
              };
              
              img.src = URL.createObjectURL(imageBlob);
              return;
            }
          }
        }
      } catch (error) {
        console.log('Modern clipboard API failed in content script:', error);
      }
    }

    // Method 2: Try clipboard.readText for data URLs
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText.startsWith('data:image/')) {
        sendResponse({ imageData: clipboardText });
        return;
      }
    } catch (error) {
      console.log('Clipboard text method failed in content script:', error);
    }

    // Method 3: Create a temporary input element to capture paste events
    const tempInput = document.createElement('textarea');
    tempInput.style.position = 'absolute';
    tempInput.style.left = '-9999px';
    tempInput.style.top = '-9999px';
    document.body.appendChild(tempInput);
    tempInput.focus();

    // Listen for paste event
    const pasteHandler = async (e) => {
      e.preventDefault();
      const items = e.clipboardData.items;
      
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          
          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL('image/jpeg');
            document.body.removeChild(tempInput);
            sendResponse({ imageData: dataUrl });
          };
          
          img.src = URL.createObjectURL(file);
          return;
        }
      }
      
      document.body.removeChild(tempInput);
      sendResponse({ error: 'No image found in clipboard' });
    };

    tempInput.addEventListener('paste', pasteHandler);
    
    // Trigger paste
    document.execCommand('paste');
    
    // Cleanup after a timeout
    setTimeout(() => {
      if (document.body.contains(tempInput)) {
        document.body.removeChild(tempInput);
        sendResponse({ error: 'No image found in clipboard' });
      }
    }, 1000);

  } catch (error) {
    console.error('All clipboard methods failed in content script:', error);
    sendResponse({ error: 'Failed to access clipboard' });
  }
}