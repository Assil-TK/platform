const express = require('express');
const passport = require('passport');
const session = require('express-session');
const GitHubStrategy = require('passport-github2').Strategy;
const dotenv = require('dotenv');
const axios = require('axios');
const cors = require('cors');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5010;

// Add this middleware:
app.use(express.json());

// CORS for frontend access
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

// GitHub Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL
}, (accessToken, refreshToken, profile, done) => {
  // Attach access token to the user object
  profile.accessToken = accessToken;
  return done(null, profile);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

// OAuth routes
app.get('/auth/github', passport.authenticate('github', { scope: ['repo'] }));

app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => {
    // Successful login
    res.redirect(`${process.env.FRONTEND_URL}/repo-explorer`);
  }
);

// New logout route
app.get('/logout', (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.redirect(`${process.env.FRONTEND_URL}/`); // Redirect to the homepage or login page
    });
  });
});



// Get current user
app.get('/api/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// List GitHub repos
app.get('/api/repos', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const response = await axios.get('https://api.github.com/user/repos', {
      headers: {
        Authorization: `token ${req.user.accessToken}`,
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
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const response = await axios.get(`https://api.github.com/repos/${req.user.username}/${repo}/contents/${path}`, {
      headers: {
        Authorization: `token ${req.user.accessToken}`,
        Accept: 'application/vnd.github+json',
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
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const response = await axios.get(`https://api.github.com/repos/${req.user.username}/${repo}/contents/${path}`, {
      headers: {
        Authorization: `token ${req.user.accessToken}`,
        Accept: 'application/vnd.github+json',
      }
    });

    // Decoding content from base64
    const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
    res.json({ content });
  } catch (err) {
    console.error('Error fetching file content:', err.response?.data || err);
    res.status(500).json({ error: 'Failed to fetch file content' });
  }
});

app.post('/api/update-file', async (req, res) => {
  const { repo, path, content } = req.body; // Expecting body with repo, path, and content
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Get the current file sha for the file to be updated
    const fileResponse = await axios.get(
      `https://api.github.com/repos/${req.user.username}/${repo}/contents/${path}`,
      {
        headers: {
          Authorization: `token ${req.user.accessToken}`,
          Accept: 'application/vnd.github+json',
        },
      }
    );

    const sha = fileResponse.data.sha; // File's sha hash is needed for update
    const encodedContent = Buffer.from(content).toString('base64'); // Base64 encode the content

    // Update the file via GitHub API
    const updateResponse = await axios.put(
      `https://api.github.com/repos/${req.user.username}/${repo}/contents/${path}`,
      {
        message: 'Update file content',
        content: encodedContent,
        sha: sha,
      },
      {
        headers: {
          Authorization: `token ${req.user.accessToken}`,
          Accept: 'application/vnd.github+json',
        },
      }
    );

    res.json({ message: 'File updated successfully' });
  } catch (err) {
    console.error('Error updating file:', err);
    res.status(500).json({ error: 'Failed to update file' });
  }
});


app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});
