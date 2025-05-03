// src/utils.js
export const findReactPages = (files) => {
    return files.filter(file => {
      if (file.type !== 'blob') return false; // Ignore non-file types
      
      // Check if the file is a React component
      const isReactPage = file.path.endsWith('.js') || file.path.endsWith('.jsx');
      
      return isReactPage && file.path.startsWith('src/');
    }).map(file => file.path);
  };
  