import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchFileContent, updateFileContent } from '../api/githubApi';
import axios from 'axios';

const EditFile = () => {
  const { state } = useLocation();
  const { selectedRepo, selectedFile } = state || {};

  const [content, setContent] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(true);
  const [sha, setSha] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadFile = async () => {
      if (!selectedRepo || !selectedFile) return;
      try {
        const { content, sha } = await fetchFileContent(selectedRepo, selectedFile);
        setContent(content);
        setSha(sha);
        updateFileContentInPlatform(content);  // Update filecontent.js
      } catch (err) {
        console.error('Error loading file:', err);
        setContent('// Error loading file content');
      } finally {
        setLoading(false);
      }
    };
    loadFile();
  }, [selectedRepo, selectedFile]);

  const updateFileContentInPlatform = async (content) => {
    try {
      await axios.post('http://localhost:5010/api/write-file-content', { content });
      console.log('filecontent.js updated successfully from frontend');
    } catch (error) {
      console.error('Failed to update filecontent.js:', error);
    }
  };

  const handleSave = async () => {
    try {
      await updateFileContent(selectedRepo, selectedFile, content, sha, commitMessage || 'Update file');
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
      updateFileContentInPlatform(updatedCode);
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
          updateFileContentInPlatform(e.target.value);
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
