// components/FileTree.js
import React from 'react';

const FileTree = ({
  files,
  parentPath = '',
  openFolders,
  handleFileClick,
  handleEditClick,
  toggleFolder,
  fileContent
}) => {
  const renderTree = (nodes, currentPath = '') => {
    return (
      <ul>
        {(Array.isArray(nodes) ? nodes : []).map((file) => {
          const filePath = `${currentPath}/${file.name}`;
          if (file.type === 'file') {
            return (
              <li key={file.sha}>
                <button onClick={() => handleFileClick(filePath)}>{file.name}</button>
                <button onClick={() => handleEditClick(filePath, fileContent)}>Edit</button>
              </li>
            );
          } else if (file.type === 'dir') {
            return (
              <li key={file.sha}>
                <span style={{ cursor: 'pointer' }} onClick={() => toggleFolder(filePath)}>
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
  };

  return <div>{renderTree(files, parentPath)}</div>;
};

export default FileTree;
