const express = require('express');
const router = express.Router();
const path = require('path');

// In-memory storage for file content
let currentFileContent = '// Auto-cleared preview file';

// Core function to transform content
const replaceImageUsages = (content, username, repoUrl, branch, selectedFile) => {
  const repoPath = repoUrl.replace('https://github.com', '');
  const selectedDir = path.dirname(selectedFile).replace(/^\/+/, ''); // Remove leading slashes

  const adjustPath = (originalPath) => {
    let cleanPath = originalPath.replace(/^(\.\/|\/)/, '');
    if (originalPath.startsWith('/') && !originalPath.startsWith('./')) {
      cleanPath = `../${cleanPath}`;
    }
    return cleanPath;
  };

  // Step 1: Replace imports like import logo from '../assets/logo.png';
  content = content.replace(
    /import\s+(\w+)\s+from\s+['"](.+\.(png|jpg|jpeg|gif|svg))['"]/g,
    (match, varName, relPath) => {
      const cleanPath = adjustPath(relPath);
      const rawUrl = `https://raw.githubusercontent.com/${username}${repoPath}/${branch}/${selectedDir}/${cleanPath}`;
      return `const ${varName} = "${rawUrl}"`;
    }
  );

  // Step 2: Replace direct JSX image src attributes like: <img src="/assets/img.png" />
  content = content.replace(
    /src\s*=\s*["'](\/?[a-zA-Z0-9\-_/\.]+)["']/g,
    (match, imgPath) => {
      const cleanPath = adjustPath(imgPath);
      const rawUrl = `https://raw.githubusercontent.com/${username}${repoPath}/${branch}/${selectedDir}/${cleanPath}`;
      return `src="${rawUrl}"`;
    }
  );

  // Step 3: Replace 'components' or 'component' in import paths
  content = content.replace(
    /import\s+([^\s]+)\s+from\s+['"](?:\.\/|\.\.\/)*(.*?)(components|component)\/([^'"]+)['"]/g,
    (match, varName, basePath, compWord, remainingPath) => {
      const componentName = remainingPath.split('/').pop();
      return `import ${varName} from "${process.env.REACT_APP_API_URL}/api/component/${componentName}"`;
    }
  );

  // Step 4: Replace object-style image paths like: image: "/assets/img.png"
  content = content.replace(
    /image\s*:\s*["'](\/?[a-zA-Z0-9\-_/\.]+)["']/g,
    (match, relPath) => {
      const cleanPath = adjustPath(relPath);
      const rawUrl = `https://raw.githubusercontent.com/${username}${repoPath}/${branch}/${selectedDir}/${cleanPath}`;
      return `image: "${rawUrl}"`;
    }
  );

  return content;
};

// POST route to write file content
router.post('/write-file-content', async (req, res) => {
  try {
    const { content, repoUrl, branch, selectedFile, username } = req.body;
    console.log('Received content update request:', { repoUrl, branch, selectedFile, username });
    
    if (!content) {
      return res.status(400).json({ error: 'No content provided' });
    }

    // Store the content in memory
    currentFileContent = content;
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
