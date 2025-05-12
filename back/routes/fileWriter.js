const express = require('express');
const router = express.Router();
const path = require('path');

// In-memory storage for file content
let currentFileContent = '// Auto-cleared preview file';

// Function to transform content for preview
const transformContent = (content, username, repoUrl, branch, selectedFile) => {
  const repoPath = repoUrl.replace('https://github.com', '');
  const selectedDir = selectedFile.split('/').slice(0, -1).join('/').replace(/^\/+/, '');

  // Transform image imports
  content = content.replace(
    /import\s+(\w+)\s+from\s+['"](.+\.(png|jpg|jpeg|gif|svg))['"]/g,
    (match, varName, relPath) => {
      const cleanPath = relPath.replace(/^(\.\/|\/)/, '');
      const rawUrl = `https://raw.githubusercontent.com/${username}${repoPath}/${branch}/${selectedDir}/${cleanPath}`;
      return `const ${varName} = "${rawUrl}"`;
    }
  );

  // Transform image src attributes
  content = content.replace(
    /src\s*=\s*["'](\/?[a-zA-Z0-9\-_/\.]+)["']/g,
    (match, imgPath) => {
      const cleanPath = imgPath.replace(/^(\.\/|\/)/, '');
      const rawUrl = `https://raw.githubusercontent.com/${username}${repoPath}/${branch}/${selectedDir}/${cleanPath}`;
      return `src="${rawUrl}"`;
    }
  );

  // Add necessary imports and setup
  return `
import React from 'react';
import ReactDOM from 'react-dom';
import '../components/blockNavigation';

${content}

// Render the component
const root = document.createElement('div');
document.body.appendChild(root);
ReactDOM.render(React.createElement(PageOne), root);
`;
};

// POST route to write file content
router.post('/write-file-content', async (req, res) => {
  try {
    const { content, repoUrl, branch, selectedFile, username } = req.body;
    console.log('Received content update request:', { repoUrl, branch, selectedFile, username });
    
    if (!content) {
      return res.status(400).json({ error: 'No content provided' });
    }

    // Transform and store the content
    const transformedContent = transformContent(content, username, repoUrl, branch, selectedFile);
    currentFileContent = transformedContent;
    console.log('Updated file content in memory');
    
    res.json({ message: 'File content updated successfully' });
  } catch (error) {
    console.error('Error updating file content:', error);
    res.status(500).json({ error: 'Failed to update file content' });
  }
});

// GET route to retrieve file content
router.get('/filecontent', (req, res) => {
  console.log('Retrieving file content');
  res.set('Content-Type', 'application/javascript');
  res.send(currentFileContent);
});

// POST route to reset file content
router.post('/reset-filecontent', (req, res) => {
  console.log('Resetting file content');
  currentFileContent = '// Auto-cleared preview file';
  res.json({ message: 'File content reset successfully' });
});

module.exports = router;
