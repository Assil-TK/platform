import React from 'react';

const FileTree = ({ files, parentPath = '', openFolders, toggleFolder, handleFileClick }) => {
  const renderTree = (files, parentPath) => (
    <ul>
      {(Array.isArray(files) ? files : []).map(file => {
        const filePath = `${parentPath}/${file.name}`;
        if (file.type === 'file') {
          return (
            <li key={file.sha}>
              <button onClick={() => handleFileClick(filePath)}>{file.name}</button>
            </li>
          );
        } else if (file.type === 'dir') {
          return (
            <li key={file.sha}>
              <span
                style={{ cursor: 'pointer' }}
                onClick={() => toggleFolder(filePath)}
              >
                {openFolders[filePath] ? '[-]' : '[+]'} {file.name}
              </span>
              {openFolders[filePath] && file.children && renderTree(file.children, filePath)}
            </li>
          );
        }
        return null;
      })}
    </ul>
  );

  return (
    <div>
      <h3>Repo Tree</h3>
      {renderTree(files, parentPath)}
    </div>
  );
};

export default FileTree;
