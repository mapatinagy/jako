import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Dialog,
  DialogContent,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';

interface SeasonalProduct {
  id: number;
  title: string;
  content: string;
  image_path: string | null;
  is_active: boolean;
  created_at: string;
}

const Seasonal = () => {
  const [products, setProducts] = useState<SeasonalProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/seasonal');
        const data = await response.json();
        
        // Only show active products
        const activeProducts = data.products.filter((product: SeasonalProduct) => product.is_active);
        setProducts(activeProducts);
      } catch (error) {
        console.error('Error fetching seasonal products:', error);
        setError('Hiba történt a termékek betöltése során');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Helmet>
        <title>Szezonális Termékek | Jákó Díszállat és Horgász Szaküzlet</title>
        <meta name="description" content="Fedezze fel szezonális termékeinket! Időszakos és limitált kínálatunk díszállat és horgász felszerelésekből. Látogasson el békési szaküzletünkbe!" />
        <meta name="keywords" content="szezonális termékek, díszállat, horgászat, Békés, aktuális kínálat, időszakos termékek, horgász felszerelés, díszállat kellékek" />
        <meta property="og:title" content="Szezonális Termékek | Jákó Díszállat és Horgász Szaküzlet" />
        <meta property="og:description" content="Fedezze fel szezonális termékeinket! Időszakos és limitált kínálatunk díszállat és horgász felszerelésekből." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://jakobekes.com/seasonal" />
      </Helmet>

      <Container maxWidth="xl" sx={{ py: { xs: 4, sm: 6, md: 8 } }}>
        {/* Hero Section */}
        <Box sx={{ mb: { xs: 4, sm: 6 }, textAlign: 'center' }}>
          <Typography 
            variant="h2" 
            component="h1" 
            align="center"
            sx={{ 
              mb: 2,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              fontWeight: 600,
              position: 'relative',
              display: 'inline-block',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -8,
                left: 0,
                width: '100%',
                height: 3,
                bgcolor: 'primary.main',
                borderRadius: 1
              }
            }}
          >
            Szezonális Termékek
          </Typography>
          <Typography 
            variant="h6" 
            align="center" 
            color="text.secondary"
            sx={{ 
              maxWidth: '800px', 
              mx: 'auto',
              mb: 4,
              mt: 3
            }}
          >
            Fedezze fel aktuális szezonális kínálatunkat! Ezek a termékek limitált ideig elérhetőek üzletünkben.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {/* Products Grid */}
        <Grid container spacing={1}>
          {products.map((product) => (
            <Grid item xs={6} sm={6} md={4} lg={3} key={product.id}>
              <Paper
                elevation={2}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)'
                  }
                }}
              >
                {product.image_path && (
                  <Box
                    sx={{
                      position: 'relative',
                      paddingTop: '60%',
                      cursor: 'pointer',
                      overflow: 'hidden'
                    }}
                    onClick={() => setSelectedImage(`http://localhost:3000${product.image_path}`)}
                  >
                    <img
                      src={`http://localhost:3000${product.image_path}`}
                      alt={product.title}
                      style={{
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
                )}

                <Box sx={{ 
                  p: { xs: 1, sm: 1.5 }, 
                  display: 'flex', 
                  flexDirection: 'column' 
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 0.25
                  }}>
                    <Typography
                      variant="h5"
                      component="h2"
                      sx={{
                        fontSize: { xs: '0.85rem', sm: '1rem' },
                        fontWeight: 600,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        flex: 1,
                        pr: 1,
                        lineHeight: 1.2
                      }}
                    >
                      {product.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ 
                        fontSize: { xs: '0.6rem', sm: '0.7rem' },
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {new Date(product.created_at).toLocaleDateString('hu-HU')}
                    </Typography>
                  </Box>
                  
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      lineHeight: 1.4,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      fontSize: { xs: '0.75rem', sm: '0.85rem' }
                    }}
                  >
                    {product.content}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Image Modal */}
        <Dialog
          open={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          maxWidth="lg"
          fullWidth
        >
          <DialogContent sx={{ p: 0, position: 'relative' }}>
            <IconButton
              onClick={() => setSelectedImage(null)}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: 'white',
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.7)'
                }
              }}
            >
              <CloseIcon />
            </IconButton>
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Full size"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block'
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </Container>
    </>
  );
};

export default Seasonal; 