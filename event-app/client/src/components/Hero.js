import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { styled } from '@mui/material/styles';

const HeroContainer = styled(Box)(({ theme }) => ({
  height: '60vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  color: theme.palette.common.white,
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `url('https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: 'brightness(0.5)',
    zIndex: -1,
  },
}));

const Hero = ({ onBrowseClick }) => {
  return (
    <HeroContainer>
      <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom>
        Find Your Next Event
      </Typography>
      <Typography variant="h5" component="p" sx={{ mb: 4 }}>
        Discover exciting events and register with ease.
      </Typography>
      <Button variant="contained" color="secondary" size="large" onClick={onBrowseClick}>
        Browse Events
      </Button>
    </HeroContainer>
  );
};

export default Hero; 