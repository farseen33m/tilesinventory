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
import { fetchProducts, fetchBrands, fetchCategories, createProduct, deleteProduct } from '../../services/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [newProduct, setNewProduct] = useState({
    brand: '',
    category: '',
    product_code: '',
    name: '',
    description: '',
    price: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsRes, brandsRes, categoriesRes] = await Promise.all([
        fetchProducts(),
        fetchBrands(),
        fetchCategories(),
      ]);
      setProducts(productsRes.data);
      setBrands(brandsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      setError('Failed to load data');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setNewProduct({
      brand: '',
      category: '',
      product_code: '',
      name: '',
      description: '',
      price: '',
    });
  };

  const handleCreate = async () => {
    try {
      await createProduct(newProduct);
      await loadData();
      handleClose();
    } catch (error) {
      setError('Failed to create product');
    }
  };

  const handleDeleteClick = (product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteProduct(selectedProduct.id);
      await loadData();
      setDeleteDialogOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      setError('Failed to delete product');
      console.error('Error:', error);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Products Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
        >
          Add Product
        </Button>
      </Box>

      {loading && <Alert severity="info">Loading data...</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Brand</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Price</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.product_code}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{brands.find(b => b.id === product.brand)?.name}</TableCell>
                <TableCell>
                  {categories.find(c => c.id === product.category)?.name}
                </TableCell>
                <TableCell>₹{product.price}</TableCell>
                <TableCell align="right">
                  <IconButton color="error" onClick={() => handleDeleteClick(product)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Product Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Add New Product</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Product Code"
                value={newProduct.product_code}
                onChange={(e) => setNewProduct({ ...newProduct, product_code: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                select
                label="Brand"
                value={newProduct.brand}
                onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
              >
                {brands.map((brand) => (
                  <MenuItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                select
                label="Category"
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}-{category.size}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Price"
                type="number"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            disabled={!newProduct.product_code || !newProduct.name || !newProduct.brand || !newProduct.category || !newProduct.price}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the product "{selectedProduct?.name}"? This action cannot be undone.
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

export default Products;
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
// } from '@mui/material';
// import { Add as AddIcon } from '@mui/icons-material';
// import { fetchProducts, fetchBrands, fetchCategories, createProduct } from '../../services/api';

// const Products = () => {
//   const [products, setProducts] = useState([]);
//   const [brands, setBrands] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [open, setOpen] = useState(false);
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
  
//   const [newProduct, setNewProduct] = useState({
//     brand: '',
//     category: '',
//     product_code: '',
//     name: '',
//     description: '',
//     price: '',
//   });

//   const loadData = async () => {
//     setLoading(true);
//     try {
//       console.log('Fetching data...');
//       const brandsRes = await fetchBrands();
//       const categoriesRes = await fetchCategories();
//       const productsRes = await fetchProducts();
      
//       console.log('Brands:', brandsRes.data);
//       console.log('Categories:', categoriesRes.data);
      
//       setBrands(brandsRes.data);
//       setCategories(categoriesRes.data);
//       setProducts(productsRes.data);
//     } catch (error) {
//       console.error('Error loading data:', error);
//       setError('Failed to load data. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadData();
//   }, []);

//   const handleClose = () => {
//     setOpen(false);
//     setNewProduct({
//       brand: '',
//       category: '',
//       product_code: '',
//       name: '',
//       description: '',
//       price: '',
//     });
//     setError('');
//   };

//   const handleCreate = async () => {
//     try {
//       setError('');
//       await createProduct(newProduct);
//       await loadData();
//       handleClose();
//     } catch (error) {
//       console.error('Error creating product:', error);
//       setError('Failed to create product. Please check all fields and try again.');
//     }
//   };

//   return (
//     <Box>
//       <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
//         <h2>Products Management</h2>
//         <Button
//           variant="contained"
//           startIcon={<AddIcon />}
//           onClick={() => setOpen(true)}
//         >
//           Add Product
//         </Button>
//       </Box>

//       {loading && <Alert severity="info">Loading data...</Alert>}
//       {error && <Alert severity="error">{error}</Alert>}

//       <TableContainer component={Paper}>
//         <Table>
//           <TableHead>
//             <TableRow>
//               <TableCell>Code</TableCell>
//               <TableCell>Name</TableCell>
//               <TableCell>Brand</TableCell>
//               <TableCell>Category</TableCell>
//               <TableCell>Price</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {products.map((product) => (
//               <TableRow key={product.id}>
//                 <TableCell>{product.product_code}</TableCell>
//                 <TableCell>{product.name}</TableCell>
//                 <TableCell>{brands.find(b => b.id === product.brand)?.name}</TableCell>
//                 <TableCell>
//                   {categories.find(c => c.id === product.category)?.name} 
//                   ({categories.find(c => c.id === product.category)?.size})
//                 </TableCell>
//                 <TableCell>₹{product.price}</TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </TableContainer>

//       <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
//         <DialogTitle>Add New Product</DialogTitle>
//         <DialogContent>
//           {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
//           <Grid container spacing={2} sx={{ mt: 1 }}>
//             <Grid item xs={12}>
//               <TextField
//                 fullWidth
//                 required
//                 label="Product Code"
//                 value={newProduct.product_code}
//                 onChange={(e) => setNewProduct({ ...newProduct, product_code: e.target.value })}
//               />
//             </Grid>
//             <Grid item xs={12}>
//               <TextField
//                 fullWidth
//                 required
//                 label="Name"
//                 value={newProduct.name}
//                 onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
//               />
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 fullWidth
//                 required
//                 select
//                 label="Brand"
//                 value={newProduct.brand}
//                 onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
//               >
//                 {brands.map((brand) => (
//                   <MenuItem key={brand.id} value={brand.id}>
//                     {brand.name}
//                   </MenuItem>
//                 ))}
//               </TextField>
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 fullWidth
//                 required
//                 select
//                 label="Category"
//                 value={newProduct.category}
//                 onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
//               >
//                 {categories.map((category) => (
//                   <MenuItem key={category.id} value={category.id}>
//                     {category.name} - {category.size}
//                   </MenuItem>
//                 ))}
//               </TextField>
//             </Grid>
//             <Grid item xs={12}>
//               <TextField
//                 fullWidth
//                 required
//                 label="Price"
//                 type="number"
//                 value={newProduct.price}
//                 onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
//               />
//             </Grid>
//             <Grid item xs={12}>
//               <TextField
//                 fullWidth
//                 multiline
//                 rows={3}
//                 label="Description"
//                 value={newProduct.description}
//                 onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
//               />
//             </Grid>
//           </Grid>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleClose}>Cancel</Button>
//           <Button 
//             onClick={handleCreate} 
//             variant="contained"
//             disabled={!newProduct.product_code || !newProduct.name || !newProduct.brand || !newProduct.category || !newProduct.price}
//           >
//             Create
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// };

// export default Products;