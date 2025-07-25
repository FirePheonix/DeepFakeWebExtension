document.addEventListener('DOMContentLoaded', function() {
  const startBtn = document.getElementById('start-btn');
  const stopBtn = document.getElementById('stop-btn');
  const statusDiv = document.getElementById('status');
  const pasteArea = document.getElementById('paste-area');
  const pasteBtn = document.getElementById('paste-btn');
  const clipboardResult = document.getElementById('clipboard-result');
  const fileInput = document.getElementById('file-input');
  const testClipboardBtn = document.getElementById('test-clipboard-btn');

  // Check initial detection status
  updateStatus();

  // Clipboard paste functionality
  pasteArea.addEventListener('click', () => {
    pasteBtn.click();
  });

  pasteBtn.addEventListener('click', async () => {
    await handleClipboardPaste();
  });

  // Handle file input
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      await analyzeClipboardImage(file);
    } else {
      showClipboardResult('Please select a valid image file.', 'error');
    }
    // Reset file input
    fileInput.value = '';
  });

  // Test clipboard access
  testClipboardBtn.addEventListener('click', async () => {
    try {
      if (navigator.clipboard) {
        showClipboardResult('Clipboard API available. Testing permissions...', 'loading');
        
        // Test if we can read text (this often works even if image reading doesn't)
        try {
          const text = await navigator.clipboard.readText();
          showClipboardResult(`Clipboard text access works. Found: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`, 'success');
        } catch (error) {
          showClipboardResult(`Clipboard text access failed: ${error.message}`, 'error');
        }
      } else {
        showClipboardResult('Clipboard API not available in this browser', 'error');
      }
    } catch (error) {
      showClipboardResult(`Clipboard test failed: ${error.message}`, 'error');
    }
  });

  // Handle Ctrl+V paste
  document.addEventListener('keydown', async (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
      e.preventDefault();
      await handleClipboardPaste();
    }
  });

  async function handleClipboardPaste() {
    showClipboardResult('Attempting to read clipboard...', 'loading');
    
    try {
      // Method 1: Try modern clipboard API
      if (navigator.clipboard && navigator.clipboard.read) {
        try {
          const clipboardItems = await navigator.clipboard.read();
          let imageBlob = null;
          
          for (const clipboardItem of clipboardItems) {
            for (const type of clipboardItem.types) {
              if (type.startsWith('image/')) {
                imageBlob = await clipboardItem.getType(type);
                break;
              }
            }
            if (imageBlob) break;
          }
          
          if (imageBlob) {
            await analyzeClipboardImage(imageBlob);
            return;
          }
        } catch (error) {
          console.log('Modern clipboard API failed, trying alternative method:', error);
        }
      }

      // Method 2: Try clipboard.readText for data URLs
      try {
        const clipboardText = await navigator.clipboard.readText();
        if (clipboardText.startsWith('data:image/')) {
          // Convert data URL to blob
          const response = await fetch(clipboardText);
          const imageBlob = await response.blob();
          await analyzeClipboardImage(imageBlob);
          return;
        }
      } catch (error) {
        console.log('Clipboard text method failed:', error);
      }

      // Method 3: Use content script to access clipboard
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const response = await new Promise((resolve) => {
          chrome.tabs.sendMessage(tab.id, { type: 'GET_CLIPBOARD_IMAGE' }, (response) => {
            if (chrome.runtime.lastError) {
              resolve(null);
            } else {
              resolve(response);
            }
          });
        });

        if (response && response.imageData) {
          // Convert base64 to blob
          const base64 = response.imageData.split(',')[1];
          const byteCharacters = atob(base64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const imageBlob = new Blob([byteArray], { type: 'image/jpeg' });
          await analyzeClipboardImage(imageBlob);
          return;
        }
      } catch (error) {
        console.log('Content script method failed:', error);
      }

      showClipboardResult('No image found in clipboard. Please copy an image first.', 'error');
    } catch (error) {
      console.error('All clipboard methods failed:', error);
      showClipboardResult('Failed to read clipboard. Try copying the image again.', 'error');
    }
  }

  async function analyzeClipboardImage(imageBlob) {
    showClipboardResult('Analyzing image...', 'loading');
    
    try {
      const formData = new FormData();
      formData.append('file', imageBlob, 'clipboard-image.jpg');
      
      const resp = await fetch('http://127.0.0.1:8000/api/detect/', {
        method: 'POST',
        body: formData
      });
      
      const data = await resp.json();
      
      if (data && typeof data.fake_probability !== 'undefined') {
        const percent = (data.fake_probability * 100).toFixed(1);
        const label = data.fake_probability >= 0.5 ? 'Likely Deepfake' : 'Likely Real';
        showClipboardResult(`Result: ${percent}% - ${label}`, 'success');
      } else {
        showClipboardResult('Error: Invalid response from server', 'error');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      showClipboardResult('Error analyzing image. Make sure the server is running.', 'error');
    }
  }

  function showClipboardResult(message, type) {
    clipboardResult.textContent = message;
    clipboardResult.className = `clipboard-result ${type}`;
    clipboardResult.style.display = 'block';
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
      setTimeout(() => {
        clipboardResult.style.display = 'none';
      }, 5000);
    }
  }

  startBtn.addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      chrome.tabs.sendMessage(tab.id, { type: "START_DETECTION" }, (response) => {
        if (chrome.runtime.lastError) {
          statusDiv.innerHTML = `<div class="status-item">Error: ${chrome.runtime.lastError.message}</div>`;
          return;
        }
        
        if (response && response.success) {
          startBtn.disabled = true;
          stopBtn.disabled = false;
          updateStatus();
        }
      });
    } catch (error) {
      statusDiv.innerHTML = `<div class="status-item">Error: ${error.message}</div>`;
    }
  });

  stopBtn.addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      chrome.tabs.sendMessage(tab.id, { type: "STOP_DETECTION" }, (response) => {
        if (chrome.runtime.lastError) {
          statusDiv.innerHTML = `<div class="status-item">Error: ${chrome.runtime.lastError.message}</div>`;
          return;
        }
        
        if (response && response.success) {
          startBtn.disabled = false;
          stopBtn.disabled = true;
          statusDiv.innerHTML = '<div class="status-item">Detection stopped. All highlights removed.</div>';
        }
      });
    } catch (error) {
      statusDiv.innerHTML = `<div class="status-item">Error: ${error.message}</div>`;
    }
  });

  async function updateStatus() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      chrome.tabs.sendMessage(tab.id, { type: "GET_DETECTION_STATUS" }, (response) => {
        if (chrome.runtime.lastError) {
          statusDiv.innerHTML = '<div class="status-item">Click "Start Detection" to highlight videos and images on this page.</div>';
          return;
        }
        
        if (response) {
          if (response.isDetecting) {
            startBtn.disabled = true;
            stopBtn.disabled = false;
            
            let statusHTML = `<div class="status-item">Detection active! Found <span class="detected-count">${response.count}</span> media elements.</div>`;
            
            if (response.elements && response.elements.length > 0) {
              statusHTML += '<div class="media-list">';
              response.elements.forEach((item, index) => {
                if (item.type === 'image') {
                  statusHTML += `<div class="media-item" id="media-item-${index}">${index + 1}. IMAGE <button class="analyze-btn" data-src="${item.src}" data-index="${index}">Run Deepfake Analysis</button><span class="analysis-result" id="analysis-result-${index}"></span></div>`;
                } else {
                  statusHTML += `<div class="media-item">${index + 1}. ${item.type.toUpperCase()}</div>`;
                }
              });
              statusHTML += '</div>';
            }
            statusDiv.innerHTML = statusHTML;
            // Add event listeners for analysis buttons
            const analyzeBtns = document.querySelectorAll('.analyze-btn');
            analyzeBtns.forEach(btn => {
              btn.addEventListener('click', async (e) => {
                const src = btn.getAttribute('data-src');
                const idx = btn.getAttribute('data-index');
                const resultSpan = document.getElementById(`analysis-result-${idx}`);
                resultSpan.textContent = ' Analyzing...';
                // Get image data from content script
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                chrome.tabs.sendMessage(tab.id, { type: 'GET_IMAGE_DATA', src }, async (imgResp) => {
                  if (!imgResp || imgResp.error) {
                    resultSpan.textContent = ' Error getting image data';
                    return;
                  }
                  // Prepare form data for backend
                  try {
                    const formData = new FormData();
                    // Convert base64 to blob
                    const base64 = imgResp.base64.split(',')[1];
                    const byteCharacters = atob(base64);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                      byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray], { type: 'image/jpeg' });
                    formData.append('file', blob, 'image.jpg');
                    // Send to Django backend API endpoint
                    const resp = await fetch('http://127.0.0.1:8000/api/detect/', {
                      method: 'POST',
                      body: formData
                    });
                    const data = await resp.json();
                    // Django backend returns { fake_probability: 0.0-1.0 }
                    if (data && typeof data.fake_probability !== 'undefined') {
                      const percent = (data.fake_probability * 100).toFixed(1);
                      const label = data.fake_probability >= 0.5 ? 'Likely Deepfake' : 'Likely Real';
                      resultSpan.textContent = ` ${percent}% - ${label}`;
                    } else {
                      resultSpan.textContent = ' Error: Invalid response';
                    }
                  } catch (err) {
                    resultSpan.textContent = ' Error analyzing image';
                  }
                });
              });
            });
          } else {
            startBtn.disabled = false;
            stopBtn.disabled = true;
            statusDiv.innerHTML = '<div class="status-item">Click "Start Detection" to highlight videos and images on this page.</div>';
          }
        }
      });
    } catch (error) {
      statusDiv.innerHTML = `<div class="status-item">Error: ${error.message}</div>`;
    }
  }

  // Update status periodically when popup is open
  setInterval(updateStatus, 2000);
});