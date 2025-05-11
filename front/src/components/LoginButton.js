import React, { useState } from 'react';
import { Button, TextField } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';

const LoginButton = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      // Make an API call to your backend to authenticate the user
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const { token } = await response.json();

      // Save the JWT token in localStorage
      localStorage.setItem('token', token);

      // Optionally redirect after login or refresh page
      window.location.href = '/repo-explorer';  // You can change this to your desired page
    } catch (error) {
      console.error('Login Error:', error);
      alert('Login failed. Please try again.');
    }
  };

  return (
    <div>
      <TextField
        label="Username"
        variant="outlined"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Password"
        variant="outlined"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Button
        variant="contained"
        startIcon={<GitHubIcon />}
        onClick={handleLogin}
        sx={{ mt: 2 }}
      >
        Login
      </Button>
    </div>
  );
};

export default LoginButton;
