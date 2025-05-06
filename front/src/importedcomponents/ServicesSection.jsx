import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import ParkingImage from '../assets/services.jpg'; // Replace with your image path

const ServicesSection = () => {
  return (
    <Box
      sx={{
        marginLeft:'-0.65%',
        marginRight:'-0.65%',
        position: 'relative',
        height: '500px',
        backgroundImage: `url(${ParkingImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#FFFFFF',
        textAlign: 'center',
      }}
    >
      <Box sx={{ zIndex: 1, textAlign: 'center', padding: '20px' }}>
        <Typography variant="h4" gutterBottom>
          EFFIA, acteur majeur du stationnement en Belgique.
        </Typography>
        <Typography variant="body1">
          EFFIA, filiale du groupe Keolis, s'installe au cœur des enjeux de la mobilité. Près de nos clients, nous facilitons leurs déplacements.
        </Typography>
        <Box sx={{ padding:'4% 0% 0% 4%', display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
          <Box sx={{ margin: '0 10px' }}>
            <Typography variant="h5">38</Typography>
            <Typography variant="body1">villes</Typography>
          </Box>
          <Box sx={{ margin: '10px' }}>
            <Typography variant="h4">|</Typography>
            
          </Box>
          <Box sx={{ margin: '0 10px' }}>
            <Typography variant="h5">81</Typography>
            <Typography variant="body1">parkings</Typography>
          </Box>
          <Box sx={{ margin: '10px' }}>
            <Typography variant="h4">|</Typography>
            
          </Box>
          <Box sx={{ margin: '0 10px' }}>
            <Typography variant="h5">44 220</Typography>
            <Typography variant="body1">places</Typography>
          </Box>
        </Box>
        <Button variant="outlined" color="white" sx={{ marginTop: '20px' }}>
          DÉCOUVREZ TOUS NOS SERVICES
        </Button>
      </Box>
    </Box>
  );
};

export default ServicesSection;