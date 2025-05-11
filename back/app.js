const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const axios = require('axios');
const cors = require('cors');
const saveContentRoute = require('./routes/fileWriter');
const resetFileContentRoute = require('./routes/reset-filecontent');
const createComponentsRouter = require('./routes/createcomponents');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5010;

app.use(cors({
  origin: process.env.FRONTEND_URL, // or process.env.FRONTEND_URL if you prefer
  credentials: true
}));

app.use(express.json());
app.use('/api', saveContentRoute);
app.use('/api/reset-filecontent', resetFileContentRoute);
app.use(createComponentsRouter);

// Passport setup
app.use(passport.initialize());

// GitHub Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL
}, (accessToken, refreshToken, profile, done) => {
  profile.accessToken = accessToken;
  return done(null, profile);
}));

// OAuth routes
app.get('/auth/github', passport.authenticate('github', { scope: ['repo'] }));

app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/' }), 
  (req, res) => {
    console.log('GitHub Authenticated User:', req.user);

    if (req.isAuthenticated()) {
      // Generate JWT token
      const token = jwt.sign(
        { id: req.user.id, username: req.user.username },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      // Redirect to frontend with token in the URL
      res.redirect(`${process.env.FRONTEND_URL}/repo-explorer?token=${token}`);
    } else {
      console.error('User authentication failed');
      res.redirect('/error');
    }
  }
);

// API endpoint to get user data
app.get('/api/user', (req, res) => {
  // Since we are using JWT now, no need to check session, instead check for the token.
  const token = req.headers['authorization']?.split(' ')[1]; // Assuming token is passed in the Authorization header

  if (!token) {
    return res.status(401).send("Token missing");
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send("Invalid or expired token");
    }

    // Provide user information if the token is valid
    res.json({ user: decoded });
  });
});

// List GitHub repos
app.get('/api/repos', async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const response = await axios.get('https://api.github.com/user/repos', {
      headers: {
        Authorization: `token ${decoded.accessToken}`,
        Accept: 'application/vnd.github+json'
      }
    });
    res.json(response.data);
  } catch (err) {
    console.error('Error fetching repos:', err.response?.data || err);
    res.status(500).json({ error: 'Failed to fetch repos' });
  }
});

// Fetch files/folders in a specific repo path
app.get('/api/files', async (req, res) => {
  const { repo, path = '' } = req.query;
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const response = await axios.get(`https://api.github.com/repos/${decoded.username}/${repo}/contents/${path}`, {
      headers: {
        Authorization: `token ${decoded.accessToken}`,
        Accept: 'application/vnd.github+json'
      }
    });
    res.json(response.data);
  } catch (err) {
    console.error('Error fetching files:', err.response?.data || err);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

// Fetch content of a file
app.get('/api/file-content', async (req, res) => {
  const { repo, path } = req.query;
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const response = await axios.get(`https://api.github.com/repos/${decoded.username}/${repo}/contents/${path}`, {
      headers: {
        Authorization: `token ${decoded.accessToken}`,
        Accept: 'application/vnd.github+json'
      }
    });

    const isBinary = response.data.encoding === 'base64' && !response.data.content.includes('\n');
    const contentType = response.data._links && response.data._links.self && path.match(/\.(\w+)$/)?.[1];

    if (isBinary && /\.(png|jpe?g|gif|webp|svg)$/i.test(path)) {
      return res.json({
        content: response.data.content,
        contentType: `image/${contentType === 'jpg' ? 'jpeg' : contentType}`,
        sha: response.data.sha,
        isBinary: true
      });
    } else {
      const decodedContent = Buffer.from(response.data.content, 'base64').toString('utf-8');
      return res.json({
        content: decodedContent,
        sha: response.data.sha,
        isBinary: false
      });
    }
  } catch (err) {
    console.error('Error fetching file content:', err.response?.data || err);
    res.status(500).json({ error: 'Failed to fetch file content' });
  }
});

// Update file on GitHub
app.post('/api/update-file', async (req, res) => {
  const { repo, path, content, sha, message } = req.body;
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const fileResponse = await axios.get(
      `https://api.github.com/repos/${decoded.username}/${repo}/contents/${path}`,
      {
        headers: {
          Authorization: `token ${decoded.accessToken}`,
          Accept: 'application/vnd.github+json'
        }
      }
    );

    const fileSha = fileResponse.data.sha;
    const encodedContent = Buffer.from(content).toString('base64'); // Base64 encode the content

    const updateResponse = await axios.put(
      `https://api.github.com/repos/${decoded.username}/${repo}/contents/${path}`,
      {
        message,
        content: encodedContent,
        sha: fileSha, // Use the correct SHA
      },
      {
        headers: {
          Authorization: `token ${decoded.accessToken}`,
          Accept: 'application/vnd.github+json',
        }
      }
    );

    res.json(updateResponse.data);
  } catch (err) {
    console.error('Error during file update:', err.response?.data || err.message || err);
    res.status(500).json({
      error: 'Failed to update file',
      details: err.response?.data || err.message || err,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
