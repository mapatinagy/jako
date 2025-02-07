import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Skeleton,
  Fade,
  Divider,
  Avatar,
  Stack,
  Paper,
  Dialog,
  DialogContent,
  IconButton
} from '@mui/material';
import { format } from 'date-fns';
import StoreIcon from '@mui/icons-material/Store';
import CloseIcon from '@mui/icons-material/Close';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

interface NewsPost {
  id: number;
  title: string;
  content: string;
  created_at: string;
  featured_image: string[] | null;
  is_published: boolean;
}

const News = () => {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentPost, setCurrentPost] = useState<NewsPost | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/news/posts');
      const data = await response.json();
      
      if (data.success) {
        console.log('Received posts:', data.posts);
        // Filter to only show published posts
        const publishedPosts = data.posts.filter((post: NewsPost) => post.is_published);
        setPosts(publishedPosts);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderSkeleton = () => (
    <Card sx={{ mb: 3, borderRadius: 2 }}>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ flex: 1 }}>
            <Skeleton width="40%" height={24} />
            <Skeleton width="20%" height={20} />
          </Box>
        </Stack>
        <Skeleton variant="rectangular" height={200} sx={{ mb: 2, borderRadius: 1 }} />
        <Skeleton height={20} sx={{ mb: 1 }} />
        <Skeleton height={20} width="80%" />
      </CardContent>
    </Card>
  );

  const handleImageClick = (post: NewsPost, imageIndex: number) => {
    setCurrentPost(post);
    setCurrentImageIndex(imageIndex);
    setSelectedImage(post.featured_image?.[imageIndex] || null);
  };

  const handleCloseLightbox = () => {
    setSelectedImage(null);
    setCurrentPost(null);
    setCurrentImageIndex(0);
  };

  const handlePrevImage = () => {
    if (!currentPost?.featured_image) return;
    const newIndex = (currentImageIndex - 1 + currentPost.featured_image.length) % currentPost.featured_image.length;
    setCurrentImageIndex(newIndex);
    setSelectedImage(currentPost.featured_image[newIndex]);
  };

  const handleNextImage = () => {
    if (!currentPost?.featured_image) return;
    const newIndex = (currentImageIndex + 1) % currentPost.featured_image.length;
    setCurrentImageIndex(newIndex);
    setSelectedImage(currentPost.featured_image[newIndex]);
  };

  return (
    <Box sx={{ py: 6, bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Hero Section - Full Width */}
      <Container maxWidth="xl" sx={{ mb: 6 }}>
        <Paper 
          elevation={0}
          sx={{ 
            textAlign: 'center',
            p: 4,
            background: 'linear-gradient(to right bottom, #2e7d32, #4caf50)',
            color: 'white',
            borderRadius: 2
          }}
        >
          <Typography 
            variant="h1" 
            sx={{ 
              mb: 2,
              color: 'white',
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
                bgcolor: 'white',
                borderRadius: 1
              }
            }}
          >
            Latest News
          </Typography>
          <Typography variant="h5" sx={{ maxWidth: 800, mx: 'auto', mt: 3, color: 'rgba(255, 255, 255, 0.9)' }}>
            Stay updated with our latest products, events, and special offers
          </Typography>
        </Paper>
      </Container>

      {/* Main Content with Sidebars */}
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', gap: 4 }}>
          {/* Left Sidebar */}
          <Box
            sx={{
              width: 280,
              display: { xs: 'none', lg: 'block' },
              flexShrink: 0,
              position: 'sticky',
              top: 88,
              alignSelf: 'flex-start',
              maxHeight: 'calc(100vh - 88px)',
              overflowY: 'auto'
            }}
          >
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                Opening Hours
              </Typography>
              <Stack spacing={1}>
                <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'background.default' }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>Monday - Friday</Typography>
                  <Typography variant="body2" color="text.secondary">8:00 - 18:00</Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'background.default' }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>Saturday</Typography>
                  <Typography variant="body2" color="text.secondary">9:00 - 16:00</Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'background.default' }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>Sunday</Typography>
                  <Typography variant="body2" color="text.secondary">Closed</Typography>
                </Box>
              </Stack>
            </Paper>

            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                Follow Us
              </Typography>
              <Stack direction="row" spacing={2} justifyContent="center">
                <IconButton
                  sx={{
                    bgcolor: 'background.default',
                    '&:hover': {
                      bgcolor: 'primary.main',
                      '& svg': { color: 'white' }
                    }
                  }}
                >
                  <Box 
                    component="img"
                    src="/social/facebook.png"
                    alt="Facebook"
                    sx={{ width: 24, height: 24 }}
                  />
                </IconButton>
                <IconButton
                  sx={{
                    bgcolor: 'background.default',
                    '&:hover': {
                      bgcolor: 'primary.main',
                      '& svg': { color: 'white' }
                    }
                  }}
                >
                  <Box 
                    component="img"
                    src="/social/instagram.png"
                    alt="Instagram"
                    sx={{ width: 24, height: 24 }}
                  />
                </IconButton>
                <IconButton
                  sx={{
                    bgcolor: 'background.default',
                    '&:hover': {
                      bgcolor: 'primary.main',
                      '& svg': { color: 'white' }
                    }
                  }}
                >
                  <Box 
                    component="img"
                    src="/social/twitter.png"
                    alt="Twitter"
                    sx={{ width: 24, height: 24 }}
                  />
                </IconButton>
              </Stack>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                align="center" 
                sx={{ mt: 2 }}
              >
                Stay connected with us on social media for the latest updates and fishing tips!
              </Typography>
            </Paper>
          </Box>

          {/* Main Content */}
          <Box sx={{ flex: 1, maxWidth: 800, mx: 'auto' }}>
            {loading ? (
              Array.from(new Array(3)).map((_, index) => (
                <Box key={index}>
                  {renderSkeleton()}
                </Box>
              ))
            ) : (
              posts.map((post, index) => (
                <Fade 
                  key={post.id} 
                  in={true} 
                  timeout={500} 
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <Card 
                    sx={{ 
                      mb: 3,
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: (theme) => theme.shadows[8]
                      }
                    }}
                  >
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                      {/* Post Header with Title and Date */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
                        <Typography 
                          variant="h5" 
                          sx={{ 
                            color: 'text.primary',
                            fontWeight: 500,
                            lineHeight: 1.3,
                            flex: 1,
                            mr: 2
                          }}
                        >
                          {post.title}
                        </Typography>
                        
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            whiteSpace: 'nowrap',
                            opacity: 0.8
                          }}
                        >
                          {format(new Date(post.created_at), 'yyyy MMM d, HH:mm:ss')}
                        </Typography>
                      </Box>

                      {/* Post Content */}
                      <Box 
                        sx={{ 
                          mb: 2.5,
                          '& > div': { 
                            '&:last-child': { mb: 0 }
                          }
                        }}
                      >
                        <Typography 
                          component="div"
                          sx={{ 
                            color: 'text.primary',
                            fontSize: '1rem',
                            lineHeight: 1.7,
                            '& img': {
                              maxWidth: '100%',
                              height: 'auto',
                              borderRadius: 1,
                              my: 2
                            },
                            '& p': {
                              mb: 2,
                              '&:last-child': { mb: 0 }
                            }
                          }}
                          dangerouslySetInnerHTML={{ __html: post.content }}
                        />
                      </Box>

                      {/* Featured Images */}
                      {post.featured_image && Array.isArray(post.featured_image) && post.featured_image.length > 0 && (
                        <Box sx={{ mb: 0 }}>
                          <Box
                            sx={{
                              display: 'grid',
                              gridTemplateColumns: {
                                xs: 'repeat(2, 1fr)',
                                sm: 'repeat(4, 1fr)'
                              },
                              gap: 1
                            }}
                          >
                            {post.featured_image?.slice(0, 4).map((image, imageIndex) => (
                              <Box
                                key={imageIndex}
                                onClick={() => handleImageClick(post, imageIndex)}
                                sx={{
                                  position: 'relative',
                                  paddingTop: '75%', // 4:3 aspect ratio for smaller thumbnails
                                  borderRadius: 1,
                                  overflow: 'hidden',
                                  boxShadow: (theme) => theme.shadows[2],
                                  cursor: 'pointer'
                                }}
                              >
                                <CardMedia
                                  component="img"
                                  image={image.startsWith('http') ? image : `http://localhost:3000${image}`}
                                  alt={`${post.title} - Image ${imageIndex + 1}`}
                                  sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    transition: 'transform 0.3s ease',
                                    '&:hover': {
                                      transform: 'scale(1.05)'
                                    }
                                  }}
                                />
                                {imageIndex === 3 && post.featured_image && post.featured_image.length > 4 && (
                                  <Box
                                    sx={{
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      right: 0,
                                      bottom: 0,
                                      bgcolor: 'rgba(0, 0, 0, 0.5)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      color: 'white',
                                      fontSize: '1.5rem',
                                      fontWeight: 'bold',
                                      '&:hover': {
                                        bgcolor: 'rgba(0, 0, 0, 0.6)'
                                      }
                                    }}
                                  >
                                    +{post.featured_image.length - 4}
                                  </Box>
                                )}
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Fade>
              ))
            )}
          </Box>

          {/* Right Sidebar */}
          <Box
            sx={{
              width: 280,
              display: { xs: 'none', lg: 'block' },
              flexShrink: 0,
              position: 'sticky',
              top: 88,
              alignSelf: 'flex-start',
              maxHeight: 'calc(100vh - 88px)',
              overflowY: 'auto'
            }}
          >
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                Contact Information
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ p: 2, borderRadius: 1, bgcolor: 'background.default' }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                    Address
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    123 Fishing Street
                    <br />
                    Fishtown, FT 12345
                  </Typography>
                </Box>
                <Box sx={{ p: 2, borderRadius: 1, bgcolor: 'background.default' }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                    Phone & Email
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    +1 234 567 890
                    <br />
                    info@fishingshop.com
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                Find Us
              </Typography>
              <Box 
                sx={{ 
                  width: '100%',
                  height: 200,
                  borderRadius: 1,
                  overflow: 'hidden'
                }}
              >
                <Box
                  component="iframe"
                  src="https://www.google.com/maps?q=46.77351657480384,21.13216451780124&z=16&output=embed"
                  sx={{
                    border: 0,
                    width: '100%',
                    height: '100%'
                  }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </Box>
            </Paper>
          </Box>
        </Box>
      </Container>

      {/* Lightbox Dialog */}
      <Dialog
        open={!!selectedImage}
        onClose={handleCloseLightbox}
        maxWidth="lg"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            bgcolor: 'transparent',
            boxShadow: 'none',
            margin: { xs: 2, sm: 4 }
          },
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.9)'
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
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
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
                  src={selectedImage.startsWith('http') ? selectedImage : `http://localhost:3000${selectedImage}`}
                  alt="Full size"
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
                    }
                  }}
                >
                  <CloseIcon />
                </IconButton>
                {currentPost?.featured_image && currentPost.featured_image.length > 1 && (
                  <>
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
                  </>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default News; 