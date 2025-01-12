import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Alert,
  IconButton,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import {
  fetchProducts,
  fetchLocations,
  fetchStockMovements,
  createStockMovement,
  updateStockMovement,
  deleteStockMovement,
} from '../../services/api';

const StockMovement = () => {
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [movementData, setMovementData] = useState({
    product: '',
    from_location: '',
    to_location: '',
    quantity: '',
    notes: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [movementsRes, productsRes, locationsRes] = await Promise.all([
        fetchStockMovements(),
        fetchProducts(),
        fetchLocations(),
      ]);
      
      setMovements(movementsRes.data);
      setProducts(productsRes.data);
      setLocations(locationsRes.data);
    } catch (error) {
      setError('Failed to load stock movement data');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleClose = () => {
    setOpen(false);
    setIsEdit(false);
    setMovementData({
      product: '',
      from_location: '',
      to_location: '',
      quantity: '',
      notes: '',
    });
    setError('');
  };

  const handleCreate = async () => {
    try {
      if (isEdit) {
        await updateStockMovement(selectedMovement.id, movementData);
      } else {
        await createStockMovement(movementData);
      }
      await loadData();
      handleClose();
    } catch (error) {
      setError(`Failed to ${isEdit ? 'update' : 'create'} stock movement`);
      console.error('Error:', error);
    }
  };

  const handleEditClick = (movement) => {
    setSelectedMovement(movement);
    setMovementData({
      product: movement.product,
      from_location: movement.from_location,
      to_location: movement.to_location,
      quantity: movement.quantity,
      notes: movement.notes || '',
    });
    setIsEdit(true);
    setOpen(true);
  };

  const handleDeleteClick = (movement) => {
    setSelectedMovement(movement);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteStockMovement(selectedMovement.id);
      await loadData();
      setDeleteDialogOpen(false);
      setSelectedMovement(null);
    } catch (error) {
      setError('Failed to delete stock movement');
      console.error('Error:', error);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Stock Movement</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setIsEdit(false);
            setOpen(true);
          }}
        >
          New Movement
        </Button>
      </Box>

      {loading && <Alert severity="info">Loading stock movements...</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>From</TableCell>
              <TableCell>To</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {movements.map((movement) => (
              <TableRow key={movement.id}>
                <TableCell>
                  {new Date(movement.movement_date).toLocaleString()}
                </TableCell>
                <TableCell>
                  {products.find(p => p.id === movement.product)?.name}
                </TableCell>
                <TableCell>
                  {locations.find(l => l.id === movement.from_location)?.name}
                </TableCell>
                <TableCell>
                  {locations.find(l => l.id === movement.to_location)?.name}
                </TableCell>
                <TableCell>{movement.quantity}</TableCell>
                <TableCell>{movement.notes}</TableCell>
                <TableCell align="right">
                  <IconButton 
                    color="primary" 
                    onClick={() => handleEditClick(movement)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    color="error" 
                    onClick={() => handleDeleteClick(movement)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Movement Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{isEdit ? 'Edit Stock Movement' : 'New Stock Movement'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                select
                label="Product"
                value={movementData.product}
                onChange={(e) => setMovementData({ ...movementData, product: e.target.value })}
              >
                {products.map((product) => (
                  <MenuItem key={product.id} value={product.id}>
                    {product.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                select
                label="From Location"
                value={movementData.from_location}
                onChange={(e) => setMovementData({ ...movementData, from_location: e.target.value })}
              >
                {locations.map((location) => (
                  <MenuItem key={location.id} value={location.id}>
                    {location.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                select
                label="To Location"
                value={movementData.to_location}
                onChange={(e) => setMovementData({ ...movementData, to_location: e.target.value })}
              >
                {locations.map((location) => (
                  <MenuItem key={location.id} value={location.id}>
                    {location.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                type="number"
                label="Quantity"
                value={movementData.quantity}
                onChange={(e) => setMovementData({ ...movementData, quantity: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notes"
                value={movementData.notes}
                onChange={(e) => setMovementData({ ...movementData, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            onClick={handleCreate} 
            variant="contained"
            disabled={!movementData.product || !movementData.from_location || 
                     !movementData.to_location || !movementData.quantity}
          >
            {isEdit ? 'Update' : 'Create'} Movement
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this stock movement? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StockMovement;



// src/components/inventory/StockMovement.js
// import React, { useState, useEffect } from 'react';
// import {
//   Box,
//   Button,
//   Paper,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
//   MenuItem,
//   Grid,
//   Alert,
//   Typography,
// } from '@mui/material';
// import { Add as AddIcon } from '@mui/icons-material';
// import { fetchProducts, fetchLocations, fetchStockMovements, createStockMovement } from '../../services/api';

// const StockMovement = () => {
//   const [movements, setMovements] = useState([]);
//   const [products, setProducts] = useState([]);
//   const [locations, setLocations] = useState([]);
//   const [open, setOpen] = useState(false);
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const [newMovement, setNewMovement] = useState({
//     product: '',
//     from_location: '',
//     to_location: '',
//     quantity: '',
//     notes: '',
//   });

//   const loadData = async () => {
//     setLoading(true);
//     try {
//       const [movementsRes, productsRes, locationsRes] = await Promise.all([
//         fetchStockMovements(),
//         fetchProducts(),
//         fetchLocations(),
//       ]);
      
//       setMovements(movementsRes.data);
//       setProducts(productsRes.data);
//       setLocations(locationsRes.data);
//     } catch (error) {
//       setError('Failed to load stock movement data');
//       console.error('Error:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadData();
//   }, []);

//   const handleClose = () => {
//     setOpen(false);
//     setNewMovement({
//       product: '',
//       from_location: '',
//       to_location: '',
//       quantity: '',
//       notes: '',
//     });
//     setError('');
//   };

//   const handleCreate = async () => {
//     try {
//       await createStockMovement(newMovement);
//       await loadData();
//       handleClose();
//     } catch (error) {
//       setError('Failed to create stock movement');
//     }
//   };

//   return (
//     <Box>
//       <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//         <Typography variant="h4">Stock Movement</Typography>
//         <Button
//           variant="contained"
//           startIcon={<AddIcon />}
//           onClick={() => setOpen(true)}
//         >
//           New Movement
//         </Button>
//       </Box>

//       {loading && <Alert severity="info">Loading stock movements...</Alert>}
//       {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

//       <TableContainer component={Paper}>
//         <Table>
//           <TableHead>
//             <TableRow>
//               <TableCell>Date</TableCell>
//               <TableCell>Product</TableCell>
//               <TableCell>From</TableCell>
//               <TableCell>To</TableCell>
//               <TableCell>Quantity</TableCell>
//               <TableCell>Notes</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {movements.map((movement) => (
//               <TableRow key={movement.id}>
//                 <TableCell>
//                   {new Date(movement.movement_date).toLocaleString()}
//                 </TableCell>
//                 <TableCell>
//                   {products.find(p => p.id === movement.product)?.name}
//                 </TableCell>
//                 <TableCell>
//                   {locations.find(l => l.id === movement.from_location)?.name}
//                 </TableCell>
//                 <TableCell>
//                   {locations.find(l => l.id === movement.to_location)?.name}
//                 </TableCell>
//                 <TableCell>{movement.quantity}</TableCell>
//                 <TableCell>{movement.notes}</TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </TableContainer>

//       {/* New Movement Dialog */}
//       <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
//         <DialogTitle>New Stock Movement</DialogTitle>
//         <DialogContent>
//           <Grid container spacing={2} sx={{ mt: 1 }}>
//             <Grid item xs={12}>
//               <TextField
//                 fullWidth
//                 select
//                 label="Product"
//                 value={newMovement.product}
//                 onChange={(e) => setNewMovement({ ...newMovement, product: e.target.value })}
//               >
//                 {products.map((product) => (
//                   <MenuItem key={product.id} value={product.id}>
//                     {product.name}
//                   </MenuItem>
//                 ))}
//               </TextField>
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 fullWidth
//                 select
//                 label="From Location"
//                 value={newMovement.from_location}
//                 onChange={(e) => setNewMovement({ ...newMovement, from_location: e.target.value })}
//               >
//                 {locations.map((location) => (
//                   <MenuItem key={location.id} value={location.id}>
//                     {location.name}
//                   </MenuItem>
//                 ))}
//               </TextField>
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 fullWidth
//                 select
//                 label="To Location"
//                 value={newMovement.to_location}
//                 onChange={(e) => setNewMovement({ ...newMovement, to_location: e.target.value })}
//               >
//                 {locations.map((location) => (
//                   <MenuItem key={location.id} value={location.id}>
//                     {location.name}
//                   </MenuItem>
//                 ))}
//               </TextField>
//             </Grid>
//             <Grid item xs={12}>
//               <TextField
//                 fullWidth
//                 type="number"
//                 label="Quantity"
//                 value={newMovement.quantity}
//                 onChange={(e) => setNewMovement({ ...newMovement, quantity: e.target.value })}
//               />
//             </Grid>
//             <Grid item xs={12}>
//               <TextField
//                 fullWidth
//                 multiline
//                 rows={3}
//                 label="Notes"
//                 value={newMovement.notes}
//                 onChange={(e) => setNewMovement({ ...newMovement, notes: e.target.value })}
//               />
//             </Grid>
//           </Grid>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleClose}>Cancel</Button>
//           <Button 
//             onClick={handleCreate} 
//             variant="contained"
//             disabled={!newMovement.product || !newMovement.from_location || 
//                      !newMovement.to_location || !newMovement.quantity}
//           >
//             Create Movement
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// };

// export default StockMovement;