const express = require('express');
const router = express.Router();

// In-memory storage for components
const components = new Map();

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
    // Clear existing components
    components.clear();

    // Store new components in memory
    for (const file of files) {
      const { filename, content } = file;
      
      if (!filename || typeof content !== 'string') {
        console.warn(`Skipping invalid file: ${filename}`);
        continue;
      }
      
      // Only keep the base name of the file (e.g., HeroSection.jsx)
      const componentName = filename.split('/').pop();
      components.set(componentName, content);
      console.log(`Stored component: ${componentName}`);
    }

    // Send success response
    res.status(200).json({ message: 'All components stored successfully!' });
  } catch (err) {
    console.error('Error storing components:', err);
    res.status(500).json({ error: 'Failed to store components' });
  }
});

// GET route to retrieve a specific component
router.get('/api/component/:name', (req, res) => {
  const { name } = req.params;
  const component = components.get(name);
  
  if (!component) {
    return res.status(404).json({ error: 'Component not found' });
  }

  res.set('Content-Type', 'application/javascript');
  res.send(component);
});

// GET route to list all available components
router.get('/api/components', (req, res) => {
  const componentList = Array.from(components.keys());
  res.json({ components: componentList });
});

// POST route to reset components
router.post('/api/reset-components', (req, res) => {
  components.clear();
  res.json({ message: 'All components cleared successfully!' });
});

module.exports = router;