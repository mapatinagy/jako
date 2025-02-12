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
  Stack
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
  Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import SessionTimer from '../../components/session/SessionTimer';
import { setupActivityTracking, cleanupActivityTracking } from '../../utils/session';

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

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/admin/login');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
      {/* Admin Header */}
      <AppBar position="static" sx={{ backgroundColor: 'primary.main' }}>
        <Toolbar sx={{ px: { xs: 2, sm: 4, md: 6, lg: 8 } }}>
          <Stack 
            direction="row" 
            alignItems="center" 
            spacing={1.5} 
            sx={{ 
              cursor: 'pointer',
              '&:hover': {
                '& .MuiTypography-root, & .MuiSvgIcon-root': {
                  opacity: 0.8
                }
              }
            }}
            onClick={() => navigate('/admin/dashboard')}
          >
            <DashboardIcon 
              sx={{ 
                fontSize: 32,
                color: 'white',
                transition: 'opacity 0.2s ease'
              }} 
            />
            <Typography 
              variant="h5" 
              sx={{ 
                color: 'white',
                fontWeight: 600,
                transition: 'opacity 0.2s ease'
              }}
            >
              Admin Panel
            </Typography>
          </Stack>
          <Box sx={{ flexGrow: 1 }} />
          <SessionTimer />
          <Button
            onClick={() => navigate('/admin/settings')}
            startIcon={<SettingsIcon sx={{ fontSize: 28 }} />}
            sx={{
              ml: 2,
              color: 'white',
              fontSize: '1.2rem',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Beállítások
          </Button>
          <Button
            onClick={handleLogout}
            startIcon={<LogoutIcon sx={{ fontSize: 28 }} />}
            sx={{
              ml: 2,
              color: 'white',
              fontSize: '1.2rem',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Kijelentkezés
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ p: 3 }}>
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

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
              <Paper 
                sx={{ 
                  p: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4
                  }
                }}
              >
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography 
                      variant="h6" 
                      gutterBottom 
                      sx={{ 
                        fontSize: '1rem',
                        fontWeight: 500,
                        lineHeight: 1.2,
                        mb: 1
                      }}
                    >
                      {product.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        fontSize: '0.875rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        lineHeight: 1.3
                      }}
                    >
                      {product.content}
                    </Typography>
                  </Box>
                  
                  {product.image_path && (
                    <Box 
                      sx={{ 
                        width: 80,
                        height: 80,
                        flexShrink: 0,
                        borderRadius: 1,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'scale(1.05)'
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
                </Box>

                <Box 
                  sx={{ 
                    mt: 'auto',
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
  );
};

export default SeasonalProducts; 