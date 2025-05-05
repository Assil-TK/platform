import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchUser, fetchFileContent, updateFileContent } from '../api/githubApi'; // Use githubApi
import axios from 'axios';

const EditFile = () => {
  const { state } = useLocation();
  const { selectedRepo, selectedFile } = state || {};

  const [user, setUser] = useState(null); // State for storing user data
  const [content, setContent] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(true);
  const [sha, setSha] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const navigate = useNavigate();

  // Fetch user data using githubApi
  useEffect(() => {
    fetchUser()
      .then(res => {
        console.log(res.user);  // Check the API response
        setUser(res.user);
      })
      .catch(() => window.location.href = '/');
  }, []);
  

  useEffect(() => {
    const loadFile = async () => {
      if (!selectedRepo || !selectedFile) return;
      try {
        const { content, sha } = await fetchFileContent(selectedRepo, selectedFile);
        setContent(content);
        setSha(sha);
  
        // Check if user is available before calling the function
        if (user) {
          updateFileContentInPlatform(content, selectedFile);  // Update filecontent.js with selectedFile
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

  const updateFileContentInPlatform = async (content, selectedFile,) => {
    try {
      const repoUrl = `https://github.com/${selectedRepo}`;  // Correct template string
      const branch = 'main'; // or dynamic if needed
      const username = user?.username || user?.login; // Use either `username` or `login` based on your API response
  
      // Ensure the user is sent in the request
      await axios.post('http://localhost:5010/api/write-file-content', {
        content,
        repoUrl,
        branch,
        selectedFile,
        username,
      });
  
      console.log('filecontent.js updated successfully from frontend');
    } catch (error) {
      console.error('Failed to update filecontent.js:', error.response?.data || error.message);
    }
  };
  
  

  const handleSave = async () => {
    try {
      const sanitizedFile = selectedFile.replace(/^\/+/, '');  // Remove leading slashes
      await updateFileContent(selectedRepo, sanitizedFile, content, sha, commitMessage || 'Update file'); // Using githubApi to update file content
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
      updateFileContentInPlatform(updatedCode, selectedFile); // Update the file with AI-generated content
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
      <p><strong>Repo:</strong> {selectedRepo}</p>
      <p><strong>File:</strong> {selectedFile}</p>

      {user ? (
        <p><strong>User:</strong> {user?.username || user?.login}</p> // Displaying the fetched username
      ) : (
        <p>Loading user...</p>
      )}

      <label>
        Commit Message:{' '}
        <input
          type="text"
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          placeholder="Enter commit message"
          style={{ width: '400px', marginBottom: '10px' }}
        />
      </label>

      <br />
      <textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          updateFileContentInPlatform(e.target.value, selectedFile); // Update with new content
        }}
        rows={25}
        cols={100}
        style={{ whiteSpace: 'pre', fontFamily: 'monospace' }}
      />

      <br />
      <label>
        Your Prompt (Modification Request):{' '}
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={5}
          cols={100}
          placeholder="Describe what you want to change in the code"
        />
      </label>

      <br />
      <button onClick={handleAIUpdate} disabled={loadingAI}>
        {loadingAI ? 'Processing...' : 'Send to AI'}
      </button>

      {loadingAI && (
        <div>
          <p>Loading AI response...</p>
          <div className="spinner"></div>
        </div>
      )}

      {/* 🧠 Preview Box */}
      <div style={{ border: '1px solid #ccc', margin: '20px 0', height: '400px' }}>
        <iframe
          src="http://localhost:3000/filecontent"
          title="Live Preview"
          width="100%"
          height="100%"
          style={{ border: 'none' }}
        />
      </div>

      <button onClick={handleSave}>Save</button>
    </div>
  );
};

export default EditFile;

