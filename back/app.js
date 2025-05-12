const express = require('express');
const passport = require('passport');
const session = require('express-session');
const GitHubStrategy = require('passport-github2').Strategy;
const dotenv = require('dotenv');
const axios = require('axios');
const cors = require('cors');
const saveContentRoute = require('./routes/fileWriter');
const resetFileContentRoute = require('./routes/reset-filecontent');
const createComponentsRouter = require('./routes/createcomponents');
const cookieParser = require('cookie-parser');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5010;

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['set-cookie'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.use(express.json());

// Mount routes
app.use('/api', saveContentRoute);  // This will handle /api/write-file-content, /api/filecontent, and /api/reset-filecontent
app.use(createComponentsRouter);

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: true,
    httpOnly: true,
    sameSite: 'None',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    domain: process.env.NODE_ENV === 'production' ? '.render.com' : undefined
  },
  name: 'sessionId'
}));

// Add cookie parser middleware
app.use(cookieParser());

// Add trust proxy for secure cookies
app.set('trust proxy', 1);

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
    console.log('GitHub Authenticated User:', req.user);
    console.log('Session after GitHub authentication:', req.session);
    console.log('Session ID after auth:', req.sessionID);
    console.log('Cookies after auth:', req.cookies);

    if (req.isAuthenticated()) {
      console.log('User is authenticated, redirecting to frontend...');
      console.log('Redirecting to frontend URL:', `${process.env.FRONTEND_URL}/repo-explorer`);

      // Force session save before redirect
      req.session.save((err) => {
        if (err) {
          console.error('Error saving session:', err);
          return res.redirect('/error');
        }
        
        // Set a test cookie to verify cookie handling
        res.cookie('testCookie', 'sessionWorking', {
          secure: true,
          httpOnly: true,
          sameSite: 'None',
          domain: process.env.NODE_ENV === 'production' ? '.render.com' : undefined
        });

        res.redirect(`${process.env.FRONTEND_URL}/repo-explorer`);
      });
    } else {
      console.error('User authentication failed');
      res.redirect('/error');
    }
  }
);

// Add a test endpoint to verify session
app.get('/api/test-session', (req, res) => {
  console.log('Test Session - Session ID:', req.sessionID);
  console.log('Test Session - Session:', req.session);
  console.log('Test Session - Cookies:', req.cookies);
  console.log('Test Session - Is Authenticated:', req.isAuthenticated());
  
  res.json({
    sessionId: req.sessionID,
    isAuthenticated: req.isAuthenticated(),
    user: req.user,
    cookies: req.cookies
  });
});

// Get current user
app.get('/api/user', (req, res) => {
  console.log("Session ID:", req.sessionID);
  console.log("Session:", req.session);
  console.log("User:", req.user);
  console.log("Is Authenticated:", req.isAuthenticated());
  console.log("Cookies:", req.cookies);
  
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.status(401).send("Not authenticated");
  }
});

app.get('/me', (req, res) => {
  if (req.user) {
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

    const isBinary = response.data.encoding === 'base64' && !response.data.content.includes('\n');
    const fileType = response.data.type;
    const contentType = response.data._links && response.data._links.self && path.match(/\.(\w+)$/)?.[1];

    if (isBinary && /\.(png|jpe?g|gif|webp|svg)$/i.test(path)) {
      // It's an image or binary file: return raw base64
      return res.json({
        content: response.data.content,  // still base64
        contentType: `image/${contentType === 'jpg' ? 'jpeg' : contentType}`,
        sha: response.data.sha,
        isBinary: true
      });
    } else {
      // It's a text file: decode it
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
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const fileResponse = await axios.get(
      `https://api.github.com/repos/${req.user.username}/${repo}/contents/${path}`,
      {
        headers: {
          Authorization: `token ${req.user.accessToken}`,
          Accept: 'application/vnd.github+json',
        },
      }
    );

    const fileSha = fileResponse.data.sha;
    const encodedContent = Buffer.from(content).toString('base64'); // Base64 encode the content

    const updateResponse = await axios.put(
      `https://api.github.com/repos/${req.user.username}/${repo}/contents/${path}`,
      {
        message,
        content: encodedContent,
        sha: fileSha, // Use the correct SHA
      },
      {
        headers: {
          Authorization: `token ${req.user.accessToken}`,
          Accept: 'application/vnd.github+json',
        },
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

// Add in-memory storage for file content
let currentFileContent = '// Auto-cleared preview file';

// Add route to get file content
app.get('/filecontent', (req, res) => {
  res.set('Content-Type', 'application/javascript');
  res.send(currentFileContent);
});

// Add route to update file content
app.post('/api/update-preview', (req, res) => {
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ error: 'No content provided' });
  }
  currentFileContent = content;
  res.json({ message: 'Preview content updated' });
});

// Add route to reset file content
app.post('/api/reset-preview', (req, res) => {
  currentFileContent = '// Auto-cleared preview file';
  res.json({ message: 'Preview content reset' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});