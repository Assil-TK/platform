import React from 'react';

const FilePreview = ({ filename, code }) => {
  const isImage = /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(filename);
  const isJSX = /\.(jsx?|tsx?)$/i.test(filename);

  const getImageMimeType = (ext) => {
    switch (ext.toLowerCase()) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';
      case 'bmp':
        return 'image/bmp';
      case 'svg':
        return 'image/svg+xml';
      default:
        return 'application/octet-stream';
    }
  };

  return (
    <div>
      <h3>File Preview</h3>
      <div id="preview-container" style={{ marginTop: '20px' }}>
        {!isJSX && isImage ? (
          code ? (
            <img
              src={`data:${getImageMimeType(filename.split('.').pop())};base64,${code}`}
              alt="Preview"
              style={{ maxWidth: '100%', maxHeight: '500px' }}
            />
          ) : (
            <p>No image data available.</p>
          )
        ) : (
          !isJSX && <p style={{ fontStyle: 'italic' }}>No preview available for this file.</p>
        )}
      </div>
    </div>
  );
};

// Correct default export
export default FilePreview;
