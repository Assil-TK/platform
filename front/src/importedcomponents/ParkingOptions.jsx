import React from 'react';
import { Box, Typography, Card, CardContent, CardMedia, Grid, ButtonBase } from '@mui/material';

import centreVille from '../assets/centre.jpg';
import culturel from '../assets/cult.jpg';
import voirie from '../assets/roul.jpg';

const parkingOptions = [
  {
    title: 'Parking De Centre-Ville',
    description: 'Parking du Centre, Parking Cathédrale, Parking Laderoute...',
    image: centreVille, 
  },
  {
    title: 'Parking « Culturel »',
    description: 'Parking IPO, Parking Kinopolis...',
    image: culturel, 
  },
  {
    title: 'Parking De Voirie',
    description: 'Stationnement dans la ville de Braine-le-Comte, Stationnement dans la ville de Roussel...',
    image: voirie, 
  },
];

const ParkingOptions = () => {
  return (
    <Box sx={{ padding: '6% 8% 3%', textAlign: 'center', fontFamily: 'Fira Sans, sans-serif' }}> {/* Reduced bottom padding */}
      <Typography variant="h4" gutterBottom>
        Réservez votre place ou souscrivez un abonnement dans le parking qui vous convient
      </Typography>
      <Grid container spacing={4} justifyContent="center" padding={5} alignItems="stretch"> {/* Reduced padding */}
        {parkingOptions.map((option, index) => (
          <Grid item xs={12} sm={6} md={4} key={index} sx={{ display: 'flex' }}>
            <ButtonBase sx={{ width: '100%', borderRadius: '10px', flexGrow: 1 }}>
              <Card sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                height: '100%', 
                width: '100%',
                transition: 'transform 0.3s ease-in-out', // Smooth transition
                '&:hover': { transform: 'scale(1.05)' } // Zoom effect on hover
              }}>
                <CardMedia
                  component="img"
                  alt={option.title}
                  height="200"
                  image={option.image}
                  title={option.title}
                />
                <CardContent sx={{
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  flexGrow: 1
                }}>
                  <Typography variant="h6" sx={{ flexShrink: 0 }} gutterBottom>
                    {option.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                    {option.description}
                  </Typography>
                </CardContent>
              </Card>
            </ButtonBase>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ParkingOptions;


