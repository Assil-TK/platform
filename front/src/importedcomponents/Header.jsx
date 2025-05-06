import React from 'react';
import { AppBar, Toolbar, Button, Box } from '@mui/material';
import logo from '../assets/effia.png'; 

const Header = () => {
  return (
    <AppBar position="fixed" sx={{ backgroundColor: '#1B374C',marginTop: 'auto',borderBottom: '5px solid #F39325', }}>
      <Toolbar>
        {/* Logo */}
        <Box component="img" 
          src={logo} 
          alt="EFFIA Logo" 
          sx={{ height: 20 }} 
        />

        {/* Boutons à droite */}
        <Box sx={{ flexGrow: 1 }} />
        <Button color="inherit" sx={{ fontFamily: 'Fira Sans, sans-serif' }}>QUI SOMMES NOUS ?</Button>
        <Button variant="outlined" color="inherit" sx={{ marginLeft: 2 }}>
          FR +
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
