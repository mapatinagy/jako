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
  LinearProgress
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

const Gallery = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<GalleryImage[]>([]);
  const [uploads, setUploads] = useState<UploadStatus[]>([]);
  const [selectedImages, setSelectedImages] = useState<number[]>([]);
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    imageId: number | null;
    description: string;
  }>({
    open: false,
    imageId: null,
    description: ''
  });
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
    return () => cleanupActivityTracking();
  }, []);

  useEffect(() => {
    fetchImages();
  }, []);

  useEffect(() => {
    // Filter images whenever search query or date range changes
    let filtered = [...images];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(image => 
        (image.original_filename || '').toLowerCase().includes(query) ||
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
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:3000/api/gallery/images', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const imagesWithUrls = response.data.images.map((img: GalleryImage) => ({
        ...img,
        url: `http://localhost:3000/uploads/${img.filename}`
      }));
      setImages(imagesWithUrls);
    } catch (error) {
      console.error('Képek betöltése sikertelen:', error);
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    const token = localStorage.getItem('authToken');

    // Create upload status entries
    const newUploads = acceptedFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
      progress: 0,
      status: 'uploading' as const
    }));

    setUploads(current => [...current, ...newUploads]);

    // Upload each file
    for (const upload of newUploads) {
      try {
        const formData = new FormData();
        formData.append('image', upload.file);

        const response = await axios.post(
          'http://localhost:3000/api/gallery/upload',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`
            },
            onUploadProgress: (progressEvent) => {
              const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total ?? 100));
              setUploads(current =>
                current.map(u =>
                  u.id === upload.id
                    ? { ...u, progress, status: progress === 100 ? 'completed' : 'uploading' }
                    : u
                )
              );
            }
          }
        );

        if (response.data.success) {
          const newImage = {
            ...response.data.image,
            url: `http://localhost:3000/uploads/${response.data.image.filename}`
          };
          setImages(current => [...current, newImage]);
          
          setUploads(current =>
            current.map(u =>
              u.id === upload.id
                ? { ...u, progress: 100, status: 'completed' }
                : u
            )
          );
        }
      } catch (error: any) {
        console.error('Feltöltés sikertelen:', error);
        setUploads(current =>
          current.map(u =>
            u.id === upload.id
              ? { 
                  ...u, 
                  status: 'failed', 
                  error: error.response?.data?.message || 'Feltöltés sikertelen. Kérjük, próbáld újra.' 
                }
              : u
          )
        );
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg', '.jfif'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp'],
      'image/svg+xml': ['.svg']
    },
    onDropRejected: (rejectedFiles) => {
      const newUploads = rejectedFiles.map(rejected => ({
        id: crypto.randomUUID(),
        file: rejected.file,
        progress: 0,
        status: 'failed' as const,
        error: 'Csak képfájlok (JPEG, JPG, JFIF, PNG, GIF, WebP, SVG) feltöltése engedélyezett.'
      }));
      setUploads(current => [...current, ...newUploads]);
    }
  });

  const handleSelectImage = (imageId: number) => {
    setSelectedImages(current => 
      current.includes(imageId) 
        ? current.filter(id => id !== imageId)
        : [...current, imageId]
    );
  };

  const handleSelectAll = () => {
    setSelectedImages(
      selectedImages.length === filteredImages.length 
        ? [] 
        : filteredImages.map(img => img.id)
    );
  };

  const handleDelete = async () => {
    if (selectedImages.length === 0) return;

    if (window.confirm(`Biztosan törölni szeretnéd a kiválasztott ${selectedImages.length} képet?`)) {
      try {
        const token = localStorage.getItem('authToken');
        await axios.delete('http://localhost:3000/api/gallery/images', {
          headers: { Authorization: `Bearer ${token}` },
          data: { imageIds: selectedImages }
        });

        setImages(current => current.filter(img => !selectedImages.includes(img.id)));
        setSelectedImages([]);
      } catch (error) {
        console.error('Failed to delete images:', error);
        alert('A képek törlése sikertelen. Kérjük, próbáld újra.');
      }
    }
  };

  const handleEditClick = (image: GalleryImage, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditDialog({
      open: true,
      imageId: image.id,
      description: image.description || ''
    });
  };

  const handleEditClose = () => {
    setEditDialog({
      open: false,
      imageId: null,
      description: ''
    });
  };

  const handleEditSave = async () => {
    if (!editDialog.imageId) return;

    try {
      const token = localStorage.getItem('authToken');
      await axios.patch(
        `http://localhost:3000/api/gallery/images/${editDialog.imageId}`,
        { description: editDialog.description },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update the image in the local state
      setImages(current =>
        current.map(img =>
          img.id === editDialog.imageId
            ? { ...img, description: editDialog.description }
            : img
        )
      );

      handleEditClose();
    } catch (error) {
      console.error('Kép leírásának frissítése sikertelen:', error);
      alert('A kép leírásának frissítése sikertelen. Kérjük, próbáld újra.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/admin/login');
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
            Beállítások
          </Button>
          <Button
            onClick={handleLogout}
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
            Kijelentkezés
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
            Galéria kezelése
          </Typography>
          <Typography 
            variant="subtitle1" 
            color="text.secondary"
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
            Képek feltöltése, kezelése és rendszerezése
          </Typography>
        </Box>

        <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
          {/* Upload Area */}
          <Box
            {...getRootProps()}
            sx={{
              p: { xs: 2, sm: 3 },
              mb: 3,
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'grey.300',
              borderRadius: 1,
              backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
              cursor: 'pointer',
              textAlign: 'center'
            }}
          >
            <input {...getInputProps()} />
            <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              {isDragActive ? 'Húzd ide a képeket' : 'Húzd ide a képeket, vagy kattints a fájlok kiválasztásához'}
            </Typography>
          </Box>

          {/* Search and Filter Section */}
          <Box sx={{ 
            mb: 3, 
            display: 'flex', 
            gap: { xs: 1, sm: 2 }, 
            alignItems: 'center', 
            flexWrap: 'wrap' 
          }}>
            <TextField
              placeholder="Képek keresése..."
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
                  label="Kezdő dátum"
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
                  label="Záró dátum"
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
                Szűrők törlése
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
              Feltöltési napló
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
              {uploads.map(upload => (
                <Box 
                  key={upload.id} 
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
                      bgcolor: upload.status === 'completed' 
                        ? 'success.main' 
                        : upload.status === 'failed' 
                          ? 'error.main' 
                          : 'primary.main',
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
                    {upload.file.name} 
                    {upload.status === 'uploading' && ` - Feltöltés: ${upload.progress}%`}
                    {upload.status === 'completed' && ' - Feltöltés sikeres'}
                    {upload.status === 'failed' && ` - Feltöltés sikertelen: ${upload.error}`}
                  </Typography>
                  {upload.status === 'uploading' && (
                    <LinearProgress variant="determinate" value={upload.progress} />
                  )}
                </Box>
              ))}
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
                  onChange={handleSelectAll}
                />
                <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                  {selectedImages.length === images.length ? 'Kijelölés törlése' : 'Összes kijelölése'}
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
                  Kijelölt képek törlése
                </Button>
              )}
            </Box>
          )}

          {/* Images Grid */}
          <Grid container spacing={{ xs: 1, sm: 2 }}>
            {filteredImages.map((image) => (
              <Grid item xs={6} sm={4} md={3} lg={2} key={image.id}>
                <Paper 
                  sx={{ 
                    p: 1,
                    position: 'relative',
                    '&:hover': {
                      boxShadow: 3
                    },
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Checkbox
                    checked={selectedImages.includes(image.id)}
                    onChange={() => handleSelectImage(image.id)}
                    sx={{
                      position: 'absolute',
                      top: 4,
                      left: 4,
                      zIndex: 1,
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      borderRadius: 1,
                      padding: { xs: '4px', sm: '8px' },
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)'
                      }
                    }}
                  />
                  <IconButton
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      zIndex: 1,
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      padding: { xs: '4px', sm: '8px' },
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)'
                      }
                    }}
                    onClick={(e) => handleEditClick(image, e)}
                  >
                    <EditIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                  </IconButton>
                  <Box
                    component="img"
                    src={image.url}
                    alt={image.original_filename}
                    sx={{
                      width: '100%',
                      height: { xs: 120, sm: 160, md: 200 },
                      objectFit: 'cover',
                      borderRadius: 1,
                      filter: selectedImages.includes(image.id) ? 'brightness(0.8)' : 'none'
                    }}
                    onClick={() => handleSelectImage(image.id)}
                  />
                  <Box sx={{ 
                    mt: 1, 
                    display: 'flex', 
                    flexDirection: 'column',
                    flexGrow: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: 0
                  }}>
                    <Typography 
                      variant="body2" 
                      noWrap 
                      align="center" 
                      sx={{ 
                        width: '100%',
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}
                    >
                      {image.original_filename}
                    </Typography>
                    {image.description && (
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        align="center"
                        sx={{ 
                          mt: 0.5,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          lineHeight: 1.2,
                          width: '100%',
                          px: 1,
                          fontSize: { xs: '0.75rem', sm: '0.875rem' }
                        }}
                      >
                        {image.description}
                      </Typography>
                    )}
                  </Box>
                </Paper>
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
                ? 'Még nincsenek feltöltött képek. Kezdj el képeket feltölteni a fenti területre.'
                : 'Nincs a keresési feltételeknek megfelelő kép.'}
            </Typography>
          )}
        </Paper>

        {/* Edit Dialog */}
        <Dialog 
          open={editDialog.open} 
          onClose={handleEditClose}
          maxWidth="sm"
          fullWidth
          fullScreen={isMobile}
        >
          <DialogTitle>Kép leírás szerkesztése</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Leírás"
              fullWidth
              multiline
              rows={4}
              value={editDialog.description}
              onChange={(e) => setEditDialog(prev => ({ ...prev, description: e.target.value }))}
            />
          </DialogContent>
          <DialogActions sx={{ flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 0 }, p: 2 }}>
            <Button 
              onClick={() => setEditDialog(prev => ({ ...prev, description: '' }))}
              color="error"
              fullWidth={isMobile}
            >
              Leírás törlése
            </Button>
            <Box sx={{ flex: { xs: 0, sm: 1 } }} />
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={1} 
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              <Button 
                onClick={handleEditClose}
                fullWidth={isMobile}
              >
                Mégse
              </Button>
              <Button 
                onClick={handleEditSave} 
                variant="contained" 
                color="primary"
                fullWidth={isMobile}
              >
                Mentés
              </Button>
            </Stack>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Gallery; 