import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchUser, fetchFileContent, updateFileContent } from '../api/githubApi';
import axios from 'axios';

import UserInfoWithTree from '../components/UserInfoWithTree';
import PreviewBox from '../components/PreviewBox';
import CommitInput from '../components/CommitInput';
import AIPromptBox from '../components/AIPromptBox';

const EditFile = () => {
  const { state } = useLocation();
  const { selectedRepo, selectedFile } = state || {};
  const [user, setUser] = useState(null);
  const [content, setContent] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(true);
  const [sha, setSha] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser()
      .then(res => setUser(res.user))
      .catch(() => window.location.href = '/');
  }, []);

  useEffect(() => {
    const loadFile = async () => {
      if (!selectedRepo || !selectedFile) return;
      try {
        const { content, sha } = await fetchFileContent(selectedRepo, selectedFile);
        setContent(content);
        setSha(sha);
        if (user) {
          updateFileContentInPlatform(content, selectedFile);
        }
      } catch (err) {
        console.error('Error loading file:', err);
        setContent('// Error loading file content');
      } finally {
        setLoading(false);
      }
    };
    loadFile();
  }, [selectedRepo, selectedFile, user]);

  useEffect(() => {
    if (user) sendAllComponentsToBackend();
  }, [user]);

  const updateFileContentInPlatform = async (content, selectedFile) => {
    try {
      const repoUrl = `https://github.com/${selectedRepo}`;
      const branch = 'main';
      const username = user?.username || user?.login;

      // Update the preview content
      await axios.post(`${process.env.REACT_APP_API_URL}/api/update-preview`, {
        content: `// Auto-generated preview file\nimport '../components/blockNavigation';\n${content}`
      });
    } catch (error) {
      console.error('Failed to update preview:', error.response?.data || error.message);
    }
  };

  useEffect(() => {
    // Reset preview content on mount
    console.log('Resetting file content preview on mount...');
    fetch(`${process.env.REACT_APP_API_URL}/api/reset-preview`, {
      method: 'POST',
    });
  }, []);

  const sendAllComponentsToBackend = async () => {
    try {
      const username = user?.username || user?.login;
      const repoPath = `${username}/${selectedRepo}`;
  
      const fetchComponentFiles = async (path = '') => {
        const url = `https://api.github.com/repos/${repoPath}/contents/${path}`;
        const response = await axios.get(url);
        let filesToSend = [];
  
        for (const item of response.data) {
          if (item.type === 'dir') {
            const dirName = item.name.toLowerCase();
  
            // If folder name is 'component' or 'components'
            if (dirName === 'component' || dirName === 'components') {
              const compFolderFiles = await axios.get(item.url);
              for (const file of compFolderFiles.data) {
                if (file.type === 'file' && /\.(js|jsx|ts|tsx)$/.test(file.name)) {
                  const fileContentResponse = await axios.get(file.download_url);
                  filesToSend.push({ filename: file.path, content: fileContentResponse.data });
                }
              }
            } else {
              // Recurse into other directories
              const nestedFiles = await fetchComponentFiles(item.path);
              filesToSend = filesToSend.concat(nestedFiles);
            }
          }
        }
  
        return filesToSend;
      };
  
      const files = await fetchComponentFiles();
      console.log('Sending these component files to the backend:', files);
  
      await axios.post(`${process.env.REACT_APP_API_URL}/api/save-imported-components`, { files });
    } catch (err) {
      console.error('Failed to send components to backend:', err.response?.data || err.message);
    }
  };
  
  

  const handleSave = async () => {
    try {
      const sanitizedFile = selectedFile.replace(/^\/+/, '');
      await updateFileContent(selectedRepo, sanitizedFile, content, sha, commitMessage || 'Update file');
      alert('File saved successfully!');
      navigate('/repo-explorer');
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save');
    }
  };

  const handleAIUpdate = async () => {
    setLoadingAI(true);
    try {
      const message = `Here is the code for the file: ${content} and I want to do the following: ${prompt}`;
      const response = await axios.post('https://coder-api.onrender.com/generate', {
        prompt: message
      });

      const updatedCode = response.data.code;
      setContent(updatedCode);
      updateFileContentInPlatform(updatedCode, selectedFile);
    } catch (error) {
      console.error('Error communicating with AI API:', error);
      alert('Failed to get AI response');
    } finally {
      setLoadingAI(false);
    }
  };

  if (loading) return <p>Loading file...</p>;

  return (
    <div>
      <h2>Edit File</h2>

      <UserInfoWithTree user={user} selectedRepo={selectedRepo} selectedFile={selectedFile} />

      <br />
      <textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          updateFileContentInPlatform(e.target.value, selectedFile);
        }}
        rows={25}
        cols={100}
        style={{ whiteSpace: 'pre', fontFamily: 'monospace' }}
      />

      <PreviewBox />

      <AIPromptBox
        prompt={prompt}
        setPrompt={setPrompt}
        handleAIUpdate={handleAIUpdate}
        loadingAI={loadingAI}
      />

      <br />
      <CommitInput
        commitMessage={commitMessage}
        setCommitMessage={setCommitMessage}
      />

      <br />
      <button onClick={handleSave}>Save</button>
    </div>
  );
};

export default EditFile;