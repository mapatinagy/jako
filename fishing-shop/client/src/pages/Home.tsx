import { Box, Container, Typography, Grid, Paper, Button, Card, CardContent, CardMedia, Dialog, DialogContent, IconButton, useTheme, useMediaQuery } from '@mui/material';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import CloseIcon from '@mui/icons-material/Close';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

// Images from the hero folder in public directory
const backgroundImages = [
  '/hero/hero1.jpg',
  '/hero/hero2.jpg',
  '/hero/hero3.jpg',
  '/hero/hero4.jpg',
  '/hero/hero5.jpg',
  '/hero/hero6.jpg',
  '/hero/hero7.jpg',
  '/hero/hero8.jpg',
  '/hero/hero9.jpg',
  '/hero/hero10.jpg',
  '/hero/hero11.jpg',
  '/hero/hero12.jpg',
];

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedImage, setDisplayedImage] = useState(backgroundImages[0]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [latestNews, setLatestNews] = useState<any[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [selectedImage, setSelectedImage] = useState<{ url: string; postImages: string[]; currentIndex: number } | null>(null);
  const [openLightbox, setOpenLightbox] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % backgroundImages.length;
      setCurrentIndex(nextIndex);
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setDisplayedImage(backgroundImages[currentIndex]);
      setIsTransitioning(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [currentIndex]);

  useEffect(() => {
    fetchLatestNews();
  }, []);

  const fetchLatestNews = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/news/posts');
      const data = await response.json();
      
      if (data.success) {
        // Filter published posts and take the latest 3
        const publishedPosts = data.posts
          .filter((post: any) => post.is_published)
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 3)
          .map((post: any) => {
            console.log('Raw featured_image:', post.featured_image);
            const processedImage = Array.isArray(post.featured_image) ? post.featured_image : 
              (post.featured_image ? JSON.parse(post.featured_image) : []);
            console.log('Processed featured_image:', processedImage);
            return {
              ...post,
              featured_image: processedImage
            };
          });
        
        console.log('Processed news posts:', publishedPosts);
        setLatestNews(publishedPosts);
      }
    } catch (error) {
      console.error('Error fetching latest news:', error);
    } finally {
      setLoadingNews(false);
    }
  };

  const handleImageClick = (e: React.MouseEvent, postImages: string[], imageIndex: number) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (postImages && postImages.length > 0) {
      const url = postImages[imageIndex];
      const formattedUrl = url.startsWith('http') ? url : `http://localhost:3000${url}`;
      const formattedImages = postImages.map(img => 
        img.startsWith('http') ? img : `http://localhost:3000${img}`
      );
      
      setSelectedImage({
        url: formattedUrl,
        postImages: formattedImages,
        currentIndex: imageIndex
      });
      setOpenLightbox(true);
    }
  };

  const handleCloseLightbox = () => {
    setOpenLightbox(false);
    setSelectedImage(null);
  };

  const handlePrevImage = () => {
    if (selectedImage) {
      const newIndex = (selectedImage.currentIndex - 1 + selectedImage.postImages.length) % selectedImage.postImages.length;
      setSelectedImage({
        ...selectedImage,
        url: selectedImage.postImages[newIndex],
        currentIndex: newIndex
      });
    }
  };

  const handleNextImage = () => {
    if (selectedImage) {
      const newIndex = (selectedImage.currentIndex + 1) % selectedImage.postImages.length;
      setSelectedImage({
        ...selectedImage,
        url: selectedImage.postImages[newIndex],
        currentIndex: newIndex
      });
    }
  };

  return (
    <Box>
      <Helmet>
        <title>Jákó Díszállat és Horgászbolt - Profi horgászfelszerelés, állateledel és dísznövények egy helyen</title>
        <meta name="description" content="Profi horgászfelszerelés, minőségi állateledel és gyönyörű növények. Több mint 30 év tapasztalat a közösség szolgálatában." />
        <meta name="keywords" content="horgászfelszerelés, állateledel, dísznövények, horgászbolt, díszállat" />
      </Helmet>
      {/* Hero Section */}
      <Box 
        sx={{ 
          position: 'relative',
          height: '50vh',
          width: '100%',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(27, 94, 32, 0.4)',
            zIndex: 2,
          },
        }}
      >
        {/* Current Image */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${displayedImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0,
          }}
        />
        {/* Next Image */}
        {isTransitioning && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url(${backgroundImages[currentIndex]})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0,
              animation: 'fadeIn 1.5s forwards',
              zIndex: 1,
              '@keyframes fadeIn': {
                '0%': {
                  opacity: 0,
                },
                '100%': {
                  opacity: 1,
                },
              },
            }}
          />
        )}
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
            zIndex: 3,
          }}
        >
          <Typography 
            variant="h1" 
            sx={{ 
              color: 'white', 
              mb: 2,
              textAlign: 'center',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              animation: 'fadeInDown 1s ease-out',
              '@keyframes fadeInDown': {
                '0%': {
                  opacity: 0,
                  transform: 'translateY(-20px)'
                },
                '100%': {
                  opacity: 1,
                  transform: 'translateY(0)'
                }
              }
            }}
          >
            Jákó Díszállat és Horgászbolt
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              color: 'white', 
              mb: 4,
              maxWidth: 800,
              textAlign: 'center',
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
              animation: 'fadeInUp 1s ease-out 0.5s',
              opacity: 0,
              animationFillMode: 'forwards',
              '@keyframes fadeInUp': {
                '0%': {
                  opacity: 0,
                  transform: 'translateY(20px)'
                },
                '100%': {
                  opacity: 1,
                  transform: 'translateY(0)'
                }
              }
            }}
          >
            Profi horgászfelszerelés, állateledel és dísznövények egy helyen
          </Typography>
        </Container>
      </Box>

      {/* About Us Section */}
      <Box sx={{ 
        py: 8, 
        px: { xs: 2, sm: 4, md: 6, lg: 8 },
        bgcolor: 'background.paper',
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80%',
          height: '1px',
          bgcolor: 'primary.light',
          opacity: 0.3,
        }
      }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h2" sx={{ mb: 3 }}>
              Rólunk
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary', lineHeight: 1.8 }}>
              Több mint 30 év tapasztalatunkkal, már elmondhatjuk, hogy nem csak egy bolt vagyunk – mi egy közösség vagyunk a horgászok, állat- és növénybarátok számára. A kezdetünk egy egyszerű elképzelésből indult: minőségi termékeket és szakértő tanácsot adni a vásárlóinknak.
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', lineHeight: 1.8 }}>
              Büszkék vagyunk személyre szabott szolgáltatásainkra és gondosan válogatott termékválasztékunkra. Legyen szó tapasztalt horgászról, elkötelezett kisállattartóról vagy lelkes kertészről, hozzáértő csapatunk készen áll, hogy segítsen a siker elérésében.
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              gap: 3,
              justifyContent: { xs: 'center', md: 'flex-start' }
            }}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  bgcolor: 'primary.main',
                  color: 'white',
                  borderRadius: 2,
                  textAlign: 'center',
                  minWidth: 120,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 20px rgba(0,0,0,0.2)'
                  }
                }}
              >
                <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
                  30+
                </Typography>
                <Typography variant="body2">
                  Év tapasztalat
                </Typography>
              </Paper>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  bgcolor: 'secondary.main',
                  color: 'white',
                  borderRadius: 2,
                  textAlign: 'center',
                  minWidth: 120,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 20px rgba(0,0,0,0.2)'
                  }
                }}
              >
                <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
                  50000+
                </Typography>
                <Typography variant="body2">
                  Elégedett vevő
                </Typography>
              </Paper>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                width: '100%',
                maxWidth: '720px',
                margin: '0 auto',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.02)',
                }
              }}
            >
              <img 
                src="/about/front.png" 
                alt="Our Store Front"
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '8px',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
                  transition: 'all 0.3s ease',
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Categories Section */}
      <Box sx={{ py: 4, px: { xs: 2, sm: 4, md: 6, lg: 8 } }}>
        <Typography variant="h2" sx={{ mb: 4 }}>
          Termékeink
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ 
              p: 3, 
              height: '100%', 
              transition: '0.3s', 
              position: 'relative',
              backgroundImage: 'url(/services/fishing.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              '&:hover': { transform: 'translateY(-4px)' },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                zIndex: 1
              }
            }}>
              <Box sx={{ position: 'relative', zIndex: 2 }}>
                <Typography variant="h3" sx={{ mb: 2, color: 'white' }}>
                  Horgászfelszerelés
                </Typography>
                <Typography sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.9)' }}>
                  Fedezd fel széles választékunkat kiváló minőségű horgászfelszerelésekből, kezdők és profi horgászok számára egyaránt.
                </Typography>
                <Box component="ul" sx={{ 
                  pl: 2,
                  '& li': { 
                    color: 'rgba(255, 255, 255, 0.9)',
                    mb: 1,
                    '&:last-child': { mb: 0 }
                  }
                }}>
                  <li>Horgászbotok és orsók</li>
                  <li>Csalik</li>
                  <li>Damilok és horgok</li>
                  <li>Szerszámok és kiegészítők</li>
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ 
              p: 3, 
              height: '100%', 
              transition: '0.3s', 
              position: 'relative',
              backgroundImage: 'url(/services/petfood.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              '&:hover': { transform: 'translateY(-4px)' },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                zIndex: 1
              }
            }}>
              <Box sx={{ position: 'relative', zIndex: 2 }}>
                <Typography variant="h3" sx={{ mb: 2, color: 'white' }}>
                  Állateledel
                </Typography>
                <Typography sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.9)' }}>
                  Prémium minőségű állateledel kedvencei számára, gondosan válogatott összetevőkkel az optimális egészség és jólét érdekében.
                </Typography>
                <Box component="ul" sx={{ 
                  pl: 2,
                  '& li': { 
                    color: 'rgba(255, 255, 255, 0.9)',
                    mb: 1,
                    '&:last-child': { mb: 0 }
                  }
                }}>
                  <li>Kutya- és macskaeledel</li>
                  <li>Madáreleség</li>
                  <li>Haleleség</li>
                  <li>Egyéb díszállat eledelek</li>
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ 
              p: 3, 
              height: '100%', 
              transition: '0.3s', 
              position: 'relative',
              backgroundImage: 'url(/services/plants.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              '&:hover': { transform: 'translateY(-4px)' },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                zIndex: 1
              }
            }}>
              <Box sx={{ position: 'relative', zIndex: 2 }}>
                <Typography variant="h3" sx={{ mb: 2, color: 'white' }}>
                  Növények
                </Typography>
                <Typography sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.9)' }}>
                  Gyönyörű és egészséges növények otthona és kertje természetes harmóniájának megteremtéséhez.
                </Typography>
                <Box component="ul" sx={{ 
                  pl: 2,
                  '& li': { 
                    color: 'rgba(255, 255, 255, 0.9)',
                    mb: 1,
                    '&:last-child': { mb: 0 }
                  }
                }}>
                  <li>Benti növények</li>
                  <li>Kert növények</li>
                  <li>Magvak</li>
                  <li>Növénygondozási termékek</li>
                 </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Latest News Section */}
      <Box sx={{ pt: 2, pb: 8 }}>
        <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4, md: 6, lg: 8 } }}>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h2" gutterBottom>
              Legfrissebb újdonságaink
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Grid container spacing={3}>
              {loadingNews ? (
                // Loading skeletons
                Array.from(new Array(3)).map((_, index) => (
                  <Grid item xs={12} sm={6} lg={4} key={index}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                      <Box sx={{ pt: '60%', bgcolor: 'grey.200', mb: 2 }} />
                      <Box sx={{ height: 24, bgcolor: 'grey.200', mb: 1, width: '80%' }} />
                      <Box sx={{ height: 20, bgcolor: 'grey.200', width: '40%' }} />
                    </Paper>
                  </Grid>
                ))
              ) : (
                latestNews.map((post) => (
                  <Grid item xs={12} sm={6} lg={4} key={post.id}>
                    <Card 
                      onClick={() => navigate(`/news/${post.id}`)}
                      sx={{ 
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.3s ease',
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'translateY(-4px)'
                        }
                      }}
                    >
                      <Box sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Typography variant="h6" sx={{ flexGrow: 1 }}>
                            {post.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 2, whiteSpace: 'nowrap' }}>
                            {format(new Date(post.created_at), 'yyyy-MM-dd')}
                          </Typography>
                        </Box>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {post.content.length > 200 
                            ? `${post.content.replace(/<a\s+(?:[^>]*?\s+)?href="([^"]*)"([^>]*)>/g, (match: string, href: string) => {
                                const url = href.startsWith('http://') || href.startsWith('https://') ? href : `https://${href}`;
                                return `<a href="${url}"${match.slice(match.indexOf('"', match.indexOf('href') + 6) + 1)}>`
                              }).replace(/<[^>]*>/g, '').substring(0, 200)}...` 
                            : post.content.replace(/<a\s+(?:[^>]*?\s+)?href="([^"]*)"([^>]*)>/g, (match: string, href: string) => {
                                const url = href.startsWith('http://') || href.startsWith('https://') ? href : `https://${href}`;
                                return `<a href="${url}"${match.slice(match.indexOf('"', match.indexOf('href') + 6) + 1)}>`
                              }).replace(/<[^>]*>/g, '')}
                        </Typography>

                        <Box sx={{ mt: 'auto' }}>
                          {post.featured_image ? (
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'nowrap', overflowX: 'auto' }}>
                              {post.featured_image.slice(0, 3).map((image: string, index: number) => (
                                <Box
                                  key={index}
                                  sx={{
                                    position: 'relative',
                                    width: index === 2 && post.featured_image.length > 3 ? '33.33%' : '33.33%',
                                    pt: '25%',
                                    flexShrink: 0
                                  }}
                                >
                                  <Box
                                    component="img"
                                    src={`http://localhost:3000${image}`}
                                    alt={`News image ${index + 1}`}
                                    sx={{
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover',
                                      borderRadius: 1
                                    }}
                                  />
                                  {index === 2 && post.featured_image.length > 3 && (
                                    <Box
                                      sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        bgcolor: 'rgba(0,0,0,0.5)',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: 1
                                      }}
                                    >
                                      <Typography variant="h6">+{post.featured_image.length - 3}</Typography>
                                    </Box>
                                  )}
                                </Box>
                              ))}
                            </Box>
                          ) : (
                            <Box
                              sx={{
                                width: '100%',
                                pt: '56.25%',
                                bgcolor: 'grey.200',
                                borderRadius: 1,
                                position: 'relative'
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              onClick={() => navigate('/news')}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Összes újdonság megtekintése
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Lightbox Dialog */}
      <Dialog
        fullScreen={fullScreen}
        maxWidth="lg"
        open={openLightbox}
        onClose={handleCloseLightbox}
        onClick={handleCloseLightbox}
        sx={{
          '& .MuiDialog-paper': {
            bgcolor: 'transparent',
            backgroundImage: 'none',
            boxShadow: 'none',
            margin: { xs: 2, sm: 4 }
          },
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.9)'
          }
        }}
      >
        <DialogContent 
          sx={{ 
            p: 0,
            position: 'relative',
            overflow: 'hidden',
            '&::-webkit-scrollbar': {
              display: 'none'
            },
            bgcolor: 'transparent',
            height: '100%'
          }}
        >
          {selectedImage && (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}
            >
              <Box
                onClick={(e) => e.stopPropagation()}
                sx={{
                  position: 'relative',
                  maxWidth: '100%',
                  maxHeight: '90vh',
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                <img
                  src={selectedImage.url}
                  alt="News image"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '90vh',
                    objectFit: 'contain',
                    borderRadius: '4px'
                  }}
                />
                <IconButton
                  onClick={handleCloseLightbox}
                  sx={{
                    position: 'absolute',
                    right: -12,
                    top: -12,
                    color: 'white',
                    bgcolor: 'rgba(0,0,0,0.4)',
                    '&:hover': {
                      bgcolor: 'rgba(0,0,0,0.6)'
                    },
                    zIndex: 1
                  }}
                >
                  <CloseIcon />
                </IconButton>
                {selectedImage.postImages.length > 1 && (
                  <>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrevImage();
                      }}
                      sx={{
                        position: 'absolute',
                        left: -20,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'white',
                        bgcolor: 'rgba(0,0,0,0.4)',
                        '&:hover': {
                          bgcolor: 'rgba(0,0,0,0.6)'
                        }
                      }}
                    >
                      <NavigateBeforeIcon />
                    </IconButton>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNextImage();
                      }}
                      sx={{
                        position: 'absolute',
                        right: -20,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'white',
                        bgcolor: 'rgba(0,0,0,0.4)',
                        '&:hover': {
                          bgcolor: 'rgba(0,0,0,0.6)'
                        }
                      }}
                    >
                      <NavigateNextIcon />
                    </IconButton>
                  </>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Home; 