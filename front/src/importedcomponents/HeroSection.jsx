import React from 'react';
import { Box, Typography } from '@mui/material';
import Hero from '../assets/hero.png';

const HeroSection = () => {
  return (
    <Box
      sx={{
        
        marginLeft:'-0.65%',
        marginRight:'-0.65%',
        height: '480px',
        backgroundImage: `url(${Hero})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#FFFFFF',
      }}
    >
      <Typography variant="h4" sx={{ fontFamily: 'Fira Sans, sans-serif' }}>Bienvenue dans nos parkings</Typography>
    </Box>
  );
};

export default HeroSection;
