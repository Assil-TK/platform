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
  const [message, setMessage] = useState(null);  // ✅ NEW: message state

  const navigate = useNavigate();
  const location = useLocation(); // ✅ NEW: to read query params

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const authStatus = params.get('auth');

    if (authStatus === 'failure') {
      setMessage({ type: 'error', text: 'Authentication failed. Please try again.' });
    } else if (authStatus === 'success') {
      setMessage({ type: 'success', text: 'Successfully authenticated with GitHub!' });
    }

    // Always attempt to fetch user (can fail and show error)
    fetchUser()
      .then(res => {
        setUser(res.user);
        setMessage(null); // clear message if user loads fine
      })
      .catch(() => {
        setMessage({ type: 'error', text: 'Not logged in. Please authenticate.' });
      });

    // Reset preview filecontent.js
    fetch(`${process.env.REACT_APP_API_URL}/api/reset-filecontent`, {
      method: 'POST',
    });

  }, [location.search]); // ✅ trigger on location.search change

  useEffect(() => {
    if (user) {
      fetchRepos().then(setRepos).catch(console.error);
    }
  }, [user]);

  // ... (rest of your unchanged useEffects and functions)

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
