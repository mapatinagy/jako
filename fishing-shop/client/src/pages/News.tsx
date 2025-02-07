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
  Stack
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
    <Box sx={{ py: 6, bgcolor: 'background.default' }}>
      <Container maxWidth="md">
        {/* Hero Section */}
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
            Latest News
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto', mt: 3 }}>
            Stay updated with our latest products, events, and special offers
          </Typography>
        </Box>

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
                  <CardContent>
                    {/* Post Header */}
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: 'primary.main',
                          width: 40,
                          height: 40
                        }}
                      >
                        <StoreIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          Fishing Shop
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {format(new Date(post.created_at), 'MMMM d, yyyy')}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Post Title */}
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        mb: 2,
                        color: 'text.primary',
                        fontWeight: 500
                      }}
                    >
                      {post.title}
                    </Typography>

                    {/* Featured Image */}
                    {post.featured_image && (
                      <Box 
                        sx={{ 
                          mb: 2,
                          borderRadius: 1,
                          overflow: 'hidden',
                          boxShadow: (theme) => theme.shadows[2]
                        }}
                      >
                        <CardMedia
                          component="img"
                          image={
                            post.featured_image.startsWith('/') || post.featured_image.startsWith('http')
                              ? post.featured_image
                              : (() => {
                                  try {
                                    const images = JSON.parse(post.featured_image);
                                    return Array.isArray(images) && images.length > 0
                                      ? `http://localhost:3000/uploads/${images[0]}`
                                      : '';
                                  } catch {
                                    return `http://localhost:3000/uploads/${post.featured_image}`;
                                  }
                                })()
                          }
                          alt={post.title}
                          sx={{
                            width: '100%',
                            height: 'auto',
                            maxHeight: 400,
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease',
                            '&:hover': {
                              transform: 'scale(1.02)'
                            }
                          }}
                        />
                      </Box>
                    )}

                    {/* Post Content */}
                    <Typography 
                      variant="body1" 
                      color="text.secondary"
                      sx={{ 
                        mb: 2,
                        lineHeight: 1.7,
                        '& img': {
                          maxWidth: '100%',
                          height: 'auto',
                          borderRadius: 1,
                          my: 2
                        }
                      }}
                      dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    <Divider sx={{ my: 2 }} />

                    {/* Post Footer */}
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
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