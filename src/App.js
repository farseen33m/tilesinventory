import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import Products from './components/products/Products';
import Inventory from './components/inventory/Inventory';
import { Box } from '@mui/material';
import StockMovement from './components/inventory/StockMovement';
import Dashboard from './components/Dashboard';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex' }}>
          <Navbar />
          <Sidebar />
          <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8, ml: { sm: 30 } }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/sales" element={<></>} />
              <Route path="/stock-movement" element={<StockMovement />} />
            </Routes>
          </Box>
        </Box>
      </Router>


    </ThemeProvider>
  );
}

export default App;