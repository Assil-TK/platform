// ../api/githubApi

// Helper function to get the token from localStorage
const getToken = () => localStorage.getItem('token');

// Fetch current logged-in user details
export async function fetchUser() {
  const token = getToken();
  if (!token) {
    throw new Error('No token found, please login first.');
  }

  const res = await fetch(`${process.env.REACT_APP_API_URL}/api/user`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorDetails = await res.text();
    throw new Error(`Not logged in: ${errorDetails}`);
  }

  return res.json();
}

// Fetch user's repositories
export async function fetchRepos() {
  const token = getToken();
  if (!token) {
    throw new Error('No token found, please login first.');
  }

  const res = await fetch(`${process.env.REACT_APP_API_URL}/api/repos`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorDetails = await res.text();
    throw new Error(`Failed to fetch repos: ${errorDetails}`);
  }

  return res.json();
}

// Fetch files from a specific repo and path
export async function fetchFiles(repo, path = '') {
  const token = getToken();
  if (!token) {
    throw new Error('No token found, please login first.');
  }

  const res = await fetch(`${process.env.REACT_APP_API_URL}/api/files?repo=${repo}&path=${path}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorDetails = await res.text();
    throw new Error(`Failed to fetch files: ${errorDetails}`);
  }

  return res.json();
}

// Fetch content of a specific file from a repo
export async function fetchFileContent(repo, path) {
  const token = getToken();
  if (!token) {
    throw new Error('No token found, please login first.');
  }

  const res = await fetch(`${process.env.REACT_APP_API_URL}/api/file-content?repo=${repo}&path=${path}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorDetails = await res.text();
    throw new Error(`Failed to fetch file content: ${errorDetails}`);
  }

  return res.json();
}

// Update content of a file in a repo
export async function updateFileContent(repo, path, content, sha, message) {
  const token = getToken();
  if (!token) {
    throw new Error('No token found, please login first.');
  }

  const res = await fetch(`${process.env.REACT_APP_API_URL}/api/update-file`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ repo, path, content, sha, message }),
  });

  if (!res.ok) {
    const errorDetails = await res.text();
    throw new Error(`Failed to update file: ${errorDetails}`);
  }

  return res.json();
}
