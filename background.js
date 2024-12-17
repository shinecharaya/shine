chrome.runtime.onInstalled.addListener(() => {
    console.log('Website Link Checker, Meta Info, Robots.txt & Image Analyzer extension installed');
  });
  
  // Predefined list of common English stop words
  const stopWords = new Set([
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
    "any", "are", "aren't", "as", "at", "be", "because", "been", "before",
    "being", "below", "between", "both", "but", "by", "can't", "cannot", "could",
    "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't",
    "down", "during", "each", "few", "for", "from", "further", "had", "hadn't",
    "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll",
    "he's", "her", "here", "here's", "hers", "herself", "him", "himself",
    "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in",
    "into", "is", "isn't", "it", "it's", "its", "itself", "let's", "me",
    "more", "most", "mustn't", "my", "myself", "no", "nor", "not", "of",
    "off", "on", "once", "only", "or", "other", "ought", "our", "ours",
    "ourselves", "out", "over", "own", "same", "shan't", "she", "she'd",
    "she'll", "she's", "should", "shouldn't", "so", "some", "such", "than",
    "that", "that's", "the", "their", "theirs", "them", "themselves", "then",
    "there", "there's", "these", "they", "they'd", "they'll", "they're",
    "they've", "this", "those", "through", "to", "too", "under", "until",
    "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've",
    "were", "weren't", "what", "what's", "when", "when's", "where",
    "where's", "which", "while", "who", "who's", "whom", "why", "why's",
    "with", "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're",
    "you've", "your", "yours", "yourself", "yourselves"
  ]);
  
  // Listen for messages from popup.js
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "checkLinks") {
      (async () => {
        try {
          // Get the active tab
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
          if (!tab.id) {
            sendResponse({ success: false, error: "No active tab found." });
            return;
          }
  
          // Execute script to get all links on the page
          const [result] = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
              const links = Array.from(document.querySelectorAll('a'))
                .map(link => link.href)
                .filter(href => href); // Exclude empty hrefs
              return links;
            }
          });
  
          let links = result.result;
  
          // Remove duplicates and invalid URLs
          const uniqueLinks = Array.from(new Set(links)).filter(link => {
            try {
              new URL(link);
              return true;
            } catch {
              return false;
            }
          });
  
          if (uniqueLinks.length === 0) {
            sendResponse({ success: true, links: [] });
            return;
          }
  
          // Function to check link status
          const checkLink = async (url) => {
            try {
              const response = await fetch(url, {
                method: 'HEAD',
                mode: 'no-cors' // 'no-cors' to prevent CORS issues, but limits response info
              });
              // Due to 'no-cors', we can't reliably get the status, so we'll assume it's OK
              return { url, status: 'OK' };
            } catch (error) {
              return { url, status: 'Broken' };
            }
          };
  
          // Check all links
          const linkChecks = uniqueLinks.map(link => checkLink(link));
          const results = await Promise.all(linkChecks);
  
          sendResponse({ success: true, links: results });
        } catch (error) {
          console.error(error);
          sendResponse({ success: false, error: error.message });
        }
      })();
      return true; // Keeps the message channel open for async sendResponse
    }
  
    else if (message.action === "getMeta") {
      (async () => {
        try {
          // Get the active tab
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
          if (!tab.id) {
            sendResponse({ success: false, error: "No active tab found." });
            return;
          }
  
          // Execute script to get meta title and description
          const [result] = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
              const metaTitle = document.querySelector('title') ? document.querySelector('title').innerText : 'No title found';
              const metaDescriptionTag = document.querySelector('meta[name="description"]');
              const metaDescription = metaDescriptionTag ? metaDescriptionTag.getAttribute('content') : 'No description found';
              return { metaTitle, metaDescription };
            }
          });
  
          const metaInfo = result.result;
  
          // Calculate character counts
          const titleCharCount = metaInfo.metaTitle.length;
          const descriptionCharCount = metaInfo.metaDescription.length;
  
          sendResponse({ success: true, meta: metaInfo, titleCharCount, descriptionCharCount });
        } catch (error) {
          console.error(error);
          sendResponse({ success: false, error: error.message });
        }
      })();
      return true; // Keeps the message channel open for async sendResponse
    }
  
    else if (message.action === "checkRobots") {
      (async () => {
        try {
          // Get the active tab
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
          if (!tab.url) {
            sendResponse({ success: false, error: "No active tab URL found." });
            return;
          }
  
          // Parse the base URL to construct the robots.txt URL
          const urlObj = new URL(tab.url);
          const robotsUrl = `${urlObj.origin}/robots.txt`;
  
          // Fetch the robots.txt file
          const response = await fetch(robotsUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'text/plain'
            }
          });
  
          if (response.ok) {
            const robotsText = await response.text();
            sendResponse({ success: true, robots: robotsText });
          } else if (response.status === 404) {
            sendResponse({ success: true, robots: null, message: "robots.txt not found." });
          } else {
            sendResponse({ success: false, error: `Failed to fetch robots.txt. Status: ${response.status}` });
          }
        } catch (error) {
          console.error(error);
          sendResponse({ success: false, error: error.message });
        }
      })();
      return true; // Keeps the message channel open for async sendResponse
    }
  
    else if (message.action === "analyzeImages") {
      (async () => {
        try {
          // Get the active tab
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
          if (!tab.id) {
            sendResponse({ success: false, error: "No active tab found." });
            return;
          }
  
          // Execute script to get image details
          const [result] = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
              const images = Array.from(document.querySelectorAll('img'));
              const imageData = images.map(img => ({
                src: img.src,
                alt: img.alt || 'No alt text',
                title: img.title || 'No title',
                location: img.getBoundingClientRect()
              }));
              return imageData;
            }
          });
  
          const images = result.result;
  
          sendResponse({ success: true, images });
        } catch (error) {
          console.error(error);
          sendResponse({ success: false, error: error.message });
        }
      })();
      return true;
    }
  
    else if (message.action === "downloadImage") {
      const imageUrl = message.url;
      if (!imageUrl) {
        sendResponse({ success: false, error: "No image URL provided." });
        return;
      }
  
      try {
        const urlObj = new URL(imageUrl);
        let filename = urlObj.pathname.substring(urlObj.pathname.lastIndexOf('/') + 1).split('?')[0];
        if (!filename) {
          filename = 'downloaded_image';
        }
        // Optionally, you can customize the download folder or filename further
        chrome.downloads.download({
          url: imageUrl,
          filename: `downloaded_images/${filename}`,
          saveAs: true
        }, (downloadId) => {
          if (chrome.runtime.lastError) {
            sendResponse({ success: false, error: chrome.runtime.lastError.message });
          } else {
            sendResponse({ success: true, downloadId });
          }
        });
      } catch (error) {
        console.error(error);
        sendResponse({ success: false, error: error.message });
      }
  
      return true; // Keeps the message channel open for async sendResponse
    }
  
    else if (message.action === "analyzeKeywords") {
      (async () => {
        try {
          // Get the active tab
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
          if (!tab.id) {
            sendResponse({ success: false, error: "No active tab found." });
            return;
          }
  
          // Execute script to get text content of the page
          const [result] = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
              // Get all text content from the body
              return document.body.innerText || '';
            }
          });
  
          let textContent = result.result;
  
          // Convert to lowercase and remove non-alphabetic characters
          textContent = textContent.toLowerCase().replace(/[^a-z\s]/g, '');
  
          // Split into words
          let words = textContent.split(/\s+/).filter(word => word.length > 0);
  
          // Remove stop words
          words = words.filter(word => !stopWords.has(word));
  
          // Count word frequencies
          const wordCounts = {};
          words.forEach(word => {
            wordCounts[word] = (wordCounts[word] || 0) + 1;
          });
  
          // Convert to array and sort by frequency
          const sortedWords = Object.keys(wordCounts).map(word => ({
            word,
            count: wordCounts[word]
          })).sort((a, b) => b.count - a.count);
  
          // Get top N keywords (default to 20 if not specified)
          const topN = message.topN || 20;
          const topKeywords = sortedWords.slice(0, topN);
  
          sendResponse({ success: true, keywords: topKeywords });
        } catch (error) {
          console.error(error);
          sendResponse({ success: false, error: error.message });
        }
      })();
      return true; // Keeps the message channel open for async sendResponse
    }
  });
  