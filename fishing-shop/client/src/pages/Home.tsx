import { Box, Container, Typography, Grid, Paper, Button, Card, CardContent, CardMedia } from '@mui/material';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

// Images from the hero folder in public directory
const backgroundImages = [
  '/hero/hero1.jpg',
  '/hero/hero2.jpg',
  '/hero/hero3.jpg',
];

const Home = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedImage, setDisplayedImage] = useState(backgroundImages[0]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [latestNews, setLatestNews] = useState<any[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % backgroundImages.length;
      setCurrentIndex(nextIndex);
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setDisplayedImage(backgroundImages[currentIndex]);
      setIsTransitioning(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [currentIndex]);

  useEffect(() => {
    fetchLatestNews();
  }, []);

  const fetchLatestNews = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/news/posts');
      const data = await response.json();
      
      if (data.success) {
        // Filter published posts and take the latest 3
        const publishedPosts = data.posts
          .filter((post: any) => post.is_published)
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 3);
        setLatestNews(publishedPosts);
      }
    } catch (error) {
      console.error('Error fetching latest news:', error);
    } finally {
      setLoadingNews(false);
    }
  };

  return (
    <Box>
      <Helmet>
        <title>Fishing Shop - Your One-Stop Shop for Fishing Equipment</title>
        <meta name="description" content="Premium fishing equipment, quality animal feed, and beautiful plants. Over 28 years of experience serving our community." />
        <meta name="keywords" content="fishing equipment, animal feed, plants, fishing shop, fishing supplies" />
      </Helmet>
      {/* Hero Section */}
      <Box 
        sx={{ 
          position: 'relative',
          height: '50vh',
          width: '100%',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(27, 94, 32, 0.4)',
            zIndex: 2,
          },
        }}
      >
        {/* Current Image */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${displayedImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0,
          }}
        />
        {/* Next Image */}
        {isTransitioning && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url(${backgroundImages[currentIndex]})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0,
              animation: 'fadeIn 1.5s forwards',
              zIndex: 1,
              '@keyframes fadeIn': {
                '0%': {
                  opacity: 0,
                },
                '100%': {
                  opacity: 1,
                },
              },
            }}
          />
        )}
        <Container 
          maxWidth={false} 
          sx={{ 
            px: { xs: 2, sm: 4, md: 6, lg: 8 },
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            zIndex: 3,
          }}
        >
          <Typography 
            variant="h1" 
            sx={{ 
              color: 'white', 
              mb: 2,
              textAlign: 'center',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              animation: 'fadeInDown 1s ease-out',
              '@keyframes fadeInDown': {
                '0%': {
                  opacity: 0,
                  transform: 'translateY(-20px)'
                },
                '100%': {
                  opacity: 1,
                  transform: 'translateY(0)'
                }
              }
            }}
          >
            Welcome to Our Fishing Shop
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              color: 'white', 
              mb: 4,
              maxWidth: 800,
              textAlign: 'center',
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
              animation: 'fadeInUp 1s ease-out 0.5s',
              opacity: 0,
              animationFillMode: 'forwards',
              '@keyframes fadeInUp': {
                '0%': {
                  opacity: 0,
                  transform: 'translateY(20px)'
                },
                '100%': {
                  opacity: 1,
                  transform: 'translateY(0)'
                }
              }
            }}
          >
            Your one-stop destination for premium fishing equipment, quality animal feed, and beautiful plants
          </Typography>
        </Container>
      </Box>

      {/* About Us Section */}
      <Box sx={{ 
        py: 8, 
        px: { xs: 2, sm: 4, md: 6, lg: 8 },
        bgcolor: 'background.paper',
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80%',
          height: '1px',
          bgcolor: 'primary.light',
          opacity: 0.3,
        }
      }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h2" sx={{ mb: 3 }}>
              About Us
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary', lineHeight: 1.8 }}>
              Since 1995, we've been more than just a shop – we're a community hub for fishing enthusiasts, pet owners, and garden lovers. Our journey began with a simple vision: to provide quality products and expert advice to our local community.
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', lineHeight: 1.8 }}>
              Today, we pride ourselves on our personalized service and carefully curated selection of products. Whether you're an experienced angler, a dedicated pet owner, or a passionate gardener, our knowledgeable team is here to help you succeed.
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              gap: 3,
              justifyContent: { xs: 'center', md: 'flex-start' }
            }}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  bgcolor: 'primary.main',
                  color: 'white',
                  borderRadius: 2,
                  textAlign: 'center',
                  minWidth: 120,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 20px rgba(0,0,0,0.2)'
                  }
                }}
              >
                <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
                  28+
                </Typography>
                <Typography variant="body2">
                  Years of Experience
                </Typography>
              </Paper>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  bgcolor: 'secondary.main',
                  color: 'white',
                  borderRadius: 2,
                  textAlign: 'center',
                  minWidth: 120,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 20px rgba(0,0,0,0.2)'
                  }
                }}
              >
                <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
                  5000+
                </Typography>
                <Typography variant="body2">
                  Happy Customers
                </Typography>
              </Paper>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                width: '100%',
                maxWidth: '720px',
                margin: '0 auto',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.02)',
                }
              }}
            >
              <img 
                src="/about/front.png" 
                alt="Our Store Front"
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '8px',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
                  transition: 'all 0.3s ease',
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Categories Section */}
      <Box sx={{ py: 8, px: { xs: 2, sm: 4, md: 6, lg: 8 } }}>
        <Typography variant="h2" sx={{ mb: 4 }}>
          Our Categories
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ 
              p: 3, 
              height: '100%', 
              transition: '0.3s', 
              position: 'relative',
              backgroundImage: 'url(/services/fishing.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              '&:hover': { transform: 'translateY(-4px)' },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                zIndex: 1
              }
            }}>
              <Box sx={{ position: 'relative', zIndex: 2 }}>
                <Typography variant="h3" sx={{ mb: 2, color: 'white' }}>
                  Fishing Equipment
                </Typography>
                <Typography sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.9)' }}>
                  Discover our wide range of high-quality fishing gear for both beginners and professionals.
                </Typography>
                <Box component="ul" sx={{ 
                  pl: 2,
                  '& li': { 
                    color: 'rgba(255, 255, 255, 0.9)',
                    mb: 1,
                    '&:last-child': { mb: 0 }
                  }
                }}>
                  <li>Fishing Rods & Reels</li>
                  <li>Baits & Lures</li>
                  <li>Fishing Lines & Hooks</li>
                  <li>Accessories & Tools</li>
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ 
              p: 3, 
              height: '100%', 
              transition: '0.3s', 
              position: 'relative',
              backgroundImage: 'url(/services/petfood.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              '&:hover': { transform: 'translateY(-4px)' },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                zIndex: 1
              }
            }}>
              <Box sx={{ position: 'relative', zIndex: 2 }}>
                <Typography variant="h3" sx={{ mb: 2, color: 'white' }}>
                  Animal Feed
                </Typography>
                <Typography sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.9)' }}>
                  Premium nutrition for your pets and livestock, carefully selected for their well-being.
                </Typography>
                <Box component="ul" sx={{ 
                  pl: 2,
                  '& li': { 
                    color: 'rgba(255, 255, 255, 0.9)',
                    mb: 1,
                    '&:last-child': { mb: 0 }
                  }
                }}>
                  <li>Dog & Cat Food</li>
                  <li>Bird Feed & Seeds</li>
                  <li>Fish Food</li>
                  <li>Livestock Feed</li>
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ 
              p: 3, 
              height: '100%', 
              transition: '0.3s', 
              position: 'relative',
              backgroundImage: 'url(/services/plants.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              '&:hover': { transform: 'translateY(-4px)' },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                zIndex: 1
              }
            }}>
              <Box sx={{ position: 'relative', zIndex: 2 }}>
                <Typography variant="h3" sx={{ mb: 2, color: 'white' }}>
                  Plants
                </Typography>
                <Typography sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.9)' }}>
                  Beautiful and healthy plants to bring life to your garden and home.
                </Typography>
                <Box component="ul" sx={{ 
                  pl: 2,
                  '& li': { 
                    color: 'rgba(255, 255, 255, 0.9)',
                    mb: 1,
                    '&:last-child': { mb: 0 }
                  }
                }}>
                  <li>Indoor Plants</li>
                  <li>Garden Plants</li>
                  <li>Seeds & Bulbs</li>
                  <li>Plant Care Products</li>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Latest News Section */}
      <Box sx={{ 
        py: 8, 
        px: { xs: 2, sm: 4, md: 6, lg: 8 },
        bgcolor: 'background.default'
      }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography 
              variant="h2" 
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
              Latest News
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto', mt: 3 }}>
              Stay updated with our latest products, events, and special offers
            </Typography>
          </Box>

          <Grid container spacing={4} sx={{ mb: 4 }}>
            {loadingNews ? (
              // Loading skeletons
              Array.from(new Array(3)).map((_, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Box sx={{ pt: '60%', bgcolor: 'grey.200', mb: 2 }} />
                    <Box sx={{ height: 24, bgcolor: 'grey.200', mb: 1, width: '80%' }} />
                    <Box sx={{ height: 20, bgcolor: 'grey.200', width: '40%' }} />
                  </Paper>
                </Grid>
              ))
            ) : (
              latestNews.map((post) => (
                <Grid item xs={12} md={4} key={post.id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)'
                      }
                    }}
                    onClick={() => navigate(`/news/${post.id}`)}
                  >
                    {post.featured_image && Array.isArray(post.featured_image) && post.featured_image[0] && (
                      <CardMedia
                        component="img"
                        height="200"
                        image={post.featured_image[0].startsWith('http') ? post.featured_image[0] : `http://localhost:3000${post.featured_image[0]}`}
                        alt={post.title}
                        sx={{ objectFit: 'cover' }}
                      />
                    )}
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {post.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {format(new Date(post.created_at), 'MMMM d, yyyy')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {post.content.replace(/<[^>]*>/g, '')}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>

          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/news')}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontSize: '1.1rem',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: (theme) => theme.shadows[8]
                }
              }}
            >
              View All News
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 