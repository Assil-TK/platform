import React, { useEffect, useState } from 'react';
import FileTree from './FileTree';
import { fetchFiles, fetchFileContent } from '../api/githubApi';
import { useNavigate } from 'react-router-dom';

const UserInfoWithTree = ({ user, selectedRepo, selectedFile, setSelectedFile }) => {
  const [fileTree, setFileTree] = useState([]);
  const [openFolders, setOpenFolders] = useState({});
  const [fileContent, setFileContent] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedRepo) {
      fetchFiles(selectedRepo)
        .then(setFileTree)
        .catch(console.error);
    }
  }, [selectedRepo]);

  const handleFileClick = async (filePath) => {
    try {
      const { content } = await fetchFileContent(selectedRepo, filePath);
      setSelectedFile(filePath);
      setFileContent(content);
    } catch (err) {
      console.error('Failed to load file content:', err);
    }
  };

  const handleEditClick = (filePath, content) => {
    navigate('/edit-file', { state: { fileContent: content, selectedRepo, selectedFile: filePath } });
  };

  const toggleFolder = async (folderPath) => {
    const isOpen = openFolders[folderPath];
    setOpenFolders(prev => ({ ...prev, [folderPath]: !isOpen }));

    if (!isOpen) {
      try {
        const files = await fetchFiles(selectedRepo, folderPath);
        setFileTree(prev => updateFileTree(prev, folderPath, files));
      } catch (err) {
        console.error('Failed to load folder contents:', err);
      }
    }
  };

  const updateFileTree = (tree, folderPath, newFiles, currentPath = '') => {
    return tree.map(file => {
      const fullPath = `${currentPath}/${file.name}`;
      if (file.type === 'dir') {
        if (fullPath === folderPath) {
          return { ...file, children: newFiles };
        } else if (file.children) {
          return {
            ...file,
            children: updateFileTree(file.children, folderPath, newFiles, fullPath),
          };
        }
      }
      return file;
    });
  };

  return (
    <div>
      <p><strong>User:</strong> {user?.username || user?.login}</p>
      <p><strong>Repo:</strong> {selectedRepo}</p>
      <p><strong>File:</strong> {selectedFile}</p>

      <FileTree
        files={fileTree}
        openFolders={openFolders}
        handleFileClick={handleFileClick}
        handleEditClick={handleEditClick}
        toggleFolder={toggleFolder}
        fileContent={fileContent}
      />
    </div>
  );
};

export default UserInfoWithTree;
