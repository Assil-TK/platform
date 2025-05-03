import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchFileContent, updateFileContent } from '../api/githubApi';

const EditFile = () => {
  const { state } = useLocation();
  const { selectedRepo, selectedFile } = state || {};

  const [content, setContent] = useState('');
  const [commitMessage, setCommitMessage] = useState(''); // 🔥 Ajouté ici
  const [loading, setLoading] = useState(true);
  const [sha, setSha] = useState('');
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
      <button onClick={handleSave}>Save</button>
    </div>
  );
};

export default EditFile;
