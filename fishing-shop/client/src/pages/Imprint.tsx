import { Box, Container, Typography, Paper, Grid, Divider } from '@mui/material';
import { Helmet } from 'react-helmet-async';

const Imprint = () => {
  return (
    <Box sx={{ py: 6, bgcolor: 'background.default' }}>
      <Helmet>
        <title>Impresszum - Jákó Díszállat és Horgász Szaküzlet</title>
        <meta name="description" content="Boltunk jogi és üzleti információi. Itt találja engedélyezési adatainkat, elérhetőségeinket és jogi nyilatkozatainkat." />
        <meta name="keywords" content="impresszum, jogi információk, horgászbolt impresszum, állateledel impresszum, dísznövénybolt impresszum" />
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
            Jogi információk és üzleti adatok
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
                Üzleti adatok
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Box sx={{ '& > *': { mb: 2 } }}>
                <Typography variant="h6">Bécsiné Hévizi Erika ev.</Typography>
                <Typography variant="body1">
                  5630 Békés<br />
                  Szánthó Albert utca 4.
                </Typography>
                <Typography variant="body1" sx={{ mt: 2 }}>
                  <strong>Adószám:</strong> 44640190-2-24<br />
                  <strong>Cégjegyzékszám:</strong> ES-092199<br />
                  <strong>Bejegyző hatóság:</strong> Békés Város Önkormányzat<br />
                  <strong>Tárhely szolgáltató:</strong> Datatronic Kereskedelmi és Szolgáltató Kft.
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
                Elérhetőségeink
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Box sx={{ '& > *': { mb: 2 } }}>
                <Typography variant="body1">
                  <strong>Telefonszám:</strong><br />
                  +36 30 471 7047
                </Typography>
                <Typography variant="body1">
                  <strong>Email:</strong><br />
                  info@jakobekes.hu
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
                Jogi nyilatkozat
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Typography variant="body1" paragraph>
                A gondos tartalomellenőrzés ellenére nem vállalunk felelősséget a külső hivatkozások tartalmáért. A hivatkozott oldalak üzemeltetői kizárólagos felelősséget vállalnak érte.
              </Typography>
              <Typography variant="body1" paragraph>
                A weboldalon található minden tartalom szerzői jogvédelem alatt áll. A szerzői jogi törvény szűk korlátain kívüli felhasználás az adott jogtulajdonos beleegyezése nélkül tilos és törvény által büntetendő.              </Typography>
              <Typography variant="body1">
                © {new Date().getFullYear()} Jákó Díszállat és Horgász Szaküzlet. Minden jog fenntartva.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Imprint; 