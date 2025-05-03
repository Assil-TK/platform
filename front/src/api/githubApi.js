//../api/githubApi
export async function fetchUser() {
  const res = await fetch('http://localhost:5010/api/user', {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Not logged in');
  return res.json();
}

export async function fetchRepos() {
  const res = await fetch('http://localhost:5010/api/repos', {
    credentials: 'include',
  });
  return res.json();
}
export async function fetchFiles(repo, path = '') {
  const res = await fetch(`http://localhost:5010/api/files?repo=${repo}&path=${path}`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch files');
  return res.json();
}

export async function fetchFileContent(repo, path) {
  const res = await fetch(`http://localhost:5010/api/file-content?repo=${repo}&path=${path}`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch file content');
  return res.json();
}
export async function updateFileContent(repo, path, content, sha, message) {
const res = await fetch('http://localhost:5010/api/update-file', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ repo, path, content, sha, message }), // 🔥 Ajout du message
  credentials: 'include',
});

if (!res.ok) throw new Error('Failed to update file');
return res.json();
}
