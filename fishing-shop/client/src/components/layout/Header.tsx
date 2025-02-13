import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Stack,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Collections as CollectionsIcon,
  Article as ArticleIcon,
  LocalOffer as LocalOfferIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import SessionTimer from '../session/SessionTimer';

const Header = () => {
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/admin/login');
  };

  const menuItems = [
    { text: 'Vezérlőpult', icon: <DashboardIcon />, path: '/admin/dashboard' },
    { text: 'Galéria', icon: <CollectionsIcon />, path: '/admin/gallery' },
    { text: 'Hírek', icon: <ArticleIcon />, path: '/admin/news' },
    { text: 'Szezonális termékek', icon: <LocalOfferIcon />, path: '/admin/seasonal' },
    { text: 'Beállítások', icon: <SettingsIcon />, path: '/admin/settings' },
  ];

  return (
    <AppBar position="static" sx={{ backgroundColor: 'primary.main' }}>
      <Toolbar sx={{ px: { xs: 2, sm: 4, md: 6, lg: 8 } }}>
        {/* Mobile Menu */}
        {isMobile && (
          <>
            <IconButton
              color="inherit"
              onClick={(e) => setMobileMenuAnchor(e.currentTarget)}
              edge="start"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={mobileMenuAnchor}
              open={Boolean(mobileMenuAnchor)}
              onClose={() => setMobileMenuAnchor(null)}
            >
              {menuItems.map((item) => (
                <MenuItem
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuAnchor(null);
                  }}
                  sx={{
                    color: location.pathname === item.path ? 'primary.main' : 'inherit',
                    gap: 1.5,
                    minWidth: 200
                  }}
                >
                  {item.icon}
                  {item.text}
                </MenuItem>
              ))}
            </Menu>
          </>
        )}

        {/* Desktop Navigation */}
        <Stack 
          direction="row" 
          alignItems="center" 
          spacing={1} 
          sx={{ 
            cursor: 'pointer',
            display: { xs: 'none', md: 'flex' },
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
              fontSize: { xs: 24, sm: 32 },
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
            Vezérlőpult
          </Typography>
        </Stack>

        {/* Desktop Menu Items */}
        {!isMobile && (
          <Stack direction="row" spacing={2} sx={{ ml: 4 }}>
            {menuItems.slice(1, 4).map((item) => (
              <Button
                key={item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  color: 'white',
                  opacity: location.pathname === item.path ? 1 : 0.7,
                  '&:hover': { opacity: 1 }
                }}
                startIcon={item.icon}
              >
                {item.text}
              </Button>
            ))}
          </Stack>
        )}

        <Box sx={{ flexGrow: 1 }} />

        {/* Right Side Items */}
        {isMobile ? (
          <>
            {/* Mobile layout */}
            <Box sx={{ 
              position: 'absolute', 
              left: '50%', 
              transform: 'translateX(-50%)'
            }}>
              <SessionTimer />
            </Box>
            <Box sx={{ ml: 'auto' }}>
              <Button
                onClick={handleLogout}
                startIcon={<LogoutIcon />}
                sx={{
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              />
            </Box>
          </>
        ) : (
          // Desktop layout - unchanged
          <Stack direction="row" spacing={1} alignItems="center">
            <SessionTimer />
            <Button
              onClick={() => navigate('/admin/settings')}
              startIcon={<SettingsIcon />}
              sx={{
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              Beállítások
            </Button>
            <Button
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
              sx={{
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              Kijelentkezés
            </Button>
          </Stack>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header; 