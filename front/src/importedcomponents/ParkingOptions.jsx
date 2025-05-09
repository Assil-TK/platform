import React from 'react';
import { Box, Typography, Card, CardContent, CardMedia, Grid, ButtonBase } from '@mui/material';

const centreVille = "https://raw.githubusercontent.com/Assil-TK/Sultan-Project/main/sultan/src/assets/centre.jpg";
const culturel = "https://raw.githubusercontent.com/Assil-TK/Sultan-Project/main/sultan/src/assets/cult.jpg";
const voirie = "https://raw.githubusercontent.com/Assil-TK/Sultan-Project/main/sultan/src/assets/roul.jpg";

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
    <Box sx={{ padding: '6% 8% 3%', textAlign: 'center', fontFamily: 'Fira Sans, sans-serif', display: 'flex', flexDirection: 'row', justifyContent: 'space-around', flexWrap: 'wrap' }}>
      {parkingOptions.map((option, index) => (
        <Box key={index} sx={{ marginBottom: '16px', maxWidth: '30%', flexGrow: 1 }}>
          <ButtonBase sx={{ width: '100%', borderRadius: '10px', }}>
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
        </Box>
      ))}
    </Box>
  );
};

export default ParkingOptions;