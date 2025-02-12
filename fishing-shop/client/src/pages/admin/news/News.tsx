import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  TextField,
  Button,
  AppBar,
  Toolbar,
  Stack,
  IconButton,
  Alert,
  Snackbar,
  ImageList,
  ImageListItem,
  IconButton as MuiIconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import 'quill-emoji/dist/quill-emoji.css';
import '../../../utils/quill-modules';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ImageIcon from '@mui/icons-material/Image';
import DeleteIcon from '@mui/icons-material/Delete';
import SessionTimer from '../../../components/session/SessionTimer';
import { setupActivityTracking, cleanupActivityTracking } from '../../../utils/session';
import { formatDistanceToNow } from 'date-fns';
import { DatePicker } from '@mui/x-date-pickers';
import SettingsIcon from '@mui/icons-material/Settings';

interface UploadedImage {
  url: string;
  index: number;
}

interface NewsPost {
  id: number;
  title: string;
  content: string;
  created_at: string;
  is_published: boolean;
  featured_image: string | null;
  featured_image_originals?: string[];
}

const News = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const quillRef = useRef<ReactQuill>(null);
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingPost, setEditingPost] = useState<NewsPost | null>(null);
  const [deleteConfirmPost, setDeleteConfirmPost] = useState<NewsPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  useEffect(() => {
    setupActivityTracking();
    fetchPosts();
    return () => cleanupActivityTracking();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Nem található hitelesítési token');
      }

      const response = await fetch('http://localhost:3000/api/news/posts', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'A hírek betöltése sikertelen');
      }

      const data = await response.json();
      if (data.success) {
        setPosts(data.posts.map((post: any) => ({
          ...post,
          featured_image: post.featured_image ? 
            post.featured_image.map((url: string) => 
              url.startsWith('http') ? url : `http://localhost:3000${url}`
            ) : null,
          featured_image_originals: post.featured_image_originals || []
        })));
      } else {
        throw new Error(data.message || 'A hírek betöltése sikertelen');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError(error instanceof Error ? error.message : 'A hírek betöltése sikertelen');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/admin/login');
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validate file types
    const invalidFiles = files.filter(file => !file.type.match(/^image\/(jpeg|jpg|png|gif|webp|svg\+xml)$/));
    if (invalidFiles.length > 0) {
      setError(
        `Érvénytelen fájltípus(ok): ${invalidFiles.map(f => f.name).join(', ')}. \n` +
        'Csak a következő képformátumok engedélyezettek: JPEG, JPG, PNG, GIF, WebP, SVG.'
      );
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    const token = localStorage.getItem('authToken');
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    try {
      const response = await fetch('http://localhost:3000/api/news/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'A képek feltöltése sikertelen');
      }

      const data = await response.json();
      if (data.success) {
        const newImages = data.images.map((image: { url: string }, idx: number) => ({
          url: `http://localhost:3000${image.url}`,
          index: uploadedImages.length + idx
        }));
        
        setUploadedImages(prev => [...prev, ...newImages]);
        setSuccess(`${files.length} kép sikeresen feltöltve`);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      setError(
        'A képek feltöltése sikertelen. Kérjük, próbáld újra. ' + 
        (error instanceof Error ? error.message : '')
      );
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (imageToRemove: UploadedImage) => {
    setUploadedImages(prev => prev.filter(img => img.url !== imageToRemove.url));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('authToken');
      const isEditing = !!editingPost;
      
      // Remove duplicate URLs and format the image URLs as a JSON string
      const uniqueUrls = Array.from(new Set(
        uploadedImages.map(img => img.url.replace('http://localhost:3000', ''))
      ));
      const imageUrls = uniqueUrls.length > 0 ? JSON.stringify(uniqueUrls) : null;

      const response = await fetch(
        `http://localhost:3000/api/news/posts${isEditing ? `/${editingPost.id}` : ''}`, 
        {
          method: isEditing ? 'PATCH' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: title.trim(),
            content: content.trim(),
            is_published: isEditing ? editingPost.is_published : false,
            featured_image: imageUrls
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `A hír ${isEditing ? 'frissítése' : 'létrehozása'} sikertelen`);
      }

      setSuccess(`A hír sikeresen ${isEditing ? 'frissítve' : 'létrehozva'}!`);
      resetForm();
      fetchPosts();
    } catch (error) {
      console.error(`Error ${editingPost ? 'updating' : 'creating'} news post:`, error);
      setError(`A hír ${editingPost ? 'frissítése' : 'létrehozása'} sikertelen. Kérjük, próbáld újra.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (postId: number) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3000/api/news/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('A hír törlése sikertelen');
      }

      const data = await response.json();
      if (data.success) {
        setPosts(posts.filter(post => post.id !== postId));
        setSuccess('A hír sikeresen törölve');
        setDeleteConfirmPost(null);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      setError('A hír törlése sikertelen');
    }
  };

  const handleTogglePublish = async (postId: number) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3000/api/news/posts/${postId}/toggle-publish`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('A publikálási státusz módosítása sikertelen');
      }

      const data = await response.json();
      if (data.success) {
        setPosts(posts.map(post => 
          post.id === postId 
            ? { ...post, is_published: !post.is_published }
            : post
        ));
        setSuccess(data.message);
      }
    } catch (error) {
      console.error('Error toggling publish status:', error);
      setError('A publikálási státusz módosítása sikertelen');
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['emoji'],
      ['clean']
    ],
    'emoji-toolbar': {
      buttonIcon: '😀'
    },
    'emoji-shortname': true,
    'emoji-textarea': false
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline',
    'list', 'bullet',
    'link', 'image',
    'emoji'
  ];

  // Reset form function
  const resetForm = () => {
    setTitle('');
    setContent('');
    setUploadedImages([]);
    setEditingPost(null);
  };

  // Function to populate form with post data
  const populateForm = (post: NewsPost) => {
    setTitle(post.title);
    setContent(post.content);
    if (post.featured_image && Array.isArray(post.featured_image)) {
      setUploadedImages(post.featured_image.map((url, index) => ({
        url,
        index,
      })));
    } else {
      setUploadedImages([]);
    }
    setEditingPost(post);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Update the Create Post button text
  const submitButtonText = isSubmitting 
    ? (editingPost ? 'Frissítés folyamatban...' : 'Közzététel folyamatban...') 
    : (editingPost ? 'Poszt frissítése' : 'Közzététel');

  const handleCloseError = () => {
    setError(null);
  };

  const handleCloseSuccess = () => {
    setSuccess(null);
  };

  const filteredPosts = posts.filter(post => {
    // Text search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchLower) ||
      post.content.toLowerCase().includes(searchLower);

    // Date range filter
    let matchesDateRange = true;
    if (fromDate) {
      const fromDateTime = new Date(fromDate);
      fromDateTime.setHours(0, 0, 0, 0);
      matchesDateRange = matchesDateRange && new Date(post.created_at) >= fromDateTime;
    }
    if (toDate) {
      const toDateTime = new Date(toDate);
      toDateTime.setHours(23, 59, 59, 999);
      matchesDateRange = matchesDateRange && new Date(post.created_at) <= toDateTime;
    }

    return matchesSearch && matchesDateRange;
  });

  return (
    <Box>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>

      {/* Admin Header */}
      <AppBar position="static" sx={{ backgroundColor: 'primary.main' }}>
        <Toolbar sx={{ px: { xs: 2, sm: 4, md: 6, lg: 8 } }}>
          <Stack 
            direction="row" 
            alignItems="center" 
            spacing={1} 
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
                transition: 'opacity 0.2s ease',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              Admin Panel
            </Typography>
          </Stack>
          <Box sx={{ flexGrow: 1 }} />
          <Stack direction="row" spacing={1} alignItems="center">
            <SessionTimer />
            <Button
              onClick={() => navigate('/admin/settings')}
              startIcon={<SettingsIcon sx={{ fontSize: { xs: 20, sm: 28 } }} />}
              sx={{
                color: 'white',
                fontSize: { xs: '0.9rem', sm: '1.2rem' },
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                },
                px: { xs: 1, sm: 2 }
              }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'block' } }}>
                Beállítások
              </Box>
            </Button>
            <Button
              onClick={handleLogout}
              startIcon={<LogoutIcon sx={{ fontSize: { xs: 20, sm: 28 } }} />}
              sx={{
                color: 'white',
                fontSize: { xs: '0.9rem', sm: '1.2rem' },
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                },
                px: { xs: 1, sm: 2 }
              }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'block' } }}>
                Kijelentkezés
              </Box>
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Új poszt létrehozása
          </Typography>
          
          <Box sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="Cím"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              sx={{ mb: 3 }}
              placeholder="Mi jár a fejedben?"
            />

            <Box sx={{ 
              mb: 3,
              '.ql-editor': {
                minHeight: '300px',
                fontSize: '1rem'
              },
              '.ql-container': {
                height: 'auto'
              }
            }}>
              <ReactQuill
                ref={quillRef}
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modules}
                formats={formats}
                placeholder="Írd ide a poszt tartalmát..."
                style={{ height: 'auto' }}
              />
            </Box>

            {uploadedImages.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Feltöltött képek
                </Typography>
                <ImageList sx={{ width: '100%', maxHeight: 200 }} cols={4} rowHeight={100} gap={8}>
                  {uploadedImages.map((img, index) => (
                    <ImageListItem key={index} sx={{ position: 'relative' }}>
                      <img
                        src={img.url}
                        alt={`Uploaded ${index + 1}`}
                        loading="lazy"
                        style={{ height: '100px', width: '100%', objectFit: 'cover', borderRadius: '4px' }}
                      />
                      <MuiIconButton
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          backgroundColor: 'rgba(0, 0, 0, 0.5)',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                          },
                          padding: '4px',
                        }}
                        onClick={() => handleRemoveImage(img)}
                      >
                        <DeleteIcon sx={{ fontSize: '1.2rem' }} />
                      </MuiIconButton>
                    </ImageListItem>
                  ))}
                </ImageList>
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/jpg,image/jfif,image/png,image/gif,image/webp,image/svg+xml"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
                ref={fileInputRef}
              />
              <IconButton 
                onClick={() => fileInputRef.current?.click()}
                sx={{ 
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark'
                  }
                }}
              >
                <ImageIcon />
              </IconButton>
              <Box sx={{ flex: 1 }} />
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={isSubmitting || !title.trim() || !content.trim()}
              >
                {submitButtonText}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>

      {/* Filter Section */}
      <Container maxWidth="lg" sx={{ pb: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Posztok szűrése
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              label="Cím és tartalom szerinti keresés"
              variant="outlined"
              size="small"
              fullWidth
              sx={{ flex: 1, minWidth: '200px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Írd ide a keresési kifejezéseket..."
            />
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              flexWrap: 'wrap',
              flex: 1,
              minWidth: { xs: '100%', sm: '200px' }
            }}>
              <DatePicker
                label="Kezdő dátum"
                value={fromDate}
                onChange={(newValue) => setFromDate(newValue)}
                maxDate={toDate || undefined}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    sx: { minWidth: { xs: '100%', sm: 'auto' } }
                  }
                }}
              />
              <DatePicker
                label="Záró dátum"
                value={toDate}
                onChange={(newValue) => setToDate(newValue)}
                minDate={fromDate || undefined}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    sx: { minWidth: { xs: '100%', sm: 'auto' } }
                  }
                }}
              />
            </Box>
          </Box>
        </Paper>
      </Container>

      {/* Posts Section */}
      <Container maxWidth="lg" sx={{ pb: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Létrehozott posztok
          </Typography>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <Typography>Posztok betöltése...</Typography>
            </Box>
          ) : filteredPosts.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                Még nincs létrehozva poszt. Kérlek hozd létre az elsőt fent!
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              {filteredPosts.map((post) => (
                <Paper 
                  key={post.id} 
                  elevation={2}
                  sx={{ 
                    p: { xs: 1.5, sm: 2 },
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 4
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column-reverse', sm: 'row' },
                      gap: { xs: 1, sm: 0 },
                      justifyContent: 'space-between', 
                      alignItems: { xs: 'flex-start', sm: 'center' }, 
                      mb: 1 
                    }}>
                      <Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                        {post.title}
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        flexWrap: 'wrap',
                        gap: 1,
                        width: { xs: '100%', sm: 'auto' }
                      }}>
                        <Button
                          size="small"
                          variant={post.is_published ? "contained" : "outlined"}
                          color={post.is_published ? "success" : "primary"}
                          onClick={() => handleTogglePublish(post.id)}
                        >
                          {post.is_published ? "Publikált" : "Piszkozat"}
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          onClick={() => populateForm(post)}
                        >
                          Szerkesztés
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => setDeleteConfirmPost(post)}
                        >
                          Törlés
                        </Button>
                      </Box>
                    </Box>
                    
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ mb: 1 }}
                      dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    {post.featured_image && Array.isArray(post.featured_image) && post.featured_image.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <ImageList 
                          sx={{ 
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 1,
                            m: 0
                          }} 
                          cols={3} 
                          rowHeight={200}
                        >
                          {post.featured_image.map((image: string, index: number) => (
                            <ImageListItem 
                              key={index}
                              sx={{
                                width: { xs: 'calc(50% - 4px) !important', sm: '200px !important' },
                                height: { xs: '150px !important', sm: '200px !important' },
                                flexGrow: { xs: 0, sm: 0 },
                                flexShrink: 0
                              }}
                            >
                              <img
                                src={image}
                                alt={`${post.title} - Image ${index + 1}`}
                                loading="lazy"
                                style={{ 
                                  height: '100%',
                                  width: '100%',
                                  objectFit: 'cover',
                                  borderRadius: '4px'
                                }}
                              />
                            </ImageListItem>
                          ))}
                        </ImageList>
                      </Box>
                    )}

                    <Typography variant="caption" color="text.secondary">
                      Létrehozva {formatDistanceToNow(new Date(post.created_at))} ezelőtt
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Stack>
          )}
        </Paper>
      </Container>

      <Dialog
        open={!!deleteConfirmPost}
        onClose={() => setDeleteConfirmPost(null)}
      >
        <DialogTitle>Biztosan törlöni szeretnéd a posztot?</DialogTitle>
        <DialogContent>
          <Typography>
            Biztosan törlöd a posztot "{deleteConfirmPost?.title}"? Ez az művelet nem visszafordítható.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmPost(null)}>Mégsem</Button>
          <Button 
            onClick={() => deleteConfirmPost && handleDelete(deleteConfirmPost.id)} 
            color="error" 
            variant="contained"
          >
            Törlés
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default News;