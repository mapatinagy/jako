import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Paper,
  IconButton,
  Grid,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
  Stack,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Container
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Image as ImageIcon,
  Close as CloseIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import SessionTimer from '../../components/session/SessionTimer';
import { setupActivityTracking, cleanupActivityTracking } from '../../utils/session';
import { DatePicker } from '@mui/x-date-pickers';
import { Helmet } from 'react-helmet-async';
import { datePickerConfig } from '../../utils/dateConfig';
import Header from '../../components/layout/Header';

interface SeasonalProduct {
  id: number;
  title: string;
  content: string;
  image_path: string | null;
  is_active: boolean;
  created_at: string;
}

const SeasonalProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<SeasonalProduct[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<SeasonalProduct | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageModal, setImageModal] = useState<{
    open: boolean;
    imagePath: string | null;
  }>({
    open: false,
    imagePath: null
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<{
    from: Date | null;
    to: Date | null;
  }>({
    from: null,
    to: null
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredProducts, setFilteredProducts] = useState<SeasonalProduct[]>([]);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/seasonal');
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Hiba történt a termékek betöltése során');
    }
  };

  useEffect(() => {
    setupActivityTracking();
    fetchProducts();
    return () => cleanupActivityTracking();
  }, []);

  useEffect(() => {
    let filtered = [...products];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(product => 
        product.title.toLowerCase().includes(query) ||
        product.content.toLowerCase().includes(query)
      );
    }

    if (dateRange.from || dateRange.to) {
      filtered = filtered.filter(product => {
        const productDate = new Date(product.created_at);
        if (dateRange.from && dateRange.to) {
          const endDate = new Date(dateRange.to);
          endDate.setHours(23, 59, 59, 999);
          return productDate >= dateRange.from && productDate <= endDate;
        } else if (dateRange.from) {
          return productDate >= dateRange.from;
        } else if (dateRange.to) {
          const endDate = new Date(dateRange.to);
          endDate.setHours(23, 59, 59, 999);
          return productDate <= endDate;
        }
        return true;
      });
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(product => 
        (statusFilter === 'active' && product.is_active) || 
        (statusFilter === 'inactive' && !product.is_active)
      );
    }

    setFilteredProducts(filtered);
  }, [products, searchQuery, dateRange, statusFilter]);

  const handleOpen = (product?: SeasonalProduct) => {
    if (product) {
      setSelectedProduct(product);
      setFormData({
        title: product.title,
        content: product.content,
      });
    } else {
      setSelectedProduct(null);
      setFormData({ title: '', content: '' });
    }
    setSelectedFile(null);
    setImagePreview(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedProduct(null);
    setFormData({ title: '', content: '' });
    setSelectedFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('content', formData.content);
    if (selectedFile) {
      formDataToSend.append('image', selectedFile);
    }

    try {
      if (selectedProduct) {
        const response = await api.patch(`/seasonal/${selectedProduct.id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        const response = await api.post('/seasonal', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      
      await fetchProducts();
      handleClose();
    } catch (error) {
      console.error('Error saving product:', error);
      setError('Hiba történt a mentés során');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Biztosan törölni szeretné ezt a terméket?')) {
      return;
    }

    try {
      await api.delete(`/seasonal/${id}`);
      await fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      setError('Hiba történt a törlés során');
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await api.patch(`/seasonal/${id}/toggle`);
      await fetchProducts();
    } catch (error) {
      console.error('Error toggling status:', error);
      setError('Hiba történt a státusz módosítása során');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validImageTypes.includes(file.type)) {
        setError('Csak képfájlokat lehet feltölteni (JPEG, PNG, GIF, WEBP)');
        e.target.value = '';
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = (imagePath: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setImageModal({
      open: true,
      imagePath: `http://localhost:3000${imagePath}`
    });
  };

  return (
    <Box>
      <Header />
      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 4 } }}>
        <Helmet>
          <title>Szezonális Termékek | Admin Panel</title>
        </Helmet>
        <Box sx={{ 
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <Box sx={{ 
            width: '100%', 
            maxWidth: '1200px',
          }}>
            {/* Page title and New Product button */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h4">Szezonális Termékek</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpen()}
              >
                Új termék
              </Button>
            </Box>

            {/* Filter bar */}
            <Paper sx={{ p: 2, mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                {/* Search field */}
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    placeholder="Keresés..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                    size="small"
                  />
                </Grid>

                {/* Date pickers */}
                <Grid item xs={12} sm={6} md={2}>
                  <DatePicker
                    label="Kezdő dátum"
                    value={dateRange.from}
                    onChange={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                    maxDate={dateRange.to || undefined}
                    {...datePickerConfig}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <DatePicker
                    label="Záró dátum"
                    value={dateRange.to}
                    onChange={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                    minDate={dateRange.from || undefined}
                    {...datePickerConfig}
                  />
                </Grid>

                {/* Status filter */}
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Státusz</InputLabel>
                    <Select
                      value={statusFilter}
                      label="Státusz"
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <MenuItem value="all">Összes</MenuItem>
                      <MenuItem value="active">Publikált</MenuItem>
                      <MenuItem value="inactive">Nem publikált</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Clear filters button */}
                <Grid item xs={12} sm={6} md={2}>
                  <Stack 
                    direction={{ xs: 'row', sm: 'row' }} 
                    spacing={1} 
                    sx={{ 
                      width: '100%',
                      justifyContent: { md: 'flex-end' }
                    }}
                  >
                    <Button
                      sx={{ 
                        flex: { xs: 1, md: 'initial' }
                      }}
                      variant="outlined"
                      onClick={() => {
                        setSearchQuery('');
                        setDateRange({ from: null, to: null });
                        setStatusFilter('all');
                      }}
                    >
                      Szűrők törlése
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* Products grid */}
            <Box sx={{ mt: 2 }}>
              <Grid 
                container 
                spacing={2}
                sx={{ 
                  width: '100%',
                  m: 0,
                  p: 0,
                  '& .MuiGrid-item': {
                    pl: 1,
                    pr: 1,
                  }
                }}
              >
                {filteredProducts.map((product) => (
                  <Grid item xs={12} sm={6} md={4} key={product.id}>
                    <Paper 
                      sx={{ 
                        p: { xs: 1.5, sm: 3 },
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                      }}
                    >
                      {product.image_path && (
                        <Box 
                          sx={{ 
                            width: '100%',
                            height: { xs: 150, sm: 200 },
                            borderRadius: 2,
                            overflow: 'hidden',
                            cursor: 'pointer',
                            transition: 'transform 0.2s',
                            mb: 2,
                            '&:hover': {
                              transform: 'scale(1.02)'
                            }
                          }}
                          onClick={(e) => handleImageClick(product.image_path!, e)}
                        >
                          <img
                            src={`http://localhost:3000${product.image_path}`}
                            alt={product.title}
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover'
                            }}
                          />
                        </Box>
                      )}

                      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <Typography 
                          variant="h6" 
                          gutterBottom 
                          sx={{ 
                            fontSize: '1.2rem',
                            fontWeight: 500,
                            lineHeight: 1.2,
                            mb: 2
                          }}
                        >
                          {product.title}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ 
                            fontSize: '0.9rem',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            lineHeight: 1.4,
                            mb: 2
                          }}
                        >
                          {product.content}
                        </Typography>
                      </Box>

                      <Box 
                        sx={{ 
                          pt: 2,
                          borderTop: 1,
                          borderColor: 'divider',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton 
                            onClick={() => handleToggleStatus(product.id)} 
                            size="small"
                            color={product.is_active ? "success" : "default"}
                            sx={{ p: 0.5 }}
                          >
                            {product.is_active ? <VisibilityIcon /> : <VisibilityOffIcon />}
                          </IconButton>
                          <IconButton 
                            onClick={() => handleOpen(product)} 
                            size="small"
                            color="primary"
                            sx={{ p: 0.5 }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            onClick={() => handleDelete(product.id)} 
                            size="small"
                            color="error"
                            sx={{ p: 0.5 }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ fontSize: '0.75rem' }}
                        >
                          {new Date(product.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
              <DialogTitle>
                {selectedProduct ? 'Termék szerkesztése' : 'Új termék hozzáadása'}
              </DialogTitle>
              <form onSubmit={handleSubmit}>
                <DialogContent>
                  <TextField
                    fullWidth
                    label="Cím"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Leírás"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                    multiline
                    rows={4}
                    sx={{ mb: 2 }}
                  />
                  <Box sx={{ mb: 2 }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                      id="image-upload"
                    />
                    <label htmlFor="image-upload">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<ImageIcon />}
                      >
                        Kép kiválasztása
                      </Button>
                    </label>
                    {imagePreview && (
                      <Box sx={{ mt: 2, height: 200, overflow: 'hidden' }}>
                        <img
                          src={imagePreview}
                          alt="Preview"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </Box>
                    )}
                  </Box>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleClose}>Mégse</Button>
                  <Button type="submit" variant="contained" disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : 'Mentés'}
                  </Button>
                </DialogActions>
              </form>
            </Dialog>

            <Dialog 
              open={imageModal.open} 
              onClose={() => setImageModal({ open: false, imagePath: null })}
              maxWidth="lg"
              fullWidth
            >
              <DialogContent sx={{ p: 0, position: 'relative' }}>
                <IconButton
                  onClick={() => setImageModal({ open: false, imagePath: null })}
                  sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: 'white',
                    bgcolor: 'rgba(0, 0, 0, 0.5)',
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.7)'
                    }
                  }}
                >
                  <CloseIcon />
                </IconButton>
                {imageModal.imagePath && (
                  <img
                    src={imageModal.imagePath}
                    alt="Full size"
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block'
                    }}
                  />
                )}
              </DialogContent>
            </Dialog>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default SeasonalProducts; 