import React, { useEffect, useState } from 'react';
import { fetchUser, fetchRepos, fetchFiles, fetchFileContent } from '../api/githubApi';
import { useNavigate } from 'react-router-dom';

const RepoExplorer = () => {
  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [fileTree, setFileTree] = useState([]);
  const [fileContent, setFileContent] = useState('');
  const [fileType, setFileType] = useState('text');
  const [selectedRepo, setSelectedRepo] = useState('');
  const [selectedFile, setSelectedFile] = useState('');
  const [openFolders, setOpenFolders] = useState({});
  const [loading, setLoading] = useState(false);
  const [previewComponent, setPreviewComponent] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchUser()
      .then(res => setUser(res.user))
      .catch(() => window.location.href = '/');
  }, []);

  useEffect(() => {
    if (user) {
      const loadRepos = async () => {
        try {
          const data = await fetchRepos();
          setRepos(data);
        } catch (err) {
          console.error('Failed to load repos:', err);
        }
      };
      loadRepos();
    }
  }, [user]);

  useEffect(() => {
    if (selectedRepo) {
      const loadFiles = async () => {
        try {
          setLoading(true);
          const files = await fetchFiles(selectedRepo);
          setFileTree(files);
        } catch (err) {
          console.error('Failed to load files:', err);
        } finally {
          setLoading(false);
        }
      };
      loadFiles();
    }
  }, [selectedRepo]);

  const handleFileClick = async (filePath) => {
    try {
      const { content, encoding } = await fetchFileContent(selectedRepo, filePath);
      setSelectedFile(filePath);

      if (encoding === 'base64') {
        setFileType('binary');
        const fileExtension = filePath.split('.').pop().toLowerCase();
        if (['png', 'jpg', 'jpeg', 'gif'].includes(fileExtension)) {
          setFileContent(`data:image/${fileExtension};base64,${content}`);
        } else {
          setFileContent('Binary file content cannot be displayed.');
        }
      } else {
        setFileType('text');
        setFileContent(content);

        if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
          const Component = () => <div dangerouslySetInnerHTML={{ __html: content }} />;
          setPreviewComponent(Component);
        } else {
          setPreviewComponent(null);
        }
      }
    } catch (err) {
      console.error('Failed to load file content:', err);
    }
  };

  const handleEditClick = (filePath, content) => {
    navigate('/edit-file', { state: { fileContent: content, selectedRepo, selectedFile: filePath } });
  };

  const toggleFolder = async (folderPath) => {
    const isOpen = openFolders[folderPath];
    setOpenFolders((prev) => ({ ...prev, [folderPath]: !isOpen }));

    if (!isOpen) {
      try {
        setLoading(true);
        const files = await fetchFiles(selectedRepo, folderPath);
        setFileTree((prevTree) => updateFileTree(prevTree, folderPath, files));
      } catch (err) {
        console.error('Failed to load folder contents:', err);
      } finally {
        setLoading(false);
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
            children: updateFileTree(file.children, folderPath, newFiles, fullPath)
          };
        }
      }
      return file;
    });
  };

  const renderFileTree = (files, parentPath = '') => {
    return (
      <ul>
        {(Array.isArray(files) ? files : []).map(file => {
          const filePath = `${parentPath}/${file.name}`;
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
                <span
                  style={{ cursor: 'pointer' }}
                  onClick={() => toggleFolder(filePath)}
                >
                  {openFolders[filePath] ? '[-]' : '[+]'} {file.name}
                </span>
                {openFolders[filePath] && file.children && renderFileTree(file.children, filePath)}
              </li>
            );
          }
          return null;
        })}
      </ul>
    );
  };

  return (
    <div>
      <h2>Welcome, {user?.username || user?.login}</h2>

      <h3>Select a Repository</h3>
      <select onChange={(e) => setSelectedRepo(e.target.value)} value={selectedRepo}>
        <option value="">--Select Repo--</option>
        {repos.map(repo => (
          <option key={repo.id} value={repo.name}>
            {repo.name} - {repo.private ? 'Private' : 'Public'}
          </option>
        ))}
      </select>

      {selectedRepo && (
        <div>
          <h3>Repo Tree</h3>
          {renderFileTree(fileTree)}
        </div>
      )}

      {selectedFile && (
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
      )}
    </div>
  );
};

export default RepoExplorer;
