const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// POST route to save imported components
router.post('/api/save-imported-components', async (req, res) => {
  const { files } = req.body;

  // Log the received request body for debugging
  console.log('Received files:', files);

  // Check if the request body contains an array of files
  if (!Array.isArray(files)) {
    return res.status(400).json({ error: 'Invalid format. Expected array of files.' });
  }

  try {
    // Create components directory if it doesn't exist
    const componentsDir = path.join(__dirname, '../../front/src/importedcomponents');
    if (!fs.existsSync(componentsDir)) {
      fs.mkdirSync(componentsDir, { recursive: true });
    }

    // Clear existing components
    const existingFiles = fs.readdirSync(componentsDir);
    for (const file of existingFiles) {
      fs.unlinkSync(path.join(componentsDir, file));
    }

    // Store new components
    for (const file of files) {
      const { filename, content } = file;
      
      if (!filename || typeof content !== 'string') {
        console.warn(`Skipping invalid file: ${filename}`);
        continue;
      }
      
      const componentName = filename.split('/').pop();
      const filePath = path.join(componentsDir, componentName);
      
      fs.writeFileSync(filePath, content);
      console.log(`Stored component: ${componentName}`);
    }

    res.status(200).json({ message: 'All components stored successfully!' });
  } catch (err) {
    console.error('Error storing components:', err);
    res.status(500).json({ error: 'Failed to store components' });
  }
});

// GET route to retrieve a specific component
router.get('/api/component/:name', (req, res) => {
  const { name } = req.params;
  
  try {
    const componentPath = path.join(__dirname, '../../front/src/importedcomponents', name);
    if (!fs.existsSync(componentPath)) {
      return res.status(404).json({ error: 'Component not found' });
    }

    const content = fs.readFileSync(componentPath, 'utf8');
    res.set('Content-Type', 'application/javascript');
    res.send(content);
  } catch (err) {
    console.error('Error reading component:', err);
    res.status(500).json({ error: 'Failed to read component' });
  }
});

// GET route to list all available components
router.get('/api/components', (req, res) => {
  try {
    const componentsDir = path.join(__dirname, '../../front/src/importedcomponents');
    if (!fs.existsSync(componentsDir)) {
      return res.json({ components: [] });
    }
    
    const componentList = fs.readdirSync(componentsDir);
    res.json({ components: componentList });
  } catch (err) {
    console.error('Error listing components:', err);
    res.status(500).json({ error: 'Failed to list components' });
  }
});

// POST route to reset components
router.post('/api/reset-components', (req, res) => {
  try {
    const componentsDir = path.join(__dirname, '../../front/src/importedcomponents');
    if (fs.existsSync(componentsDir)) {
      const files = fs.readdirSync(componentsDir);
      for (const file of files) {
        fs.unlinkSync(path.join(componentsDir, file));
      }
    }
    
    res.json({ message: 'All components cleared successfully!' });
  } catch (err) {
    console.error('Error clearing components:', err);
    res.status(500).json({ error: 'Failed to clear components' });
  }
});

module.exports = router;