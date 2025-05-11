import React, { useEffect, useState } from 'react';
import { fetchUser, fetchRepos, fetchFiles, fetchFileContent } from '../api/githubApi';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const [message, setMessage] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | authenticated | unauthenticated

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const authStatus = params.get('auth');

    if (authStatus === 'failure') {
      setMessage({ type: 'error', text: 'Authentication failed. Please try again.' });
    } else if (authStatus === 'success') {
      setMessage({ type: 'success', text: 'Successfully authenticated with GitHub!' });
    }

    fetchUser()
      .then(res => {
        setUser(res.user);
        setStatus('authenticated');
        setMessage(null);
      })
      .catch(() => {
        setStatus('unauthenticated');
        setMessage({ type: 'error', text: 'Not logged in. Please authenticate.' });
      });

    fetch(`${process.env.REACT_APP_API_URL}/api/reset-filecontent`, {
      method: 'POST',
    });
  }, [location.search]);

  useEffect(() => {
    if (user) {
      fetchRepos()
        .then(setRepos)
        .catch(err => {
          console.error(err);
          setMessage({ type: 'error', text: 'Failed to load repositories.' });
        });
    }
  }, [user]);

  const handleFileClick = (filePath) => {
    setLoading(true);
    setSelectedFile(filePath);
    fetchFileContent(selectedRepo, filePath)
      .then(({ content, type }) => {
        setFileContent(content);
        setFileType(type);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setFileContent('Error loading file content.');
        setFileType('text');
        setLoading(false);
      });
  };

  const handleEditClick = () => {
    // Placeholder for edit functionality
    console.log('Edit clicked');
  };

  const toggleFolder = (folderPath) => {
    setOpenFolders(prev => ({
      ...prev,
      [folderPath]: !prev[folderPath],
    }));

    if (!openFolders[folderPath]) {
      fetchFiles(selectedRepo, folderPath)
        .then(files => {
          setFileTree(prev => [...prev, ...files]);
        })
        .catch(err => {
          console.error(err);
          setMessage({ type: 'error', text: 'Failed to load folder contents.' });
        });
    }
  };

  if (status === 'loading') {
    return <div>Loading session...</div>;
  }

  if (status === 'unauthenticated') {
    return (
      <div>
        {message && (
          <div
            style={{
              padding: '10px',
              margin: '10px 0',
              border: '1px solid red',
              backgroundColor: '#ffe6e6',
              color: 'red',
            }}
          >
            {message.text}
          </div>
        )}
        <a href="/">Go to login</a>
      </div>
    );
  }

  return (
    <div>
      {message && (
        <div
          style={{
            padding: '10px',
            margin: '10px 0',
            border: '1px solid',
            borderColor: message.type === 'error' ? 'red' : 'green',
            color: message.type === 'error' ? 'red' : 'green',
            backgroundColor: message.type === 'error' ? '#ffe6e6' : '#e6ffe6'
          }}
        >
          {message.text}
        </div>
      )}

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
          {loading ? (
            <p>Loading file...</p>
          ) : fileType === 'text' ? (
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
