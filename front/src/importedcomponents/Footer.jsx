import React from 'react';
import { Box, Typography, Link } from '@mui/material';

const Footer = () => {
  return (
    <Box
      sx={{
        marginLeft:'-0.65%',
        marginRight:'-0.65%',
        backgroundColor: '#333', 
        color: '#fefe', 
        padding: '4% 10%', 
        display: 'flex',
        justifyContent: 'space-between',  
      }}
    >
      <Typography variant="body2" sx={{ marginTop: '3%' }}> {/* Smaller text size */}
        <Link href="#contact" color="inherit" underline="hover" sx={{ marginRight: '20px' }}>
          Nous contacter
        </Link>
      </Typography>
      <Typography variant="body2" sx={{ marginTop: '3%'}}> {/* Smaller text size */}
        <Link href="#reglement" color="inherit" underline="hover">
          Règlement d’ordre intérieur
        </Link>
      </Typography>
    </Box>
  );
};

export default Footer;

