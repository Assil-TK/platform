const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Core function to transform content
const replaceImageUsages = (content, username, repoUrl, branch, selectedFile) => {
  const repoPath = repoUrl.replace('https://github.com', '');
  let fileDir = path.dirname(selectedFile).replace(/^\/+/, ''); // Get the directory of the selected file

  // Step 1: Replace imports like `import logo from '../assets/logo.png';`
  content = content.replace(
    /import\s+(\w+)\s+from\s+['"](.+\.(png|jpg|jpeg|gif|svg))['"]/g,
    (match, varName, relPath) => {
      // Resolve relative paths
      let cleanedPath = relPath.replace(/^(\.\/|\/)/, ''); // Clean up leading './' or '/'
      
      // Handle the case of `../` and multiple `../`
      let pathParts = cleanedPath.split('/');
      let upLevels = 0;
      
      // Count how many `..` there are in the path and remove them
      while (pathParts[0] === '..') {
        upLevels++;
        pathParts.shift(); // Remove the '..'
      }
      
      // Now go up the correct number of levels from `selectedFile`
      let resolvedPath = pathParts.join('/');
      let resolvedDir = fileDir.split('/').slice(0, -upLevels).join('/'); // Go up `upLevels` folders

      const rawUrl = `https://raw.githubusercontent.com/${username}${repoPath}/${branch}/${resolvedDir}/${resolvedPath}`;
      return `const ${varName} = "${rawUrl}"`;
    }
  );

  // Step 2: Replace direct JSX image src attributes like: <img src="/assets/img.png" />
  content = content.replace(
    /src\s*=\s*["'](\/[a-zA-Z0-9\-_\/\.]+)["']/g,
    (match, imgPath) => {
      // Handle path trimming
      let trimmed = imgPath.startsWith('/') ? imgPath.slice(1) : imgPath;

      // Resolve `../` relative to selectedFile
      let pathParts = trimmed.split('/');
      let upLevels = 0;

      // Count how many `..` there are in the path and remove them
      while (pathParts[0] === '..') {
        upLevels++;
        pathParts.shift(); // Remove the '..'
      }

      let resolvedPath = pathParts.join('/');
      let resolvedDir = fileDir.split('/').slice(0, -upLevels).join('/'); // Go up `upLevels` folders

      const rawUrl = `https://raw.githubusercontent.com/${username}${repoPath}/${branch}/${resolvedDir}/${resolvedPath}`;
      return `src="${rawUrl}"`;
    }
  );

  return content;
};


// Route: POST /api/write-file-content
router.post('/write-file-content', (req, res) => {
  const { content, username, repoUrl, branch, selectedFile } = req.body;

  if (!content || !username || !repoUrl || !branch || !selectedFile) {
    return res.status(400).json({ message: 'Missing required fields: content, username, repoUrl, branch, or selectedFile.' });
  }

  const filePath = path.join(__dirname, '../../front/src/pages/filecontent.js');

// Process content to replace image imports and image srcs
const transformedContent = replaceImageUsages(content, username, repoUrl, branch, selectedFile);
const contentToSave = `// Auto-generated preview file\nimport '../components/blockNavigation';\n${transformedContent}`;

  fs.writeFile(filePath, contentToSave, 'utf8', (err) => {
    if (err) {
      console.error('Error writing to file:', err);
      return res.status(500).json({ message: 'Failed to write file' });
    }
    res.status(200).json({ message: 'File updated successfully!' });
  });
});

module.exports = router;
