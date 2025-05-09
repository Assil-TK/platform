const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

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

  // Step 1: Replace imports like `import logo from '../assets/logo.png';`
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
      const newPath = `../importedcomponents/${remainingPath}`;
      return `import ${varName} from "${newPath}"`;
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


// Route: POST /api/write-file-content
router.post('/write-file-content', (req, res) => {
  const { content, username, repoUrl, branch, selectedFile } = req.body;

  if (!content || !username || !repoUrl || !branch || !selectedFile) {
    return res.status(400).json({ message: 'Missing required fields: content, username, repoUrl, branch, or selectedFile.' });
  }

  const filePath = path.join(__dirname, '../../front/src/pages/filecontent.js');

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
