import { AppBar, Box, Container, Toolbar, Typography, Button, IconButton, Stack, Grid, Menu, MenuItem, useTheme, useMediaQuery } from '@mui/material';
import { Link as RouterLink, Outlet } from 'react-router-dom';
import { useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

export default function Layout() {
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleOpenMobileMenu = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleCloseMobileMenu = () => {
    setMobileMenuAnchor(null);
  };

  const menuItems = [
    { text: 'Galéria', path: '/gallery' },
    { text: 'Újdonságok', path: '/news' },
    { text: 'Kapcsolat', path: '/contact' }
  ];

  const footerMenuItems = [
    ...menuItems,
    { text: 'Impresszum', path: '/imprint' }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky">
        <Toolbar sx={{ px: { xs: 2, sm: 4, md: 6, lg: 8 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Box 
              component="img"
              src="/logo.png"
              alt="Logo"
              sx={{ 
                height: 50,
                width: 'auto',
                mr: 2,
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)'
                }
              }}
            />
            <Typography
              variant="h6"
              component={RouterLink}
              to="/"
              sx={{
                textDecoration: 'none',
                color: 'inherit',
                fontWeight: 500,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                },
                display: 'inline-block'
              }}
            >
              Jákó Díszállat és Horgász Szaküzlet
            </Typography>
          </Box>
          
          {isMobile ? (
            <>
              <IconButton
                size="large"
                color="inherit"
                onClick={handleOpenMobileMenu}
                sx={{
                  transition: 'transform 0.3s ease',
                  transform: mobileMenuAnchor ? 'rotate(180deg)' : 'none'
                }}
              >
                {mobileMenuAnchor ? <CloseIcon /> : <MenuIcon />}
              </IconButton>
              <Menu
                anchorEl={mobileMenuAnchor}
                open={Boolean(mobileMenuAnchor)}
                onClose={handleCloseMobileMenu}
                sx={{
                  '& .MuiPaper-root': {
                    width: '100%',
                    maxWidth: '100%',
                    left: '0 !important',
                    right: '0',
                    mt: 0,
                    background: 'primary.dark',
                  },
                  '& .MuiList-root': {
                    py: 1,
                  }
                }}
                TransitionProps={{
                  timeout: 300,
                }}
              >
                {menuItems.map((item) => (
                  <MenuItem 
                    key={item.path}
                    onClick={handleCloseMobileMenu}
                    component={RouterLink}
                    to={item.path}
                    sx={{
                      py: 1.5,
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    {item.text}
                  </MenuItem>
                ))}
              </Menu>
            </>
          ) : (
            <Stack direction="row" spacing={2}>
              {menuItems.map((item) => (
                <Button
                  key={item.path}
                  component={RouterLink}
                  to={item.path}
                  color="inherit"
                  sx={{
                    fontSize: '1.2rem',
                    py: 1,
                    px: 2,
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      height: '2px',
                      backgroundColor: 'white',
                      transform: 'translateX(-100%)',
                      transition: 'transform 0.3s ease'
                    },
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      '&::after': {
                        transform: 'translateX(0)'
                      }
                    }
                  }}
                >
                  {item.text}
                </Button>
              ))}
            </Stack>
          )}
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>

      <Box 
        component="footer" 
        sx={{ 
          bgcolor: 'primary.dark',
          color: 'white',
          py: 6,
          mt: 'auto'
        }}
      >
        <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4, md: 6, lg: 8 } }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={3}>
              <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                Kapcsolat
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, textAlign: 'center' }}>
                5630 Békés
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, textAlign: 'center' }}>
                Szánthó Albert utca 4.
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, textAlign: 'center' }}>
                Tel.: +30 471 7047
              </Typography>
              <Typography variant="body2" sx={{ textAlign: 'center' }}>
                Email: info@jakobekes.com
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                Nyitvatartás
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, textAlign: 'center' }}>
                Hétfő - Péntek: 8:00 - 17:30
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, textAlign: 'center' }}>
                Szombat: 8:00 - 12:00
              </Typography>
              <Typography variant="body2" sx={{ textAlign: 'center' }}>
                Vasárnap: 8:00 - 11:00
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                Gyorslinkek
              </Typography>
              <Stack spacing={1} alignItems="center">
                {footerMenuItems.map((item) => (
                  <Typography
                    key={item.path}
                    component={RouterLink}
                    to={item.path}
                    variant="body2"
                    sx={{
                      mb: 1,
                      textAlign: 'center',
                      color: 'white',
                      textDecoration: 'none',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    {item.text}
                  </Typography>
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                Follow Us
              </Typography>
              <Stack direction="row" spacing={2} justifyContent="center">
                <IconButton color="inherit" size="small">
                  <Box 
                    component="img"
                    src="/social/facebook.png"
                    alt="Facebook"
                    sx={{ width: 24, height: 24 }}
                  />
                </IconButton>
                <IconButton color="inherit" size="small">
                  <Box 
                    component="img"
                    src="/social/instagram.png"
                    alt="Instagram"
                    sx={{ width: 24, height: 24 }}
                  />
                </IconButton>
                <IconButton color="inherit" size="small">
                  <Box 
                    component="img"
                    src="/social/twitter.png"
                    alt="Twitter"
                    sx={{ width: 24, height: 24 }}
                  />
                </IconButton>
              </Stack>
            </Grid>
          </Grid>
          <Typography 
            variant="body2" 
            sx={{ 
              mt: 4, 
              pt: 2, 
              borderTop: '1px solid rgba(255,255,255,0.1)',
              textAlign: 'center' 
            }}
          >
            © 2025 Jákó Díszállat és Horgász Szaküzlet. Minden jog fenntartva.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
} 