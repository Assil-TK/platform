const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

router.post('/', (req, res) => {
  const filePath = path.join(__dirname, '../../front/src/pages/filecontent.js');
  const emptyContent = `// Auto-cleared preview file`;

  fs.writeFile(filePath, emptyContent, 'utf8', (err) => {
    if (err) {
      console.error('Error clearing filecontent.js:', err);
      return res.status(500).json({ message: 'Failed to reset file' });
    }
    console.log('filecontent.js cleared.');
    res.status(200).json({ message: 'File cleared successfully!' });
  });
});

module.exports = router;
