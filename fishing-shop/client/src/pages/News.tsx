import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Button
} from '@mui/material';
import { format } from 'date-fns';
import StoreIcon from '@mui/icons-material/Store';
import CloseIcon from '@mui/icons-material/Close';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ShareIcon from '@mui/icons-material/Share';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
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
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentPost, setCurrentPost] = useState<NewsPost | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [shareAnchorEl, setShareAnchorEl] = useState<null | HTMLElement>(null);
  const [sharePost, setSharePost] = useState<NewsPost | null>(null);

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

  const handleShareClick = (event: React.MouseEvent<HTMLElement>, post: NewsPost) => {
    console.log('Share button clicked', { post });
    event.preventDefault();
    event.stopPropagation();
    setShareAnchorEl(event.currentTarget);
    setSharePost(post);
  };

  const handleShareClose = () => {
    console.log('Share menu closing');
    setShareAnchorEl(null);
    setSharePost(null);
  };

  const handleShare = async (platform: string) => {
    console.log('Sharing to platform:', platform);
    if (!sharePost) {
      console.log('No post selected for sharing');
      return;
    }

    const postUrl = `${window.location.origin}/news/${sharePost.id}`;
    console.log('Sharing URL:', postUrl);

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}&quote=${encodeURIComponent(sharePost.title)}`, '_blank');
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(postUrl);
          // Show a temporary success message
          const menuItem = document.querySelector('[data-share="copy"]');
          if (menuItem) {
            const originalText = menuItem.textContent;
            menuItem.textContent = 'Link copied!';
            setTimeout(() => {
              if (menuItem) {
                menuItem.textContent = originalText;
              }
            }, 2000);
          }
        } catch (err) {
          console.error('Failed to copy:', err);
        }
        break;
    }

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
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Button 
            onClick={() => navigate('/news')}
            sx={{ mb: 3 }}
            variant="text"
            color="primary"
          >
            ← Back to News
          </Button>
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
        </Box>
      </Container>
    </Box>
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
      
      {/* Share Menu - Moved outside of post content */}
      <Menu
        id="share-menu"
        anchorEl={shareAnchorEl}
        open={Boolean(shareAnchorEl)}
        onClose={handleShareClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{
          '& .MuiPaper-root': {
            borderRadius: 2,
            minWidth: 180,
            boxShadow: 'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px'
          }
        }}
      >
        <MenuItem onClick={() => handleShare('facebook')} sx={{ py: 1.5 }}>
          <FacebookIcon sx={{ mr: 1.5, color: '#1877F2' }} />
          Share on Facebook
        </MenuItem>
        <MenuItem onClick={() => handleShare('copy')} data-share="copy" sx={{ py: 1.5 }}>
          <LinkIcon sx={{ mr: 1.5 }} />
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
                    {(() => {
                      const post = currentPost as NewsPost | null;
                      return post && post.featured_image && post.featured_image.length > 1 && (
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
                      );
                    })()}
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