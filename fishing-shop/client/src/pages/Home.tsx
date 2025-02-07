import { Box, Container, Typography, Grid, Paper, Button, Card, CardMedia, CardContent } from '@mui/material';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

// Images from the hero folder in public directory
const backgroundImages = [
  '/hero/hero1.jpg',
  '/hero/hero2.jpg',
  '/hero/hero3.jpg',
];

interface GalleryImage {
  id: number;
  url: string;
  description: string | null;
}

interface NewsPost {
  id: number;
  title: string;
  content: string;
  created_at: string;
  featured_image: string[] | null;
  is_published: boolean;
}

function Home() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedImage, setDisplayedImage] = useState(backgroundImages[0]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [latestImages, setLatestImages] = useState<GalleryImage[]>([]);
  const [latestNews, setLatestNews] = useState<NewsPost[]>([]);

  useEffect(() => {
    fetchLatestImages();
    fetchLatestNews();
  }, []);

  const fetchLatestImages = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/gallery/images');
      const data = await response.json();
      if (data.success) {
        const images = data.images.slice(0, 6).map((img: any) => ({
          ...img,
          url: `http://localhost:3000/uploads/${img.filename}`
        }));
        setLatestImages(images);
      }
    } catch (error) {
      console.error('Error fetching gallery images:', error);
    }
  };

  const fetchLatestNews = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/news/posts');
      const data = await response.json();
      if (data.success) {
        const publishedPosts = data.posts
          .filter((post: NewsPost) => post.is_published)
          .slice(0, 2)
          .map((post: NewsPost) => ({
            ...post,
            featured_image: post.featured_image?.map(image => 
              image.startsWith('http') ? image : `http://localhost:3000${image}`
            )
          }));
        setLatestNews(publishedPosts);
      }
    } catch (error) {
      console.error('Error fetching news posts:', error);
    }
  };

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

      {/* News Posts Section */}
      <Box sx={{ py: 8, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Typography variant="h3" sx={{ mb: 4, color: 'primary.main', textAlign: 'center' }}>
            Latest News
          </Typography>
          <Grid container spacing={4} sx={{ mb: 4 }}>
            {latestNews.map((post) => (
              <Grid item xs={12} md={6} key={post.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6
                    }
                  }}
                  onClick={() => navigate(`/news/${post.id}`)}
                >
                  <CardContent>
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
                        {new Date(post.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>

                    {/* Post Content */}
                    <Box sx={{ mb: 2.5 }}>
                      <Typography 
                        component="div"
                        variant="body1" 
                        color="text.secondary"
                        sx={{ 
                          fontSize: '1rem',
                          lineHeight: 1.7,
                          mb: 2,
                          '& p': {
                            margin: 0,
                            '&:last-child': { mb: 0 }
                          }
                        }}
                        dangerouslySetInnerHTML={{ 
                          __html: post.content.length > 200
                            ? `${post.content.substring(0, 200).replace(/<[^>]*>/g, '')}...`
                            : post.content 
                        }}
                      />
                    </Box>

                    {/* Featured Images */}
                    {post.featured_image && post.featured_image.length > 0 && (
                      <Box sx={{ mb: 2 }}>
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
                                image={image}
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
              </Grid>
            ))}
          </Grid>
          <Box sx={{ textAlign: 'center' }}>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => navigate('/news')}
              sx={{
                borderRadius: 2,
                px: 6,
                py: 1.5,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4
                }
              }}
            >
              View All News
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Gallery Section */}
      <Box sx={{ py: 8, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Typography variant="h3" sx={{ mb: 4, color: 'primary.main', textAlign: 'center' }}>
            Latest Gallery
          </Typography>
          <Box sx={{ mb: 4 }}>
            <Grid container spacing={2}>
              {latestImages.map((image) => (
                <Grid item xs={12} sm={4} md={2} key={image.id}>
                  <Card 
                    sx={{ 
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6,
                        '& .MuiCardMedia-root': {
                          transform: 'scale(1.1)'
                        }
                      }
                    }}
                  >
                    <Box sx={{ position: 'relative', pt: '100%', overflow: 'hidden' }}>
                      <CardMedia
                        component="img"
                        image={image.url}
                        alt={image.description || 'Gallery image'}
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
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => navigate('/gallery')}
              sx={{
                borderRadius: 2,
                px: 6,
                py: 1.5,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4
                }
              }}
            >
              View Full Gallery
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default Home; 