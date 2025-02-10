import { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  Checkbox, 
  Button, 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField,
  AppBar,
  Toolbar,
  Stack,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Alert,
  FormControlLabel
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { GalleryImage, UploadStatus } from '../../../types/gallery.types';
import SessionTimer from '../../../components/session/SessionTimer';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { setupActivityTracking, cleanupActivityTracking } from '../../../utils/session';
import { api, getUploadUrl } from '../../../utils/api';

interface Image {
  id: number;
  filename: string;
  title: string;
  description: string;
  isVisible: boolean;
  created_at: string;
}

const Gallery = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState<Image[]>([]);
  const [filteredImages, setFilteredImages] = useState<Image[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editIsVisible, setEditIsVisible] = useState(true);
  const [selectedImages, setSelectedImages] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<{
    from: Date | null;
    to: Date | null;
  }>({
    from: null,
    to: null
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    setupActivityTracking();
    fetchImages();
    return () => cleanupActivityTracking();
  }, []);

  useEffect(() => {
    // Filter images whenever search query or date range changes
    let filtered = [...images];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(image => 
        (image.title || '').toLowerCase().includes(query) ||
        (image.description || '').toLowerCase().includes(query)
      );
    }

    // Apply date range filter
    if (dateRange.from || dateRange.to) {
      filtered = filtered.filter(image => {
        const imageDate = new Date(image.created_at);
        if (dateRange.from && dateRange.to) {
          const endDate = new Date(dateRange.to);
          endDate.setHours(23, 59, 59, 999);  // Set to end of day
          return imageDate >= dateRange.from && imageDate <= endDate;
        } else if (dateRange.from) {
          return imageDate >= dateRange.from;
        } else if (dateRange.to) {
          const endDate = new Date(dateRange.to);
          endDate.setHours(23, 59, 59, 999);  // Set to end of day
          return imageDate <= endDate;
        }
        return true;
      });
    }

    // Sort by newest first
    filtered.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    setFilteredImages(filtered);
  }, [images, searchQuery, dateRange]);

  const fetchImages = async () => {
    try {
      const response = await api.getImages();
      console.log('API Response:', response);
      if (response.success && Array.isArray(response.images)) {
        setImages(response.images.map(img => ({
          id: img.id,
          filename: img.filename,
          title: img.original_filename,
          description: img.description || '',
          isVisible: true, // Default to true since there's no visibility field in the response
          created_at: img.created_at
        })));
      } else {
        console.error('Unexpected API response structure:', response);
        setError('Invalid response format from server');
      }
    } catch (err) {
      console.error('Error fetching images:', err);
      setError(err instanceof Error ? err.message : 'Failed to load images');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      await api.uploadImage(formData);
      setSuccess('Image uploaded successfully');
      setSelectedFile(null);
      fetchImages();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    }
  };

  const handleEdit = (image: Image) => {
    setSelectedImage(image);
    setEditTitle(image.title);
    setEditDescription(image.description);
    setEditIsVisible(image.isVisible);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedImage) return;

    try {
      await api.updateImage(selectedImage.id, {
        title: editTitle,
        description: editDescription,
        isVisible: editIsVisible
      });

      setSuccess('Image updated successfully');
      setEditDialogOpen(false);
      fetchImages();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update image');
    }
  };

  const handleDelete = async () => {
    if (selectedImages.length === 0) {
      setError('Please select images to delete');
      return;
    }

    try {
      await api.deleteImages(selectedImages);
      setSuccess('Images deleted successfully');
      setSelectedImages([]);
      fetchImages();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete images');
    }
  };

  const toggleImageSelection = (imageId: number) => {
    setSelectedImages(prev =>
      prev.includes(imageId)
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  };

  return (
    <Box>
      {/* Admin Header */}
      <AppBar position="static" sx={{ backgroundColor: 'primary.main' }}>
        <Toolbar sx={{ 
          px: { xs: 1, sm: 2, md: 4, lg: 6 },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 0 },
          py: { xs: 1, sm: 0 }
        }}>
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
                fontSize: { xs: 24, sm: 32 },
                color: 'white',
                transition: 'opacity 0.2s ease'
              }} 
            />
            <Typography 
              variant="h5" 
              sx={{ 
                color: 'white',
                fontWeight: 600,
                transition: 'opacity 0.2s ease',
                fontSize: { xs: '1.2rem', sm: '1.5rem' }
              }}
            >
              Admin Panel
            </Typography>
          </Stack>
          <Box sx={{ flexGrow: 1 }} />
          <SessionTimer />
          <Button
            onClick={() => navigate('/admin/settings')}
            startIcon={<SettingsIcon sx={{ fontSize: { xs: 20, sm: 28 } }} />}
            sx={{
              ml: 2,
              color: 'white',
              fontSize: { xs: '1rem', sm: '1.2rem' },
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Settings
          </Button>
          <Button
            onClick={() => {
              localStorage.removeItem('authToken');
              navigate('/admin/login');
            }}
            startIcon={<LogoutIcon sx={{ fontSize: { xs: 20, sm: 28 } }} />}
            sx={{
              ml: 2,
              color: 'white',
              fontSize: { xs: '1rem', sm: '1.2rem' },
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 4 } }}>
        {/* Header Section */}
        <Box sx={{ mb: { xs: 2, sm: 4 } }}>
          <Typography 
            variant="h3" 
            gutterBottom 
            color="primary"
            sx={{ fontSize: { xs: '1.75rem', sm: '2.5rem' } }}
          >
            Gallery Management
          </Typography>
          <Typography 
            variant="subtitle1" 
            color="text.secondary"
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
            Upload, manage, and organize your gallery images
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
          {/* Upload Area */}
          <Box
            sx={{
              p: { xs: 2, sm: 3 },
              mb: 3,
              border: '2px dashed',
              borderColor: selectedFile ? 'primary.main' : 'grey.300',
              borderRadius: 1,
              backgroundColor: selectedFile ? 'action.hover' : 'background.paper',
              cursor: 'pointer',
              textAlign: 'center'
            }}
          >
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="image-upload"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="image-upload">
              <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                {selectedFile ? 'Drop the image here to upload' : 'Drag & drop image here, or click to select file'}
              </Typography>
            </label>
          </Box>

          {selectedFile && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1">
                Selected file: {selectedFile.name}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleUpload}
                sx={{ mt: 1 }}
              >
                Upload
              </Button>
            </Box>
          )}

          {/* Search and Filter Section */}
          <Box sx={{ 
            mb: 3, 
            display: 'flex', 
            gap: { xs: 1, sm: 2 }, 
            alignItems: 'center', 
            flexWrap: 'wrap' 
          }}>
            <TextField
              placeholder="Search images..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ 
                flexGrow: 1,
                minWidth: { xs: '100%', sm: '200px' }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={1} 
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                <DatePicker
                  label="From Date"
                  value={dateRange.from}
                  onChange={(newValue) => setDateRange(prev => ({ ...prev, from: newValue }))}
                  slotProps={{ 
                    textField: { 
                      sx: { 
                        minWidth: { xs: '100%', sm: '160px' } 
                      } 
                    } 
                  }}
                  maxDate={dateRange.to || undefined}
                />
                <DatePicker
                  label="To Date"
                  value={dateRange.to}
                  onChange={(newValue) => setDateRange(prev => ({ ...prev, to: newValue }))}
                  slotProps={{ 
                    textField: { 
                      sx: { 
                        minWidth: { xs: '100%', sm: '160px' } 
                      } 
                    } 
                  }}
                  minDate={dateRange.from || undefined}
                />
              </Stack>
            </LocalizationProvider>
            {(dateRange.from || dateRange.to || searchQuery) && (
              <Button 
                variant="outlined" 
                onClick={() => {
                  setDateRange({ from: null, to: null });
                  setSearchQuery('');
                }}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                Clear Filters
              </Button>
            )}
          </Box>

          {/* Upload Progress */}
          <Box 
            sx={{ 
              mb: 3,
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              overflow: 'hidden'
            }}
          >
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                fontSize: { xs: '1rem', sm: '1.25rem' },
                bgcolor: 'background.default',
                p: 1,
                borderBottom: 1,
                borderColor: 'divider'
              }}
            >
              Upload Log
            </Typography>
            <Box 
              sx={{ 
                maxHeight: '150px', // Height for 5 lines approximately
                overflowY: 'auto',
                p: 1,
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: 'background.default',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'primary.main',
                  borderRadius: '4px',
                },
              }}
            >
              {selectedFile && (
                <Box 
                  sx={{ 
                    py: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <Box 
                    sx={{ 
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      flexShrink: 0
                    }} 
                  />
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      flexGrow: 1,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {selectedFile.name}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* Select All and Delete */}
          {filteredImages.length > 0 && (
            <Box sx={{ 
              mb: 2, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              flexDirection: { xs: 'column', sm: 'row' },
              width: '100%'
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                width: { xs: '100%', sm: 'auto' }
              }}>
                <Checkbox
                  checked={selectedImages.length === filteredImages.length}
                  indeterminate={selectedImages.length > 0 && selectedImages.length < filteredImages.length}
                  onChange={() => {
                    setSelectedImages(
                      selectedImages.length === filteredImages.length 
                        ? [] 
                        : filteredImages.map(img => img.id)
                    );
                  }}
                />
                <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                  Select All ({selectedImages.length} of {filteredImages.length} selected)
                </Typography>
              </Box>
              {selectedImages.length > 0 && (
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleDelete}
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                  Delete Selected
                </Button>
              )}
            </Box>
          )}

          {/* Images Grid */}
          <Grid container spacing={{ xs: 1, sm: 2 }}>
            {filteredImages.map((image) => (
              <Grid item xs={6} sm={4} md={3} lg={2} key={image.id}>
                <Card>
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={getUploadUrl(image.filename)}
                      alt={image.title}
                      sx={{ objectFit: 'cover' }}
                    />
                    {/* Overlay controls */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        p: 1,
                        display: 'flex',
                        justifyContent: 'space-between',
                        bgcolor: 'rgba(0, 0, 0, 0.3)',
                      }}
                    >
                      <Checkbox
                        checked={selectedImages.includes(image.id)}
                        onChange={() => toggleImageSelection(image.id)}
                        sx={{
                          color: 'white',
                          '&.Mui-checked': {
                            color: 'white',
                          },
                        }}
                      />
                      <IconButton 
                        onClick={() => handleEdit(image)}
                        sx={{
                          color: 'white',
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                          },
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {image.title || 'Untitled'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {image.description || 'No description'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {filteredImages.length === 0 && (
            <Typography 
              variant="body1" 
              color="text.secondary" 
              align="center"
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              {images.length === 0 
                ? 'No images uploaded yet. Start by dropping some images above.'
                : 'No images match your search criteria.'}
            </Typography>
          )}
        </Paper>

        {/* Edit Dialog */}
        <Dialog 
          open={editDialogOpen} 
          onClose={() => setEditDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          fullScreen={isMobile}
        >
          <DialogTitle>Edit Image</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Title"
              fullWidth
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={editIsVisible}
                  onChange={(e) => setEditIsVisible(e.target.checked)}
                />
              }
              label="Visible"
            />
          </DialogContent>
          <DialogActions sx={{ flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 0 }, p: 2 }}>
            <Button 
              onClick={() => setEditDialogOpen(false)}
              color="error"
              fullWidth={isMobile}
            >
              Cancel
            </Button>
            <Box sx={{ flex: { xs: 0, sm: 1 } }} />
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={1} 
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              <Button 
                onClick={handleSaveEdit} 
                variant="contained" 
                color="primary"
                fullWidth={isMobile}
              >
                Save
              </Button>
            </Stack>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Gallery; 