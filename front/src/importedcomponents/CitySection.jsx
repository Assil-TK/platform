import React, { useRef } from 'react';
import { Box, Typography, Card, CardMedia, Button, ButtonBase } from '@mui/material';

const cities = [
  { name: 'COURTRAI', parkingCount: 1, image: '/assets/courtrai.jpg' },
  { name: 'LOUVAIN', parkingCount: 3, image: '/assets/Leuven.jpg' },
  { name: 'NAMUR', parkingCount: 3, image: '/assets/namur.jpg' },
  { name: 'GENK', parkingCount: 1, image: '/assets/genk.jpg' },
  { name: 'BRUXELLES', parkingCount: 5, image: '/assets/bruxelles.jpg' },
  { name: 'ANTWERPEN', parkingCount: 2, image: '/assets/antwerpen.jpg' },
];

const CitySection = () => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <Box sx={{ padding: '4% 6% 8%', textAlign: 'center' }}>
      <Typography variant="h4" padding='3%' gutterBottom>
        Découvrez nos parkings dans ces villes
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
        <Button
          onClick={() => scroll('left')}
          variant="contained"
          color="primary"
          sx={{
            minWidth: '30px',
            height: '30px',
            padding: '5px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            color: 'blue',
          }}
        >
          ←
        </Button>
        <Box
          ref={scrollRef}
          sx={{
            display: 'flex',
            overflowX: 'auto',
            scrollBehavior: 'smooth',
            padding: '10px',
            gap: '10px',
            '&::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none', 
          }}
        >
          {cities.map((city, index) => (
            <ButtonBase
              key={index}
              sx={{
                minWidth: '200px',
                cursor: 'pointer',
                transition: 'transform 0.3s ease-in-out', // Smooth zoom transition
                '&:hover': {
                  transform: 'scale(1.03)', // Slight zoom effect on hover
                },
               
              }}
            >
              <Card sx={{ minWidth: '200px', cursor: 'pointer' }}>
                <CardMedia
                  component="img"
                  alt={city.name}
                  height="200"
                  image={city.image}
                  title={city.name}
                />
                <Box sx={{ padding: '10px' }}>
                  <Typography variant="h6" gutterBottom>
                    {city.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {city.parkingCount} Parkings
                  </Typography>
                </Box>
              </Card>
            </ButtonBase>
          ))}
        </Box>
        <Button
          onClick={() => scroll('right')}
          variant="contained"
          color="primary"
          sx={{
            minWidth: '30px',
            height: '30px',
            padding: '5px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            color: 'blue',
          }}
        >
          →
        </Button>
      </Box>
    </Box>
  );
};

export default CitySection;

