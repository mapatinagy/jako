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

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalImages: 0,
    newImages: 0,
    totalNews: 0,
    draftNews: 0
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

      // Fetch gallery stats
      const galleryResponse = await fetch('http://localhost:3000/api/gallery/images', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const galleryData = await galleryResponse.json();
      
      // Fetch news stats
      const newsResponse = await fetch('http://localhost:3000/api/news/posts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const newsData = await newsResponse.json();

      // Calculate stats
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const newImagesCount = galleryData.images.filter((image: any) => 
        new Date(image.created_at) > sevenDaysAgo
      ).length;

      const draftPostsCount = newsData.posts.filter((post: any) => 
        !post.is_published
      ).length;

      setStats({
        totalImages: galleryData.images.length,
        newImages: newImagesCount,
        totalNews: newsData.posts.length,
        draftNews: draftPostsCount
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
            onClick={() => navigate('/admin/settings')}
            startIcon={<SettingsIcon sx={{ fontSize: 28 }} />}
            sx={{
              ml: 2,
              color: 'white',
              fontSize: '1.2rem',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Beállítások
          </Button>
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
            Kijelentkezés
          </Button>
        </Toolbar>
      </AppBar>

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
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <ImageIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="primary">
                {isLoading ? '...' : stats.totalImages}
              </Typography>
              <Typography variant="body2" color="text.secondary">Összes feltöltött kép</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <CollectionsIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="primary">
                {isLoading ? '...' : stats.newImages}
              </Typography>
              <Typography variant="body2" color="text.secondary">Új képek (utolsó 7 nap)</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <NewspaperIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="primary">
                {isLoading ? '...' : stats.totalNews}
              </Typography>
              <Typography variant="body2" color="text.secondary">Összes poszt</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <ArticleIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="primary">
                {isLoading ? '...' : stats.draftNews}
              </Typography>
              <Typography variant="body2" color="text.secondary">Vázlatok száma</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Gyorsgombok
        </Typography>

        <Grid container spacing={4}>
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
                {stats.totalImages} kép a galériában
              </Typography>
            </Paper>
          </Grid>

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
                backgroundColor: 'secondary.main',
                color: 'white',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: (theme) => `0 8px 24px ${theme.palette.secondary.main}40`,
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
                {stats.draftNews} vázlat függőben
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
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard; 