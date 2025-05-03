// frontend/src/utils/detectPages.js

const detectPages = (files, prefix = '') => {
  let pageFiles = [];
  let mainPage = '';

  files.forEach((file) => {
    const fullPath = `${prefix}/${file.name}`;

    // Skip non-relevant files
    if (file.name === 'README.md' || file.name === '.gitignore') {
      return;
    }

    // If it's a directory, recursively scan inside it
    if (file.type === 'dir' && file.children) {
      const nested = detectPages(file.children, fullPath);
      pageFiles = [...pageFiles, ...nested.pageFiles];
    }

    // If it's a file, check for frontend page extensions
    if (file.type === 'file') {
      // Focus only on JS, JSX, and HTML files (common frontend page formats)
      if (
        file.name.endsWith('.js') ||
        file.name.endsWith('.jsx') ||
        file.name.endsWith('.html')
      ) {
        // Detect main page based on common names (e.g., index.js, App.js)
        if (file.name === 'index.js' || file.name === 'App.js') {
          mainPage = fullPath; // Set the main page
        }
        pageFiles.push(fullPath); // Add this file as a page
      }
    }
  });

  // Return an object with detected pages and the main page
  return { canPreview: pageFiles.length > 0, pageFiles, mainPage };
};

export default detectPages;
