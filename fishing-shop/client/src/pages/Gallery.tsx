import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Skeleton,
  IconButton,
  Dialog,
  DialogContent,
  useTheme,
  useMediaQuery,
  Fade
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { GalleryImage } from '../types/gallery.types';
import { Helmet } from 'react-helmet-async';

const Gallery = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [openLightbox, setOpenLightbox] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/gallery/images');
      const data = await response.json();
      
      if (data.success) {
        // Add full URL to images
        const imagesWithUrls = data.images.map((img: GalleryImage) => ({
          ...img,
          url: `http://localhost:3000/uploads/${img.filename}`
        }));
        setImages(imagesWithUrls);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (image: GalleryImage) => {
    setSelectedImage(image);
    setOpenLightbox(true);
  };

  const handleCloseLightbox = () => {
    setOpenLightbox(false);
  };

  const handlePrevImage = () => {
    if (!selectedImage) return;
    const currentIndex = images.findIndex(img => img.id === selectedImage.id);
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    setSelectedImage(images[prevIndex]);
  };

  const handleNextImage = () => {
    if (!selectedImage) return;
    const currentIndex = images.findIndex(img => img.id === selectedImage.id);
    const nextIndex = (currentIndex + 1) % images.length;
    setSelectedImage(images[nextIndex]);
  };

  return (
    <Box sx={{ py: 6, bgcolor: 'background.default' }}>
      <Helmet>
        <title>Gallery - Fishing Shop Product Showcase</title>
        <meta name="description" content="Browse our gallery of fishing equipment, animal feed products, and beautiful plants. See our quality products and store images." />
        <meta name="keywords" content="fishing equipment gallery, fishing shop photos, product showcase, store gallery" />
      </Helmet>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography 
            variant="h1" 
            sx={{ 
              mb: 2,
              position: 'relative',
              display: 'inline-block',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -8,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 100,
                height: 3,
                bgcolor: 'primary.main',
                borderRadius: 1
              }
            }}
          >
            Our Gallery
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto', mt: 3 }}>
            Explore our collection of fishing equipment, beautiful plants, and quality animal feed products
          </Typography>
        </Box>

        {/* Gallery Grid */}
        <Grid container spacing={2}>
          {loading ? (
            // Loading skeletons
            Array.from(new Array(8)).map((_, index) => (
              <Grid item xs={6} sm={6} md={3} key={index}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)'
                    }
                  }}
                >
                  <Skeleton 
                    variant="rectangular" 
                    height={180}
                    animation="wave"
                    sx={{ bgcolor: 'rgba(0,0,0,0.1)' }}
                  />
                  <CardContent sx={{ py: 1, px: 2, minHeight: 'auto' }}>
                    <Skeleton width="60%" />
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            images.map((image, index) => (
              <Grid item xs={6} sm={6} md={3} key={image.id}>
                <Fade in={true} timeout={500} style={{ transitionDelay: `${index * 100}ms` }}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: (theme) => theme.shadows[8],
                        '& .MuiCardMedia-root': {
                          transform: 'scale(1.05)'
                        }
                      }
                    }}
                    onClick={() => handleImageClick(image)}
                  >
                    <Box sx={{ position: 'relative', overflow: 'hidden', pt: '75%' }}>
                      <CardMedia
                        component="img"
                        image={image.url}
                        alt={image.description || image.original_filename}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease'
                        }}
                      />
                      {image.description && (
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.5) 50%, rgba(0,0,0,0))',
                            padding: { xs: '12px 8px 6px', sm: '20px 8px 8px' },
                            transition: 'opacity 0.3s ease',
                            opacity: 0.95,
                            '&:hover': {
                              opacity: 1
                            }
                          }}
                        >
                          <Typography 
                            variant="body2" 
                            sx={{
                              color: 'white',
                              textAlign: 'center',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: 'vertical',
                              textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                              fontSize: { xs: '0.75rem', sm: '0.875rem' },
                              lineHeight: { xs: 1.2, sm: 1.43 }
                            }}
                          >
                            {image.description}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Card>
                </Fade>
              </Grid>
            ))
          )}
        </Grid>

        {/* Lightbox */}
        <Dialog
          fullScreen={fullScreen}
          maxWidth="lg"
          open={openLightbox}
          onClose={handleCloseLightbox}
          onClick={(e) => {
            // Close when clicking the backdrop (shaded area)
            if (e.target === e.currentTarget) {
              handleCloseLightbox();
            }
          }}
          sx={{
            '& .MuiDialog-paper': {
              bgcolor: 'transparent',
              backgroundImage: 'none',
              boxShadow: 'none',
              margin: { xs: 2, sm: 4 }
            },
            '& .MuiBackdrop-root': {
              backgroundColor: 'rgba(0, 0, 0, 0.8)'
            }
          }}
        >
          <DialogContent 
            sx={{ 
              p: 0,
              position: 'relative',
              overflow: 'hidden',
              '&::-webkit-scrollbar': {
                display: 'none'
              },
              bgcolor: 'transparent',
              height: '100%'
            }}
          >
            {selectedImage && (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}
                onClick={handleCloseLightbox}
              >
                <Box
                  sx={{
                    position: 'relative',
                    maxWidth: '100%',
                    maxHeight: '90vh',
                    display: 'flex',
                    justifyContent: 'center'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.description || selectedImage.original_filename}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '90vh',
                      objectFit: 'contain',
                      borderRadius: '4px'
                    }}
                  />
                  <IconButton
                    onClick={handleCloseLightbox}
                    sx={{
                      position: 'absolute',
                      right: -12,
                      top: -12,
                      color: 'white',
                      bgcolor: 'rgba(0,0,0,0.4)',
                      '&:hover': {
                        bgcolor: 'rgba(0,0,0,0.6)'
                      },
                      zIndex: 1
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                  <IconButton
                    onClick={handlePrevImage}
                    sx={{
                      position: 'absolute',
                      left: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'white',
                      bgcolor: 'rgba(0,0,0,0.4)',
                      '&:hover': {
                        bgcolor: 'rgba(0,0,0,0.6)'
                      }
                    }}
                  >
                    <NavigateBeforeIcon />
                  </IconButton>
                  <IconButton
                    onClick={handleNextImage}
                    sx={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'white',
                      bgcolor: 'rgba(0,0,0,0.4)',
                      '&:hover': {
                        bgcolor: 'rgba(0,0,0,0.6)'
                      }
                    }}
                  >
                    <NavigateNextIcon />
                  </IconButton>
                  {selectedImage.description && (
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.5) 50%, rgba(0,0,0,0))',
                        padding: { xs: '20px 16px 12px', sm: '24px 16px 14px' },
                        transition: 'opacity 0.3s ease',
                        opacity: 0.95,
                        '&:hover': {
                          opacity: 1
                        },
                        borderBottomLeftRadius: '4px',
                        borderBottomRightRadius: '4px'
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          color: 'white',
                          textAlign: 'center',
                          textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                          fontSize: { xs: '0.85rem', sm: '1.1rem' },
                          lineHeight: { xs: 1.2, sm: 1.4 }
                        }}
                      >
                        {selectedImage.description}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            )}
          </DialogContent>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Gallery; 