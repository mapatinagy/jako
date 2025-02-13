import { useEffect, useState } from 'react';
import { Box, Grid, Paper, Typography, Container, AppBar, Toolbar, Button, Divider, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CollectionsIcon from '@mui/icons-material/Collections';
import ArticleIcon from '@mui/icons-material/Article';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ImageIcon from '@mui/icons-material/Image';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import SettingsIcon from '@mui/icons-material/Settings';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import SessionTimer from '../../components/session/SessionTimer';
import { setupActivityTracking, cleanupActivityTracking } from '../../utils/session';
import { Helmet } from 'react-helmet-async';
import Header from '../../components/layout/Header';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalImages: 0,
    totalSeasonalProducts: 0,
    totalNews: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setupActivityTracking();
    fetchStats();
    return () => cleanupActivityTracking();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Fetch all stats in parallel
      const [galleryResponse, newsResponse, seasonalResponse] = await Promise.all([
        fetch('http://localhost:3000/api/gallery/images', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:3000/api/news/posts', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:3000/api/seasonal', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const [galleryData, newsData, seasonalData] = await Promise.all([
        galleryResponse.json(),
        newsResponse.json(),
        seasonalResponse.json()
      ]);

      setStats({
        totalImages: galleryData.images.length,
        totalSeasonalProducts: seasonalData.products.length,
        totalNews: newsData.posts.length,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/admin/login');
  };

  return (
    <Box>
      <Header />
      <Helmet>
        <title>Vezérlőpult | Admin Panel</title>
      </Helmet>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Welcome Section */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h4" gutterBottom color="primary">
            Üdvözöllek az Admin irányítópulton!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Kezeld a galériád képeit és a híreket ebből a központi irányítópultból.
          </Typography>
        </Paper>

        {/* Statistics Section */}
        <Grid container spacing={3} sx={{ mb: 4, justifyContent: 'center' }}>
          {/* News Counter */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <NewspaperIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="primary">
                {isLoading ? '...' : stats.totalNews}
              </Typography>
              <Typography variant="body2" color="text.secondary">Összes poszt</Typography>
            </Paper>
          </Grid>

          {/* Gallery Counter */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <ImageIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="primary">
                {isLoading ? '...' : stats.totalImages}
              </Typography>
              <Typography variant="body2" color="text.secondary">Összes feltöltött kép</Typography>
            </Paper>
          </Grid>

          {/* Seasonal Products Counter */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <CollectionsIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="primary">
                {isLoading ? '...' : stats.totalSeasonalProducts}
              </Typography>
              <Typography variant="body2" color="text.secondary">Szezonális termékek száma</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Gyorsgombok
        </Typography>

        <Grid container spacing={4}>
          {/* News Management Card */}
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 4,
                height: '300px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'success.main',
                color: 'white',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: (theme) => `0 8px 24px ${theme.palette.success.main}40`,
                },
              }}
              onClick={() => navigate('/admin/news')}
            >
              <ArticleIcon sx={{ fontSize: 80, mb: 2 }} />
              <Typography variant="h5" component="h2" align="center">
                Újdonság-, posztkezelés
              </Typography>
              <Divider sx={{ my: 2, width: '60%', borderColor: 'rgba(255,255,255,0.2)' }} />
              <Typography variant="body1" align="center">
                Újdonság-, poszt létrehozása, szerkesztése és közzététele
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                {stats.totalNews} poszt összesen
              </Typography>
            </Paper>
          </Grid>

          {/* Gallery Management Card */}
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 4,
                height: '300px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: (theme) => `0 8px 24px ${theme.palette.primary.main}40`,
                },
              }}
              onClick={() => navigate('/admin/gallery')}
            >
              <CollectionsIcon sx={{ fontSize: 80, mb: 2 }} />
              <Typography variant="h5" component="h2" align="center">
                Galéria kezelés
              </Typography>
              <Divider sx={{ my: 2, width: '60%', borderColor: 'rgba(255,255,255,0.2)' }} />
              <Typography variant="body1" align="center">
                Feltöltés, szerkesztés és galéria képek kezelése
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                {stats.totalImages} kép összesen
              </Typography>
            </Paper>
          </Grid>

          {/* Seasonal Products Card */}
          <Grid item xs={12} md={6} sx={{ mx: 'auto' }}>
            <Paper
              sx={{
                p: 4,
                height: '300px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'success.main',
                color: 'white',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: (theme) => `0 8px 24px ${theme.palette.success.main}40`,
                },
              }}
              onClick={() => navigate('/admin/seasonal')}
            >
              <LocalOfferIcon sx={{ fontSize: 80, mb: 2 }} />
              <Typography variant="h5" component="h2" align="center">
                Szezonális termékek
              </Typography>
              <Divider sx={{ my: 2, width: '60%', borderColor: 'rgba(255,255,255,0.2)' }} />
              <Typography variant="body1" align="center">
                Szezonális termékek kezelése és megjelenítése
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                {stats.totalSeasonalProducts} termék összesen
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard; 