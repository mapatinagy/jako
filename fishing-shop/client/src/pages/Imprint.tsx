import { Box, Container, Typography, Paper, Grid, Divider } from '@mui/material';
import { Helmet } from 'react-helmet-async';

const Imprint = () => {
  return (
    <Box sx={{ py: 6, bgcolor: 'background.default' }}>
      <Helmet>
        <title>Imprint - Fishing Shop Legal Information</title>
        <meta name="description" content="Legal information and company details for our fishing shop. Find our business registration, contact details, and legal disclaimers." />
        <meta name="keywords" content="fishing shop imprint, legal information, company details, business registration" />
      </Helmet>

      <Container maxWidth="lg">
        {/* Header Section */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography 
            variant="h1" 
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
            Imprint
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto', mt: 3 }}>
            Legal information and company details
          </Typography>
        </Box>

        {/* Content Sections */}
        <Grid container spacing={4}>
          {/* Company Information */}
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 4,
                height: '100%',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)'
                }
              }}
            >
              <Typography variant="h3" color="primary" gutterBottom>
                Company Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Box sx={{ '& > *': { mb: 2 } }}>
                <Typography variant="h6">Fishing Shop Ltd.</Typography>
                <Typography variant="body1">
                  Hauptstraße 123<br />
                  20095 Hamburg<br />
                  Germany
                </Typography>
                <Typography variant="body1" sx={{ mt: 2 }}>
                  <strong>Registration Number:</strong> HRB 123456<br />
                  <strong>VAT ID:</strong> DE123456789<br />
                  <strong>Commercial Register:</strong> Hamburg District Court
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 4,
                height: '100%',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)'
                }
              }}
            >
              <Typography variant="h3" color="primary" gutterBottom>
                Contact Details
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Box sx={{ '& > *': { mb: 2 } }}>
                <Typography variant="body1">
                  <strong>Phone:</strong><br />
                  +49 (0) 123 456789
                </Typography>
                <Typography variant="body1">
                  <strong>Email:</strong><br />
                  info@fishing-shop.com
                </Typography>
                <Typography variant="body1">
                  <strong>Website:</strong><br />
                  www.fishing-shop.com
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Legal Disclaimers */}
          <Grid item xs={12}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 4,
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)'
                }
              }}
            >
              <Typography variant="h3" color="primary" gutterBottom>
                Legal Notice
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Typography variant="body1" paragraph>
                Despite careful content control, we assume no liability for the content of external links. The operators of the linked pages are solely responsible for their content.
              </Typography>
              <Typography variant="body1" paragraph>
                All content on this website is protected by copyright. Any use outside the narrow limits of copyright law without the consent of the respective rights holder is prohibited and punishable by law.
              </Typography>
              <Typography variant="body1">
                © {new Date().getFullYear()} Fishing Shop Ltd. All rights reserved.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Imprint; 