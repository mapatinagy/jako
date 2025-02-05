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
  Stack
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { GalleryImage, UploadStatus } from '../../../types/gallery.types';
import SessionTimer from '../../../components/auth/SessionTimer';

const Gallery = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState<GalleryImage[]>([]);
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

  useEffect(() => {
    fetchImages();
  }, []);

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
      console.error('Failed to fetch images:', error);
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
          
          // Remove completed upload after a delay
          setTimeout(() => {
            setUploads(current => current.filter(u => u.id !== upload.id));
          }, 2000);
        }
      } catch (error: any) {
        console.error('Upload failed:', error);
        setUploads(current =>
          current.map(u =>
            u.id === upload.id
              ? { 
                  ...u, 
                  status: 'failed', 
                  error: error.response?.data?.message || 'Upload failed' 
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
      'image/*': []
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
      selectedImages.length === images.length 
        ? [] 
        : images.map(img => img.id)
    );
  };

  const handleDelete = async () => {
    if (selectedImages.length === 0) return;

    if (window.confirm(`Are you sure you want to delete ${selectedImages.length} image(s)?`)) {
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
        alert('Failed to delete images. Please try again.');
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
      console.error('Failed to update image description:', error);
      alert('Failed to update image description. Please try again.');
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
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" gutterBottom color="primary">
            Gallery Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Upload, manage, and organize your gallery images
          </Typography>
        </Box>

        <Paper sx={{ p: 3, mb: 3 }}>
          {/* Upload Area */}
          <Box
            {...getRootProps()}
            sx={{
              p: 3,
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
            <Typography>
              {isDragActive ? 'Drop the images here' : 'Drag & drop images here, or click to select files'}
            </Typography>
          </Box>

          {/* Upload Progress */}
          {uploads.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Uploads
              </Typography>
              {uploads.map(upload => (
                <Box key={upload.id} sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    {upload.file.name} - {upload.status === 'uploading' ? `${upload.progress}%` : upload.status}
                  </Typography>
                  {upload.error && (
                    <Typography variant="body2" color="error">
                      {upload.error}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          )}

          {/* Select All and Delete */}
          {images.length > 0 && (
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Checkbox
                  checked={selectedImages.length === images.length}
                  indeterminate={selectedImages.length > 0 && selectedImages.length < images.length}
                  onChange={handleSelectAll}
                />
                <Typography variant="body2">
                  Select All ({selectedImages.length} of {images.length} selected)
                </Typography>
              </Box>
              {selectedImages.length > 0 && (
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleDelete}
                >
                  Delete Selected
                </Button>
              )}
            </Box>
          )}

          {/* Images Grid */}
          <Grid container spacing={2}>
            {images.map((image) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={image.id}>
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
                      top: 8,
                      left: 8,
                      zIndex: 1,
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      borderRadius: 1,
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)'
                      }
                    }}
                  />
                  <IconButton
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      zIndex: 1,
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)'
                      }
                    }}
                    onClick={(e) => handleEditClick(image, e)}
                  >
                    <EditIcon />
                  </IconButton>
                  <Box
                    component="img"
                    src={image.url}
                    alt={image.originalFilename}
                    sx={{
                      width: '100%',
                      height: 200,
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
                    <Typography variant="body2" noWrap align="center" sx={{ width: '100%' }}>
                      {image.originalFilename}
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
                          px: 1
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

          {images.length === 0 && (
            <Typography variant="body1" color="text.secondary" align="center">
              No images uploaded yet. Start by dropping some images above.
            </Typography>
          )}
        </Paper>

        {/* Edit Dialog */}
        <Dialog 
          open={editDialog.open} 
          onClose={handleEditClose}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Edit Image Description</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={editDialog.description}
              onChange={(e) => setEditDialog(prev => ({ ...prev, description: e.target.value }))}
            />
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setEditDialog(prev => ({ ...prev, description: '' }))}
              color="error"
            >
              Clear
            </Button>
            <Box sx={{ flex: 1 }} />
            <Button onClick={handleEditClose}>Cancel</Button>
            <Button onClick={handleEditSave} variant="contained" color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Gallery; 