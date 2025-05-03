// src/components/FilePreview.js
import React from 'react';
import PagePreview from './PagePreview'; // Assuming this component is already available

const FilePreview = ({ previewComponent, fileContent, selectedFile, selectedRepo }) => {
  return (
    <div>
      {previewComponent === 'html' && (
        <div>
          <h4>HTML Preview</h4>
          <iframe srcDoc={fileContent} style={{ width: '100%', height: '600px', border: '1px solid #ccc' }} title="HTML Preview" />
        </div>
      )}

      {previewComponent === 'react' && selectedFile && (
        <div>
          <h4>React Component Preview</h4>
          <PagePreview repo={selectedRepo} selectedPage={selectedFile} />
        </div>
      )}
    </div>
  );
};

export default FilePreview;
