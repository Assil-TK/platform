import React from 'react';

const FileContent = ({ fileType, fileContent, selectedFile }) => {
  if (!selectedFile) return null;

  return (
    <div>
      <h4>File Content</h4>
      {fileType === 'text' ? (
        <pre>{fileContent}</pre>
      ) : (
        <div>
          {fileContent.startsWith('data:image/') ? (
            <img src={fileContent} alt="File preview" />
          ) : (
            <p>{fileContent}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default FileContent;
