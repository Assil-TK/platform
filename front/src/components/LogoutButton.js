import React from 'react';
import { Button } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';

const LogoutButton = () => {
  const handleLogout = async () => {
    try {
      const res = await fetch('http://localhost:5010/logout', {
        method: 'GET',
        credentials: 'include',
      });
      if (res.ok) window.location.href = '/';
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  return (
    <Button
      variant="outlined"
      startIcon={<LogoutIcon />}
      onClick={handleLogout}
      sx={{ mb: 2 }}
    >
      Logout
    </Button>
  );
};

export default LogoutButton;
