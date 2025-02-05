import { useEffect } from 'react';
import { Box, Grid, Paper, Typography, Container, AppBar, Toolbar, Button, Divider, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CollectionsIcon from '@mui/icons-material/Collections';
import ArticleIcon from '@mui/icons-material/Article';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ImageIcon from '@mui/icons-material/Image';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import SessionTimer from '../../components/session/SessionTimer';
import { setupActivityTracking, cleanupActivityTracking } from '../../utils/session';

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    setupActivityTracking();
    return () => cleanupActivityTracking();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/admin/login');
  };

  // Mock statistics - these would come from your API in a real application
  const stats = {
    totalImages: 24,
    newImages: 5,
    totalNews: 12,
    draftNews: 3,
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
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Welcome Section */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h4" gutterBottom color="primary">
            Welcome to Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your gallery images and news posts from this central dashboard.
          </Typography>
        </Paper>

        {/* Statistics Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <ImageIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="primary">{stats.totalImages}</Typography>
              <Typography variant="body2" color="text.secondary">Total Images</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <CollectionsIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="primary">{stats.newImages}</Typography>
              <Typography variant="body2" color="text.secondary">New Images</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <NewspaperIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="primary">{stats.totalNews}</Typography>
              <Typography variant="body2" color="text.secondary">Total News</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <ArticleIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="primary">{stats.draftNews}</Typography>
              <Typography variant="body2" color="text.secondary">Draft News</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Quick Actions
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
                Gallery Management
              </Typography>
              <Divider sx={{ my: 2, width: '60%', borderColor: 'rgba(255,255,255,0.2)' }} />
              <Typography variant="body1" align="center">
                Upload, edit, and manage gallery images
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                {stats.totalImages} images in gallery
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
                News Management
              </Typography>
              <Divider sx={{ my: 2, width: '60%', borderColor: 'rgba(255,255,255,0.2)' }} />
              <Typography variant="body1" align="center">
                Create, edit, and publish news articles
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                {stats.draftNews} drafts pending
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard; 