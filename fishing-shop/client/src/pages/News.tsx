import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Button,
  Grid,
  CardActionArea,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { format } from 'date-fns';
import StoreIcon from '@mui/icons-material/Store';
import CloseIcon from '@mui/icons-material/Close';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ShareIcon from '@mui/icons-material/Share';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LinkIcon from '@mui/icons-material/Link';
import { Helmet } from 'react-helmet-async';

interface NewsPost {
  id: number;
  title: string;
  content: string;
  created_at: string;
  featured_image: string[] | null;
  is_published: boolean;
}

const isNewsPost = (post: any): post is NewsPost => {
  return post !== null && 
         typeof post === 'object' && 
         'id' in post &&
         'title' in post &&
         'content' in post &&
         'created_at' in post &&
         'featured_image' in post &&
         'is_published' in post;
};

const News = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<{ url: string; postImages: string[]; currentIndex: number } | null>(null);
  const [currentPost, setCurrentPost] = useState<NewsPost | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [shareAnchorEl, setShareAnchorEl] = useState<null | HTMLElement>(null);
  const [sharePost, setSharePost] = useState<NewsPost | null>(null);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [openLightbox, setOpenLightbox] = useState(false);
  const [expandedImageGrid, setExpandedImageGrid] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (id && posts.length > 0) {
      const post = posts.find(p => p.id === parseInt(id));
      if (post) {
        setCurrentPost(post);
      } else {
        fetchSinglePost(parseInt(id));
      }
    } else {
      setCurrentPost(null);
    }
  }, [id, posts]);

  useEffect(() => {
    // Scroll to top when navigating to a single post
    if (id) {
      window.scrollTo(0, 0);
    }
  }, [id]);

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

  const fetchSinglePost = async (postId: number) => {
    try {
      const response = await fetch(`http://localhost:3000/api/news/posts/${postId}`);
      const data = await response.json();
      
      if (data.success && data.post) {
        if (data.post.is_published) {
          setCurrentPost(data.post);
        } else {
          navigate('/news');
        }
      } else {
        navigate('/news');
      }
    } catch (error) {
      console.error('Error fetching single post:', error);
      navigate('/news');
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

  const handleImageClick = (e: React.MouseEvent, postImages: string[], imageIndex: number, isExpandButton?: boolean) => {
    e.stopPropagation();
    
    if (isExpandButton && id && postImages) {
      setExpandedImageGrid(true);
      return;
    }

    if (postImages && postImages.length > 0) {
      const url = postImages[imageIndex];
      setSelectedImage({
        url: url.startsWith('http') ? url : `http://localhost:3000${url}`,
        postImages: postImages.map(img => img.startsWith('http') ? img : `http://localhost:3000${img}`),
        currentIndex: imageIndex
      });
      setOpenLightbox(true);
    }
  };

  const handleCloseLightbox = () => {
    setOpenLightbox(false);
    setSelectedImage(null);
  };

  const handlePrevImage = () => {
    if (selectedImage) {
      const newIndex = (selectedImage.currentIndex - 1 + selectedImage.postImages.length) % selectedImage.postImages.length;
      setSelectedImage({
        ...selectedImage,
        url: selectedImage.postImages[newIndex],
        currentIndex: newIndex
      });
    }
  };

  const handleNextImage = () => {
    if (selectedImage) {
      const newIndex = (selectedImage.currentIndex + 1) % selectedImage.postImages.length;
      setSelectedImage({
        ...selectedImage,
        url: selectedImage.postImages[newIndex],
        currentIndex: newIndex
      });
    }
  };

  const handlePostClick = (postId: number) => {
    navigate(`/news/${postId}`);
  };

  const handleShareClick = (event: React.MouseEvent<HTMLElement>, post: NewsPost) => {
    event.stopPropagation();
    setShareAnchorEl(event.currentTarget);
    setSharePost(post);
  };

  const handleShareClose = () => {
    setShareAnchorEl(null);
    setSharePost(null);
  };

  const handleShare = async (platform: string) => {
    if (!sharePost) return;

    const postUrl = `${window.location.origin}/news/${sharePost.id}`;

    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(postUrl);
        // You could add a snackbar notification here to show success
        console.log('Link copied to clipboard');
      } catch (err) {
        console.error('Failed to copy:', err);
      }
      handleShareClose();
      return;
    }

    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(sharePost.title)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`;
        break;
    }

    window.open(shareUrl, '_blank', 'width=600,height=400');
    handleShareClose();
  };

  const renderSinglePost = (post: NewsPost) => (
    <Box>
      <Helmet>
        <title>{post.title} - Fishing Shop News</title>
        <meta name="description" content={`${post.content.slice(0, 150).replace(/<[^>]*>/g, '')}...`} />
        <meta name="keywords" content={`fishing news, ${post.title.toLowerCase()}, fishing shop updates`} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.content.slice(0, 150).replace(/<[^>]*>/g, '')} />
        <meta property="og:url" content={`${window.location.origin}/news/${post.id}`} />
        {post.featured_image && post.featured_image[0] && (
          <meta property="og:image" content={post.featured_image[0].startsWith('http') ? post.featured_image[0] : `http://localhost:3000${post.featured_image[0]}`} />
        )}
      </Helmet>
      
      {/* Back button outside the main content container */}
      <Box sx={{ position: 'sticky', top: 0, bgcolor: 'background.default', zIndex: 1, py: 2 }}>
        <Container maxWidth="lg">
          <Button 
            onClick={() => navigate('/news')}
            variant="text"
            color="primary"
          >
            ← Back to News
          </Button>
        </Container>
      </Box>

      <Container maxWidth="lg">
        <Box sx={{ py: 2 }}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              {/* Post Header with Title, Date, and Share Button */}
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
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                  
                  <Tooltip title="Share">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        console.log('Share icon clicked');
                        handleShareClick(e, post);
                      }}
                      sx={{
                        ml: 1,
                        color: 'primary.main',
                        '&:hover': {
                          bgcolor: 'primary.main',
                          color: 'white'
                        }
                      }}
                    >
                      <ShareIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
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

              {/* Featured Images - Simplified Grid */}
              {post.featured_image && Array.isArray(post.featured_image) && post.featured_image.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Grid container spacing={2}>
                    {post.featured_image.map((image, imageIndex) => (
                      <Grid item xs={12} sm={6} md={4} key={imageIndex}>
                        <Box
                          sx={{
                            position: 'relative',
                            paddingTop: '75%',
                            borderRadius: 1,
                            overflow: 'hidden',
                            boxShadow: (theme) => theme.shadows[2]
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
                              objectFit: 'cover'
                            }}
                          />
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );

  const renderPosts = () => (
    <Grid container spacing={4}>
      {posts.map((post) => (
        <Grid item xs={12} key={post.id}>
          <Card 
            onClick={() => handlePostClick(post.id)}
            sx={{ 
              height: '100%',
              transition: 'transform 0.3s ease',
              cursor: 'pointer',
              '&:hover': {
                transform: 'translateY(-4px)'
              }
            }}
          >
            <CardContent>
              {/* Title and Share Section */}
              <Box 
                sx={{ 
                  '&:hover': {
                    '& .post-title': {
                      color: 'primary.main'
                    }
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography 
                    variant="h5" 
                    component="h2" 
                    className="post-title"
                    sx={{ 
                      flex: 1, 
                      mr: 2,
                      transition: 'color 0.2s ease'
                    }}
                  >
                    {post.title}
                  </Typography>
                  <Box 
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {format(new Date(post.created_at), 'yyyy MMM d')}
                    </Typography>
                    <Tooltip title="Share">
                      <IconButton
                        size="small"
                        onClick={(e) => handleShareClick(e, post)}
                        sx={{
                          ml: 1,
                          color: 'primary.main',
                          '&:hover': {
                            bgcolor: 'primary.main',
                            color: 'white'
                          }
                        }}
                      >
                        <ShareIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                {/* Post Content */}
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mt: 2,
                    mb: 3,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical'
                  }}
                >
                  {post.content.replace(/<[^>]*>/g, '')}
                </Typography>
              </Box>

              {/* Images Section - Completely Independent */}
              {post.featured_image && Array.isArray(post.featured_image) && (
                <Box 
                  onClick={(e) => e.stopPropagation()}
                  sx={{ 
                    position: 'relative',
                    zIndex: 1
                  }}
                >
                  <Grid container spacing={2}>
                    {post.featured_image.slice(0, 3).map((image, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Box 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (index === 2 && post.featured_image && post.featured_image.length > 3) {
                              handlePostClick(post.id);
                            } else if (post.featured_image) {
                              setSelectedImage({
                                url: image.startsWith('http') ? image : `http://localhost:3000${image}`,
                                postImages: post.featured_image.map(img => 
                                  img.startsWith('http') ? img : `http://localhost:3000${img}`
                                ),
                                currentIndex: index
                              });
                              setOpenLightbox(true);
                            }
                          }}
                          sx={{ 
                            position: 'relative',
                            paddingTop: '56.25%',
                            borderRadius: 1,
                            overflow: 'hidden',
                            boxShadow: (theme) => theme.shadows[2],
                            cursor: 'pointer',
                            '&:hover img': {
                              transform: 'scale(1.05)'
                            }
                          }}
                        >
                          <CardMedia
                            component="img"
                            image={image.startsWith('http') ? image : `http://localhost:3000${image}`}
                            alt={`Image ${index + 1} for ${post.title}`}
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
                          {index === 2 && post.featured_image && post.featured_image.length > 3 && (
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
                                zIndex: 3,
                                '&:hover': {
                                  bgcolor: 'rgba(0, 0, 0, 0.6)'
                                }
                              }}
                            >
                              +{post.featured_image.length - 3}
                            </Box>
                          )}
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Box>
      <Helmet>
        {!currentPost && (
          <>
            <title>Latest News - Fishing Shop Updates and Articles</title>
            <meta name="description" content="Stay updated with the latest news, articles, and updates from our fishing shop. New products, fishing tips, and special offers." />
            <meta name="keywords" content="fishing news, fishing articles, fishing shop updates, fishing equipment news" />
          </>
        )}
      </Helmet>
      
      {/* Share Menu */}
      <Menu
        anchorEl={shareAnchorEl}
        open={Boolean(shareAnchorEl)}
        onClose={handleShareClose}
        onClick={(e) => e.stopPropagation()}
        sx={{
          '& .MuiPaper-root': {
            borderRadius: 2,
            minWidth: 200,
            boxShadow: 'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px'
          }
        }}
      >
        <MenuItem onClick={() => handleShare('facebook')} sx={{ py: 1.5 }}>
          <FacebookIcon sx={{ mr: 1.5, color: '#1877F2' }} />
          Share on Facebook
        </MenuItem>
        <MenuItem onClick={() => handleShare('twitter')} sx={{ py: 1.5 }}>
          <TwitterIcon sx={{ mr: 1.5, color: '#1DA1F2' }} />
          Share on Twitter
        </MenuItem>
        <MenuItem onClick={() => handleShare('linkedin')} sx={{ py: 1.5 }}>
          <LinkedInIcon sx={{ mr: 1.5, color: '#0A66C2' }} />
          Share on LinkedIn
        </MenuItem>
        <MenuItem onClick={() => handleShare('copy')} sx={{ py: 1.5 }}>
          <ContentCopyIcon sx={{ mr: 1.5 }} />
          Copy Link
        </MenuItem>
      </Menu>
      
      {currentPost ? (
        renderSinglePost(currentPost)
      ) : (
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
                  renderPosts()
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
            fullScreen={fullScreen}
            maxWidth="lg"
            open={openLightbox}
            onClose={handleCloseLightbox}
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
              onClick={handleCloseLightbox}
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
                >
                  <Box
                    onClick={(e) => e.stopPropagation()}
                    sx={{
                      position: 'relative',
                      maxWidth: '100%',
                      maxHeight: '90vh',
                      display: 'flex',
                      justifyContent: 'center'
                    }}
                  >
                    <img
                      src={selectedImage.url.startsWith('http') ? selectedImage.url : `http://localhost:3000${selectedImage.url}`}
                      alt="News image"
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
                    {selectedImage.postImages.length > 1 && (
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
      )}
    </Box>
  );
};

export default News; 