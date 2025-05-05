import React from 'react';

const CommitInput = ({ commitMessage, setCommitMessage }) => (
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
);

export default CommitInput;
