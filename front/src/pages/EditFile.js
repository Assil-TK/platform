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
  const [loadingAI, setLoadingAI] = useState(false);  // Loading state for AI request
  const navigate = useNavigate();

  useEffect(() => {
    const loadFile = async () => {
      if (!selectedRepo || !selectedFile) return;
      try {
        const { content, sha } = await fetchFileContent(selectedRepo, selectedFile);
        setContent(content);
        setSha(sha);
      } catch (err) {
        console.error('Error loading file:', err);
        setContent('// Error loading file content');
      } finally {
        setLoading(false);
      }
    };
    loadFile();
  }, [selectedRepo, selectedFile]);

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
    setLoadingAI(true);  // Start loading AI response
    try {
      const message = `voici le code du fichier:${content} et je veux faire:${prompt}`;
      
      const response = await axios.post('https://coder-api.onrender.com/generate', {
        prompt: message
      });

      const updatedCode = response.data.code;
      setContent(updatedCode);  // Replace content with AI's response
    } catch (error) {
      console.error('Error communicating with AI API:', error);
      alert('Failed to get AI response');
    } finally {
      setLoadingAI(false);  // Stop loading AI response
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
        onChange={(e) => setContent(e.target.value)}
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
          <div className="spinner"></div>  {/* Simple spinner */}
        </div>
      )}

      <br />
      <button onClick={handleSave}>Save</button>
    </div>
  );
};

export default EditFile;
