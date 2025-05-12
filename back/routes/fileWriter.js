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

// Route: POST /api/write-file-content
router.post('/write-file-content', (req, res) => {
  const { content, username, repoUrl, branch, selectedFile } = req.body;

  if (!content || !username || !repoUrl || !branch || !selectedFile) {
    return res.status(400).json({ message: 'Missing required fields: content, username, repoUrl, branch, or selectedFile.' });
  }

  const transformedContent = replaceImageUsages(content, username, repoUrl, branch, selectedFile);
  currentFileContent = `// Auto-generated preview file\nimport '../components/blockNavigation';\n${transformedContent}`;

  res.status(200).json({ message: 'File content updated successfully!' });
});

// Route: GET /filecontent
router.get('/filecontent', (req, res) => {
  res.set('Content-Type', 'application/javascript');
  res.send(currentFileContent);
});

// Route: POST /reset-filecontent
router.post('/reset-filecontent', (req, res) => {
  currentFileContent = '// Auto-cleared preview file';
  res.status(200).json({ message: 'File content reset successfully!' });
});

module.exports = router;
