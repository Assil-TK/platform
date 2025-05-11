import React, { useEffect, useState } from 'react';
import { fetchUser, fetchRepos, fetchFiles, fetchFileContent } from '../api/githubApi';
import { useNavigate } from 'react-router-dom';
import RepoSelector from '../components/RepoSelector';
import FileTree from '../components/FileTree';

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
    console.log('Attempting to fetch user info...');
    fetchUser()
      .then(res => {
        console.log('User fetched successfully:', res);
        setUser(res.user);
      })
      .catch((error) => {
        console.error('Failed to fetch user. Redirecting to home.', error);
        window.location.href = '/';
      });
  }, []);

  useEffect(() => {
    // Reset preview filecontent.js on mount
    console.log('Resetting file content preview on mount...');
    fetch(`${process.env.REACT_APP_API_URL}/api/reset-filecontent`, {
      method: 'POST',
    });
  }, []);

  useEffect(() => {
    if (user) {
      console.log('Fetching repos for user:', user);
      fetchRepos()
        .then(repos => {
          console.log('Fetched repos:', repos);
          setRepos(repos);
        })
        .catch(err => {
          console.error('Failed to fetch repos:', err);
        });
    }
  }, [user]);

  useEffect(() => {
    if (selectedRepo) {
      console.log('Fetching files for repo:', selectedRepo);
      setLoading(true);
      fetchFiles(selectedRepo)
        .then(files => {
          console.log('Fetched files:', files);
          setFileTree(files);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [selectedRepo]);

  const handleFileClick = async (filePath) => {
    console.log('File clicked:', filePath);
    try {
      const { content, encoding } = await fetchFileContent(selectedRepo, filePath);
      setSelectedFile(filePath);

      if (encoding === 'base64') {
        setFileType('binary');
        const ext = filePath.split('.').pop().toLowerCase();
        if (['png', 'jpg', 'jpeg', 'gif'].includes(ext)) {
          setFileContent(`data:image/${ext};base64,${content}`);
        } else {
          setFileContent('Binary file content cannot be displayed.');
        }
      } else {
        setFileType('text');
        setFileContent(content);
        if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
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
    console.log('Navigating to edit file:', filePath);
    navigate('/edit-file', { state: { fileContent: content, selectedRepo, selectedFile: filePath } });
  };

  const toggleFolder = async (folderPath) => {
    const isOpen = openFolders[folderPath];
    setOpenFolders(prev => ({ ...prev, [folderPath]: !isOpen }));

    if (!isOpen) {
      try {
        console.log('Opening folder:', folderPath);
        setLoading(true);
        const files = await fetchFiles(selectedRepo, folderPath);
        setFileTree(prev => updateFileTree(prev, folderPath, files));
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
            children: updateFileTree(file.children, folderPath, newFiles, fullPath),
          };
        }
      }
      return file;
    });
  };

  return (
    <div>
      <h2>Welcome, {user?.username || user?.login}</h2>

      <RepoSelector repos={repos} selectedRepo={selectedRepo} onSelectRepo={setSelectedRepo} />

      {selectedRepo && (
        <div>
          <h3>Repo Tree</h3>
          <FileTree
            files={fileTree}
            openFolders={openFolders}
            handleFileClick={handleFileClick}
            handleEditClick={handleEditClick}
            toggleFolder={toggleFolder}
            fileContent={fileContent}
          />
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
                <img src={fileContent} alt="Preview" />
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
