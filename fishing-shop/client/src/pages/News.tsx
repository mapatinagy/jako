import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Skeleton,
  Fade,
  Divider,
  Avatar,
  Stack,
  Paper
} from '@mui/material';
import { format } from 'date-fns';
import StoreIcon from '@mui/icons-material/Store';

interface NewsPost {
  id: number;
  title: string;
  content: string;
  created_at: string;
  featured_image: string | null;
}

const News = () => {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/news/posts');
      const data = await response.json();
      
      if (data.success) {
        console.log('Received posts:', data.posts);
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderSkeleton = () => (
    <Card sx={{ mb: 3, borderRadius: 2 }}>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ flex: 1 }}>
            <Skeleton width="40%" height={24} />
            <Skeleton width="20%" height={20} />
          </Box>
        </Stack>
        <Skeleton variant="rectangular" height={200} sx={{ mb: 2, borderRadius: 1 }} />
        <Skeleton height={20} sx={{ mb: 1 }} />
        <Skeleton height={20} width="80%" />
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ py: 6, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="md">
        {/* Hero Section */}
        <Paper 
          elevation={0}
          sx={{ 
            mb: 6, 
            textAlign: 'center',
            p: 4,
            background: 'linear-gradient(to right bottom, #2e7d32, #4caf50)',
            color: 'white',
            borderRadius: 2
          }}
        >
          <Typography 
            variant="h1" 
            sx={{ 
              mb: 2,
              color: 'white',
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
                bgcolor: 'white',
                borderRadius: 1
              }
            }}
          >
            Latest News
          </Typography>
          <Typography variant="h5" sx={{ maxWidth: 800, mx: 'auto', mt: 3, color: 'rgba(255, 255, 255, 0.9)' }}>
            Stay updated with our latest products, events, and special offers
          </Typography>
        </Paper>

        {/* News Feed */}
        <Box>
          {loading ? (
            // Loading skeletons
            Array.from(new Array(3)).map((_, index) => (
              <Box key={index}>
                {renderSkeleton()}
              </Box>
            ))
          ) : (
            posts.map((post, index) => (
              <Fade 
                key={post.id} 
                in={true} 
                timeout={500} 
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <Card 
                  sx={{ 
                    mb: 3,
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: (theme) => theme.shadows[8]
                    }
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    {/* Post Header */}
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2.5 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: 'primary.main',
                          width: 48,
                          height: 48
                        }}
                      >
                        <StoreIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                          Fishing Shop
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {format(new Date(post.created_at), 'MMMM d, yyyy')}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Post Title */}
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        mb: 2.5,
                        color: 'text.primary',
                        fontWeight: 500,
                        lineHeight: 1.3
                      }}
                    >
                      {post.title}
                    </Typography>

                    {/* Post Content */}
                    <Box 
                      sx={{ 
                        mb: 2.5,
                        '& > div': { 
                          '&:last-child': { mb: 0 }
                        }
                      }}
                    >
                      <Typography 
                        component="div"
                        sx={{ 
                          color: 'text.primary',
                          fontSize: '1rem',
                          lineHeight: 1.7,
                          '& img': {
                            maxWidth: '100%',
                            height: 'auto',
                            borderRadius: 1,
                            my: 2
                          },
                          '& p': {
                            mb: 2,
                            '&:last-child': { mb: 0 }
                          }
                        }}
                        dangerouslySetInnerHTML={{ __html: post.content }}
                      />
                    </Box>

                    {/* Featured Images */}
                    {post.featured_image && Array.isArray(post.featured_image) && post.featured_image.length > 0 && (
                      <Box sx={{ mb: 2.5 }}>
                        <Box
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                              xs: 'repeat(2, 1fr)',
                              sm: 'repeat(3, 1fr)',
                              md: 'repeat(4, 1fr)'
                            },
                            gap: 1
                          }}
                        >
                          {post.featured_image.map((image, imageIndex) => (
                            <Box
                              key={imageIndex}
                              sx={{
                                position: 'relative',
                                paddingTop: '100%', // 1:1 aspect ratio
                                borderRadius: 1,
                                overflow: 'hidden',
                                boxShadow: (theme) => theme.shadows[2]
                              }}
                            >
                              <CardMedia
                                component="img"
                                image={image.startsWith('http') ? image : `http://localhost:3000${image}`}
                                alt={`${post.title} - Image ${imageIndex + 1}`}
                                sx={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  transition: 'transform 0.3s ease',
                                  '&:hover': {
                                    transform: 'scale(1.05)'
                                  }
                                }}
                              />
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    )}

                    <Divider sx={{ my: 2.5 }} />

                    {/* Post Footer */}
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        fontStyle: 'italic',
                        opacity: 0.8
                      }}
                    >
                      Posted {format(new Date(post.created_at), 'PPpp')}
                    </Typography>
                  </CardContent>
                </Card>
              </Fade>
            ))
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default News; 