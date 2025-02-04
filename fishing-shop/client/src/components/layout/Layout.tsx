import { Outlet, Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Container, Box, Button, Typography } from '@mui/material';

function Layout() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Container maxWidth="lg">
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button color="inherit" component={RouterLink} to="/">Home</Button>
              <Button color="inherit" component={RouterLink} to="/gallery">Gallery</Button>
              <Button color="inherit" component={RouterLink} to="/news">News</Button>
              <Button color="inherit" component={RouterLink} to="/contact">Contact</Button>
              <Button color="inherit" component={RouterLink} to="/imprint">Imprint</Button>
            </Box>
          </Container>
        </Toolbar>
      </AppBar>

      <Container component="main" sx={{ flexGrow: 1, py: 4 }} maxWidth="lg">
        <Outlet />
      </Container>

      <Box component="footer" sx={{ bgcolor: 'primary.dark', color: 'white', py: 3, mt: 'auto' }}>
        <Container maxWidth="lg">
          <Typography align="center">
            © {new Date().getFullYear()} Fishing Shop. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

export default Layout; 