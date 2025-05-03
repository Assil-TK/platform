import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import LoginButton from '../components/LoginButton';

const Home = () => {
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 10, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Welcome to GitHub Explorer
        </Typography>
        <LoginButton />
      </Box>
    </Container>
  );
};

export default Home;
