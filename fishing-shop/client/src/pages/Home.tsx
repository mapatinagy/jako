import { Box, Container, Typography, Grid, Paper, Button } from '@mui/material';
import { useEffect, useState } from 'react';

// Images from the hero folder in public directory
const backgroundImages = [
  '/hero/hero1.jpg',
  '/hero/hero2.jpg',
  '/hero/hero3.jpg',
];

function Home() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === backgroundImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box>
      {/* Hero Section */}
      <Box 
        sx={{ 
          position: 'relative',
          height: '70vh',
          width: '100%',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(27, 94, 32, 0.7)',
            zIndex: 1,
          },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${backgroundImages[currentImageIndex]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transition: 'opacity 1s ease-in-out',
          }}
        />
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
            zIndex: 2,
          }}
        >
          <Typography 
            variant="h1" 
            sx={{ 
              color: 'white', 
              mb: 2,
              textAlign: 'center',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
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
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
            }}
          >
            Your one-stop destination for premium fishing equipment, quality animal feed, and beautiful plants
          </Typography>
        </Container>
      </Box>

      {/* Categories Section */}
      <Box sx={{ py: 8, px: { xs: 2, sm: 4, md: 6, lg: 8 } }}>
        <Typography variant="h2" sx={{ mb: 4 }}>
          Our Categories
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3, height: '100%', transition: '0.3s', '&:hover': { transform: 'translateY(-4px)' } }}>
              <Typography variant="h3" sx={{ mb: 2 }}>
                Fishing Equipment
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Discover our wide range of high-quality fishing gear for both beginners and professionals.
              </Typography>
              <Button variant="outlined" color="primary">
                View Equipment
              </Button>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3, height: '100%', transition: '0.3s', '&:hover': { transform: 'translateY(-4px)' } }}>
              <Typography variant="h3" sx={{ mb: 2 }}>
                Animal Feed
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Premium nutrition for your pets and livestock, carefully selected for their well-being.
              </Typography>
              <Button variant="outlined" color="primary">
                View Feed
              </Button>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3, height: '100%', transition: '0.3s', '&:hover': { transform: 'translateY(-4px)' } }}>
              <Typography variant="h3" sx={{ mb: 2 }}>
                Plants
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Beautiful and healthy plants to bring life to your garden and home.
              </Typography>
              <Button variant="outlined" color="primary">
                View Plants
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Featured Section */}
      <Box sx={{ bgcolor: 'secondary.light', py: 8 }}>
        <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4, md: 6, lg: 8 } }}>
          <Typography variant="h2" sx={{ mb: 4 }}>
            Why Choose Us?
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ mb: 2 }}>Expert Advice</Typography>
              <Typography>Get professional guidance from our experienced team members.</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ mb: 2 }}>Quality Products</Typography>
              <Typography>We carefully select each product to ensure the highest quality.</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ mb: 2 }}>Great Value</Typography>
              <Typography>Competitive prices without compromising on quality.</Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}

export default Home; 