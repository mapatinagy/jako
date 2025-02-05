import { useState, useEffect } from 'react';
import { Box, Container, Typography, Grid, Paper, Checkbox, Button, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { GalleryImage, UploadStatus } from '../../../types/gallery.types';

const Gallery = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [uploads, setUploads] = useState<UploadStatus[]>([]);
  const [selectedImages, setSelectedImages] = useState<number[]>([]);

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

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Gallery Management
        </Typography>
        
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
                  }
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
                  onClick={(e) => {
                    e.stopPropagation();
                    // Edit functionality will be added later
                    console.log('Edit clicked for image:', image.id);
                  }}
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
                <Typography variant="body2" sx={{ mt: 1 }} noWrap>
                  {image.originalFilename}
                </Typography>
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
    </Container>
  );
};

export default Gallery; 