const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

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

    // Transform the content
    const transformedContent = transformContent(content, username, repoUrl, branch, selectedFile);

    // Write to filecontent.js
    const filePath = path.join(__dirname, '../../front/src/pages/filecontent.js');
    fs.writeFileSync(filePath, transformedContent);
    console.log('Updated file content in filecontent.js');
    
    res.json({ message: 'File content updated successfully' });
  } catch (error) {
    console.error('Error updating file content:', error);
    res.status(500).json({ error: 'Failed to update file content' });
  }
});

// GET route to retrieve file content
router.get('/filecontent', (req, res) => {
  console.log('Retrieving file content');
  
  try {
    const filePath = path.join(__dirname, '../../front/src/pages/filecontent.js');
    const content = fs.readFileSync(filePath, 'utf8');
    res.set('Content-Type', 'application/javascript');
    res.send(content);
  } catch (error) {
    console.error('Error reading file content:', error);
    res.status(500).json({ error: 'Failed to read file content' });
  }
});

// POST route to reset file content
router.post('/reset-filecontent', (req, res) => {
  console.log('Resetting file content');
  
  try {
    const filePath = path.join(__dirname, '../../front/src/pages/filecontent.js');
    fs.writeFileSync(filePath, '// Auto-cleared preview file');
    res.json({ message: 'File content reset successfully' });
  } catch (error) {
    console.error('Error resetting file content:', error);
    res.status(500).json({ error: 'Failed to reset file content' });
  }
});

module.exports = router;
