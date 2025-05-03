import React from 'react';

const RepoSelector = ({ repos, selectedRepo, onSelectRepo }) => (
  <div>
    <h3>Select a Repository</h3>
    <select onChange={(e) => onSelectRepo(e.target.value)} value={selectedRepo}>
      <option value="">--Select Repo--</option>
      {repos.map(repo => (
        <option key={repo.id} value={repo.name}>
          {repo.name} - {repo.private ? 'Private' : 'Public'}
        </option>
      ))}
    </select>
  </div>
);

export default RepoSelector;
