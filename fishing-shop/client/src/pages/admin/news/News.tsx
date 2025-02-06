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
        throw new Error('No authentication token found');
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
        throw new Error(errorData.message || 'Failed to fetch posts');
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
        throw new Error(data.message || 'Failed to fetch posts');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch posts');
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
        `Invalid file type(s): ${invalidFiles.map(f => f.name).join(', ')}. \n` +
        'Only the following image formats are allowed: JPEG, JPG, PNG, GIF, WebP, SVG.'
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
        throw new Error(errorData.message || 'Failed to upload images');
      }

      const data = await response.json();
      if (data.success) {
        const newImages = data.images.map((image: { url: string }, idx: number) => ({
          url: `http://localhost:3000${image.url}`,
          index: uploadedImages.length + idx
        }));
        
        setUploadedImages(prev => [...prev, ...newImages]);
        setSuccess(`Successfully uploaded ${files.length} image${files.length > 1 ? 's' : ''}`);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      setError(
        'Failed to upload images. Please try again. ' + 
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
        throw new Error(errorData.message || `Failed to ${isEditing ? 'update' : 'create'} news post`);
      }

      setSuccess(`News post ${isEditing ? 'updated' : 'created'} successfully!`);
      resetForm();
      fetchPosts();
    } catch (error) {
      console.error(`Error ${editingPost ? 'updating' : 'creating'} news post:`, error);
      setError(`Failed to ${editingPost ? 'update' : 'create'} news post. Please try again.`);
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
        throw new Error('Failed to delete post');
      }

      const data = await response.json();
      if (data.success) {
        setPosts(posts.filter(post => post.id !== postId));
        setSuccess('Post deleted successfully');
        setDeleteConfirmPost(null);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      setError('Failed to delete post');
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
        throw new Error('Failed to toggle publish status');
      }

      const data = await response.json();
      if (data.success) {
        // Update the post in the local state
        setPosts(posts.map(post => 
          post.id === postId 
            ? { ...post, is_published: !post.is_published }
            : post
        ));
        setSuccess(data.message);
      }
    } catch (error) {
      console.error('Error toggling publish status:', error);
      setError('Failed to toggle publish status');
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
    ? (editingPost ? 'Updating...' : 'Creating...') 
    : (editingPost ? 'Update Post' : 'Create Post');

  const handleCloseError = () => {
    setError(null);
  };

  const handleCloseSuccess = () => {
    setSuccess(null);
  };

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
        <Toolbar sx={{ px: { xs: 2, sm: 4 } }}>
          <Stack 
            direction="row" 
            alignItems="center" 
            spacing={1.5} 
            sx={{ cursor: 'pointer' }}
            onClick={() => navigate('/admin/dashboard')}
          >
            <DashboardIcon sx={{ fontSize: 32 }} />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Admin Panel
            </Typography>
          </Stack>
          <Box sx={{ flexGrow: 1 }} />
          <SessionTimer />
          <Button
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            sx={{ color: 'white', ml: 2 }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Create News Post
          </Typography>
          
          <Box sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              sx={{ mb: 3 }}
              placeholder="What's on your mind?"
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
                placeholder="Write your post content here..."
                style={{ height: 'auto' }}
              />
            </Box>

            {uploadedImages.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Uploaded Images
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

      {/* Posts Section */}
      <Container maxWidth="lg" sx={{ pb: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Created Posts
          </Typography>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <Typography>Loading posts...</Typography>
            </Box>
          ) : posts.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No posts created yet. Create your first post above!
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              {posts.map((post) => (
                <Paper 
                  key={post.id} 
                  elevation={2}
                  sx={{ 
                    p: 2,
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 4
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6">{post.title}</Typography>
                      <Box>
                        <Button
                          size="small"
                          variant={post.is_published ? "contained" : "outlined"}
                          color={post.is_published ? "success" : "primary"}
                          sx={{ mr: 1 }}
                          onClick={() => handleTogglePublish(post.id)}
                        >
                          {post.is_published ? "Published" : "Draft"}
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          sx={{ mr: 1 }}
                          onClick={() => populateForm(post)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => setDeleteConfirmPost(post)}
                        >
                          Delete
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
                            gap: 2,
                            m: 0
                          }} 
                          cols={3} 
                          rowHeight={200}
                        >
                          {post.featured_image.map((image: string, index: number) => (
                            <ImageListItem 
                              key={index}
                              sx={{
                                width: '200px !important',
                                height: '200px !important',
                                flexGrow: 0,
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
                      Created {formatDistanceToNow(new Date(post.created_at))} ago
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
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the post "{deleteConfirmPost?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmPost(null)}>Cancel</Button>
          <Button 
            onClick={() => deleteConfirmPost && handleDelete(deleteConfirmPost.id)} 
            color="error" 
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default News;