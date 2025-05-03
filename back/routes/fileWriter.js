// routes/fileWriter.js:

const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// POST request to write content to file
router.post('/write-file-content', (req, res) => {
  const { content } = req.body;

  // Make sure to update this path to the correct location of your frontend file
  const filePath = path.join(__dirname, '../../front/src/pages/filecontent.js'); // Adjust path accordingly

  // If you want to keep the comment at the top of the file, use this:
  const contentToSave = `// This is the content of the file:\n${content}`;

  // Writing to the file
  fs.writeFile(filePath, contentToSave, 'utf8', (err) => {
    if (err) {
      console.error('Error writing to file:', err);
      return res.status(500).json({ message: 'Failed to write file' });
    }
    res.status(200).json({ message: 'File updated successfully!' });
  });
});

module.exports = router;
