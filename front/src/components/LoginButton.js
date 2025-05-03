import React from 'react';
import { Button } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';

const LoginButton = () => {
  const handleLogin = () => {
    window.location.href = 'http://localhost:5010/auth/github';
  };

  return (
    <Button
      variant="contained"
      startIcon={<GitHubIcon />}
      onClick={handleLogin}
      sx={{ mt: 2 }}
    >
      Login with GitHub
    </Button>
  );
};

export default LoginButton;
