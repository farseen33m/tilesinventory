import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  LocalShipping as MovementIcon,
  Store as LocationIcon,
  Category as CategoryIcon,
  ArrowUpward as IncreaseIcon,
  ArrowDownward as DecreaseIcon,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { fetchInventory, fetchStockMovements, fetchProducts, fetchLocations } from '../services/api';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState({
    totalProducts: 0,
    totalStock: 0,
    totalLocations: 0,
    recentMovements: [],
    lowStock: [],
    stockByLocation: [],
    stockByCategory: []
  });

  
  const COLORS = ['#1976d2', '#2e7d32', '#ed6c02', '#9c27b0', '#d32f2f'];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [inventory, movements, products, locations] = await Promise.all([
        fetchInventory(),
        fetchStockMovements(),
        fetchProducts(),
        fetchLocations()
      ]);

      // Process inventory data by location
      const stockByLocation = locations.data.map(location => ({
        name: location.name,
        value: inventory.data
          .filter(item => item.location === location.id)
          .reduce((sum, item) => sum + item.quantity, 0)
      }));

      // Process inventory data by category (1200x600 vs 600x600)
      const categories = [...new Set(products.data.map(product => product.category))];
      const stockByCategory = categories.map(categoryId => {
        const categoryProducts = products.data.filter(product => product.category === categoryId);
        const totalStock = inventory.data
          .filter(item => categoryProducts.some(prod => prod.id === item.product))
          .reduce((sum, item) => sum + item.quantity, 0);
        return {
          name: categoryId === 1 ? '1200x600' : '600x600', // Adjust based on your category IDs
          value: totalStock
        };
      });

      const dashboardData = {
        totalProducts: products.data.length,
        totalStock: inventory.data.reduce((sum, item) => sum + item.quantity, 0),
        totalLocations: locations.data.length,
        recentMovements: movements.data.slice(0, 5),
        lowStock: inventory.data
          .filter(item => item.quantity < 10)
          .slice(0, 5)
          .map(item => ({
            ...item,
            product_name: products.data.find(p => p.id === item.product)?.name,
            location_name: locations.data.find(l => l.id === item.location)?.name
          })),
        stockByLocation,
        stockByCategory
      };

      setData(dashboardData);
    } catch (error) {
      setError('Failed to load dashboard data');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Summary Card Component
  const SummaryCard = ({ title, value, icon, trend, color }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" sx={{ mb: 1 }}>
              {value}
            </Typography>
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {trend > 0 ? (
                  <IncreaseIcon color="success" />
                ) : (
                  <DecreaseIcon color="error" />
                )}
                <Typography
                  variant="body2"
                  color={trend > 0 ? 'success.main' : 'error.main'}
                >
                  {Math.abs(trend)}% from last month
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: color,
              borderRadius: 1,
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Dashboard
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Total Products"
            value={data.totalProducts}
            icon={<CategoryIcon sx={{ color: 'white' }} />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Total Stock"
            value={data.totalStock}
            icon={<InventoryIcon sx={{ color: 'white' }} />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Locations"
            value={data.totalLocations}
            icon={<LocationIcon sx={{ color: 'white' }} />}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Recent Movements"
            value={data.recentMovements.length}
            icon={<MovementIcon sx={{ color: 'white' }} />}
            color="#9c27b0"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Stock by Location</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.stockByLocation}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#2e7d32" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Stock Distribution by Size</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.stockByCategory}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {data.stockByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Movements and Low Stock */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Recent Stock Movements</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>From</TableCell>
                    <TableCell>To</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.recentMovements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell>{movement.product_name}</TableCell>
                      <TableCell>{movement.from_location_name}</TableCell>
                      <TableCell>{movement.to_location_name}</TableCell>
                      <TableCell align="right">{movement.quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Low Stock Alert</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.lowStock.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.product_name}</TableCell>
                      <TableCell>{item.location_name}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;