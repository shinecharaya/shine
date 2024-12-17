// Function to handle tab switching
function openTab(evt, tabName) {
    const tablinks = document.querySelectorAll('.tablinks');
    const tabcontents = document.querySelectorAll('.tabcontent');
  
    // Remove active class from all tabs and contents
    tablinks.forEach(tab => tab.classList.remove('active'));
    tabcontents.forEach(content => content.classList.remove('active'));
  
    // Add active class to the clicked tab and corresponding content
    evt.currentTarget.classList.add('active');
    document.getElementById(tabName).classList.add('active');
  }
  
  // Add event listeners to tab buttons
  document.querySelectorAll('.tablinks').forEach(tab => {
    tab.addEventListener('click', (e) => {
      const tabName = e.currentTarget.getAttribute('data-tab');
      openTab(e, tabName);
    });
  });
  
  // Handle Link Checker functionality
  document.getElementById('checkLinksBtn').addEventListener('click', () => {
    const linkResultsDiv = document.getElementById('linkResults');
    linkResultsDiv.innerHTML = '<p>Checking links... Please wait.<span class="loader"></span></p>';
  
    chrome.runtime.sendMessage({ action: "checkLinks" }, (response) => {
      linkResultsDiv.innerHTML = ''; // Clear previous results
  
      if (response && response.success) {
        const links = response.links;
        if (links.length === 0) {
          linkResultsDiv.textContent = 'No links found.';
          return;
        }
  
        // Create a container for the results
        const fragment = document.createDocumentFragment();
  
        links.forEach(linkObj => {
          const linkItem = document.createElement('div');
          linkItem.className = 'link-item';
  
          const linkAnchor = document.createElement('a');
          linkAnchor.href = linkObj.url;
          linkAnchor.textContent = linkObj.url;
          linkAnchor.target = '_blank';
          linkAnchor.rel = 'noopener noreferrer';
  
          const statusSpan = document.createElement('span');
          if (linkObj.status === 'OK') {
            statusSpan.textContent = 'OK';
            statusSpan.className = 'status-ok';
          } else if (linkObj.status === 'Broken') {
            statusSpan.textContent = 'Broken';
            statusSpan.className = 'status-broken';
          } else {
            statusSpan.textContent = linkObj.status;
            statusSpan.className = 'status-unknown';
          }
  
          linkItem.appendChild(linkAnchor);
          linkItem.appendChild(statusSpan);
          fragment.appendChild(linkItem);
        });
  
        linkResultsDiv.appendChild(fragment);
      } else {
        linkResultsDiv.textContent = response && response.error ? `Error: ${response.error}` : 'Failed to retrieve links.';
      }
    });
  });
  
  // Handle Meta Info functionality
  document.getElementById('getMetaBtn').addEventListener('click', () => {
    const metaResultsDiv = document.getElementById('metaResults');
    metaResultsDiv.innerHTML = '<p>Retrieving meta information... Please wait.<span class="loader"></span></p>';
  
    chrome.runtime.sendMessage({ action: "getMeta" }, (response) => {
      metaResultsDiv.innerHTML = ''; // Clear previous results
  
      if (response && response.success) {
        const meta = response.meta;
        const titleCharCount = response.titleCharCount;
        const descriptionCharCount = response.descriptionCharCount;
  
        // Create meta info elements
        const titleDiv = document.createElement('div');
        titleDiv.className = 'meta-info';
        titleDiv.innerHTML = `<span>Title:</span> ${meta.metaTitle}`;
  
        // Character count for Title
        const titleCharSpan = document.createElement('span');
        titleCharSpan.className = 'meta-char-count';
        titleCharSpan.textContent = `(${titleCharCount} characters)`;
        // Apply color based on character count (SEO recommended: 50-60 characters)
        if (titleCharCount <= 60) {
          titleCharSpan.classList.add('char-count-normal');
        } else if (titleCharCount <= 70) {
          titleCharSpan.classList.add('char-count-warning');
        } else {
          titleCharSpan.classList.add('char-count-danger');
        }
        titleDiv.appendChild(titleCharSpan);
  
        const descriptionDiv = document.createElement('div');
        descriptionDiv.className = 'meta-info';
        descriptionDiv.innerHTML = `<span>Description:</span> ${meta.metaDescription}`;
  
        // Character count for Description
        const descriptionCharSpan = document.createElement('span');
        descriptionCharSpan.className = 'meta-char-count';
        descriptionCharSpan.textContent = `(${descriptionCharCount} characters)`;
        // Apply color based on character count (SEO recommended: 150-160 characters)
        if (descriptionCharCount <= 160) {
          descriptionCharSpan.classList.add('char-count-normal');
        } else if (descriptionCharCount <= 180) {
          descriptionCharSpan.classList.add('char-count-warning');
        } else {
          descriptionCharSpan.classList.add('char-count-danger');
        }
        descriptionDiv.appendChild(descriptionCharSpan);
  
        metaResultsDiv.appendChild(titleDiv);
        metaResultsDiv.appendChild(descriptionDiv);
      } else {
        metaResultsDiv.textContent = response && response.error ? `Error: ${response.error}` : 'Failed to retrieve meta information.';
      }
    });
  });
  
  // Handle Robots.txt Checker functionality
  document.getElementById('checkRobotsBtn').addEventListener('click', () => {
    const robotsResultsDiv = document.getElementById('robotsResults');
    robotsResultsDiv.innerHTML = '<p>Checking robots.txt... Please wait.<span class="loader"></span></p>';
  
    chrome.runtime.sendMessage({ action: "checkRobots" }, (response) => {
      robotsResultsDiv.innerHTML = ''; // Clear previous results
  
      if (response && response.success) {
        if (response.robots) {
          // Display the content of robots.txt
          const robotsContentDiv = document.createElement('div');
          robotsContentDiv.className = 'robots-content';
          robotsContentDiv.textContent = response.robots;
  
          robotsResultsDiv.appendChild(robotsContentDiv);
        } else {
          // robots.txt not found
          const messagePara = document.createElement('p');
          messagePara.textContent = 'robots.txt not found for this website.';
          robotsResultsDiv.appendChild(messagePara);
        }
      } else {
        robotsResultsDiv.textContent = response && response.error ? `Error: ${response.error}` : 'Failed to retrieve robots.txt.';
      }
    });
  });
  
  // Handle Image Analyzer functionality
  document.getElementById('analyzeImagesBtn').addEventListener('click', () => {
    const imageResultsDiv = document.getElementById('imageResults');
    imageResultsDiv.innerHTML = '<p>Analyzing images... Please wait.<span class="loader"></span></p>';
  
    chrome.runtime.sendMessage({ action: "analyzeImages" }, (response) => {
      imageResultsDiv.innerHTML = ''; // Clear previous results
  
      if (response && response.success) {
        const images = response.images;
        if (images.length === 0) {
          imageResultsDiv.textContent = 'No images found.';
          return;
        }
  
        // Create a container for the results
        const fragment = document.createDocumentFragment();
  
        images.forEach((imgObj, index) => {
          const imageItem = document.createElement('div');
          imageItem.className = 'image-item';
  
          // Image preview
          const imgPreview = document.createElement('img');
          imgPreview.src = imgObj.src;
          imgPreview.alt = imgObj.alt;
          imgPreview.title = imgObj.title;
          imgPreview.className = 'image-preview';
  
          // Image details
          const imageDetails = document.createElement('div');
          imageDetails.className = 'image-details';
          imageDetails.innerHTML = `
            <span>Source:</span> ${imgObj.src}<br>
            <span>Alt Text:</span> ${imgObj.alt}<br>
            <span>Title:</span> ${imgObj.title}<br>
            <span>Location:</span> Top: ${Math.round(imgObj.location.top)}px, Left: ${Math.round(imgObj.location.left)}px
          `;
  
          // Download button
          const downloadBtn = document.createElement('button');
          downloadBtn.className = 'download-btn';
          downloadBtn.textContent = 'Save Image';
          downloadBtn.addEventListener('click', () => {
            chrome.runtime.sendMessage({ action: "downloadImage", url: imgObj.src }, (downloadResponse) => {
              if (downloadResponse && downloadResponse.success) {
                alert('Image download started.');
              } else {
                alert(`Failed to download image: ${downloadResponse.error}`);
              }
            });
          });
  
          imageItem.appendChild(imgPreview);
          imageItem.appendChild(imageDetails);
          imageItem.appendChild(downloadBtn);
          fragment.appendChild(imageItem);
        });
  
        imageResultsDiv.appendChild(fragment);
      } else {
        imageResultsDiv.textContent = response && response.error ? `Error: ${response.error}` : 'Failed to analyze images.';
      }
    });
  });
  
  // Handle Keyword Analyzer functionality
  document.getElementById('analyzeKeywordsBtn').addEventListener('click', () => {
    const keywordResultsDiv = document.getElementById('keywordResults');
    keywordResultsDiv.innerHTML = `
      <p>Analyzing keywords... Please wait.<span class="loader"></span></p>
      <label for="topN">Number of Top Keywords:</label>
      <input type="number" id="topN" name="topN" min="1" max="100" value="20" style="width: 50px; margin-left: 10px;">
      <button id="startKeywordAnalysis" class="action-btn" style="width: auto; margin-top: 10px;">Start Analysis</button>
    `;
  
    // Add event listener to the start button
    document.getElementById('startKeywordAnalysis').addEventListener('click', () => {
      const topNInput = document.getElementById('topN');
      let topN = parseInt(topNInput.value, 10);
      if (isNaN(topN) || topN <= 0) {
        alert('Please enter a valid number for top keywords.');
        return;
      }
  
      keywordResultsDiv.innerHTML = '<p>Analyzing keywords... Please wait.<span class="loader"></span></p>';
  
      chrome.runtime.sendMessage({ action: "analyzeKeywords", topN }, (response) => {
        keywordResultsDiv.innerHTML = ''; // Clear previous results
  
        if (response && response.success) {
          const keywords = response.keywords;
          if (keywords.length === 0) {
            keywordResultsDiv.textContent = 'No keywords found.';
            return;
          }
  
          // Create a table to display keywords and their counts
          const table = document.createElement('table');
          table.className = 'keyword-table';
  
          // Table header
          const thead = document.createElement('thead');
          thead.innerHTML = `
            <tr>
              <th>Keyword</th>
              <th>Frequency</th>
            </tr>
          `;
          table.appendChild(thead);
  
          // Table body
          const tbody = document.createElement('tbody');
          keywords.forEach(keywordObj => {
            const row = document.createElement('tr');
            const wordCell = document.createElement('td');
            wordCell.textContent = keywordObj.word;
            const countCell = document.createElement('td');
            countCell.textContent = keywordObj.count;
            row.appendChild(wordCell);
            row.appendChild(countCell);
            tbody.appendChild(row);
          });
          table.appendChild(tbody);
  
          keywordResultsDiv.appendChild(table);
        } else {
          keywordResultsDiv.textContent = response && response.error ? `Error: ${response.error}` : 'Failed to analyze keywords.';
        }
      });
    });
  });
  