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
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Switch,
  FormControlLabel
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
import EditIcon from '@mui/icons-material/Edit';
import SessionTimer from '../../../components/session/SessionTimer';
import { setupActivityTracking, cleanupActivityTracking } from '../../../utils/session';
import { formatDistanceToNow } from 'date-fns';
import { DatePicker } from '@mui/x-date-pickers';
import SettingsIcon from '@mui/icons-material/Settings';
import { api, getUploadUrl } from '../../../utils/api';

interface UploadedImage {
  url: string;
  index: number;
}

interface Post {
  id: number;
  title: string;
  content: string;
  image: string;
  isPublished: boolean;
  created_at: string;
}

const News = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editIsPublished, setEditIsPublished] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newIsPublished, setNewIsPublished] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  useEffect(() => {
    setupActivityTracking();
    fetchPosts();
    return () => cleanupActivityTracking();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await api.getPosts();
      console.log('API Response:', response);
      if (response.success && Array.isArray(response.posts)) {
        setPosts(response.posts.map(post => ({
          id: post.id,
          title: post.title,
          content: post.content,
          image: post.featured_image,
          isPublished: Boolean(post.is_published),
          created_at: post.created_at
        })));
      } else {
        console.error('Unexpected API response structure:', response);
        setError('Invalid response format from server');
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await api.uploadNewsImage(formData);
      setSuccess('Image uploaded successfully');
      setSelectedFile(null);
      return response.data.filename;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
      return null;
    }
  };

  const handleEdit = (post: Post) => {
    setSelectedPost(post);
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditIsPublished(post.isPublished);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedPost) return;

    try {
      let imageFilename = null;
      if (selectedFile) {
        imageFilename = await handleUpload();
        if (!imageFilename) return;
      }

      await api.updatePost(selectedPost.id, {
        title: editTitle,
        content: editContent,
        isPublished: editIsPublished,
        image: imageFilename || selectedPost.image
      });

      setSuccess('Post updated successfully');
      setEditDialogOpen(false);
      setSelectedFile(null);
      fetchPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update post');
    }
  };

  const handleCreate = async () => {
    try {
      let imageFilename = null;
      if (selectedFile) {
        imageFilename = await handleUpload();
        if (!imageFilename) return;
      }

      await api.createPost({
        title: newTitle,
        content: newContent,
        isPublished: newIsPublished,
        image: imageFilename
      });

      setSuccess('Post created successfully');
      setCreateDialogOpen(false);
      setNewTitle('');
      setNewContent('');
      setNewIsPublished(true);
      setSelectedFile(null);
      fetchPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
    }
  };

  const handleDelete = async (postId: number) => {
    try {
      await api.deletePost(postId);
      setSuccess('Post deleted successfully');
      fetchPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post');
    }
  };

  const handleTogglePublish = async (postId: number) => {
    try {
      await api.togglePostPublish(postId);
      setSuccess('Post status updated successfully');
      fetchPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update post status');
    }
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
        onClose={() => setError('')}
      >
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
      >
        <Alert onClose={() => setSuccess('')} severity="success" sx={{ width: '100%' }}>
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
            onClick={() => navigate('/admin/settings')}
            startIcon={<SettingsIcon />}
            sx={{
              ml: 2,
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Settings
          </Button>
          <Button
            onClick={() => navigate('/admin/login')}
            startIcon={<LogoutIcon />}
            sx={{
              ml: 2,
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
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
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
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
                value={newContent}
                onChange={setNewContent}
                style={{ height: 'auto' }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <IconButton 
                onClick={() => document.getElementById('create-image-upload')?.click()}
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
                onClick={handleCreate}
                disabled={!newTitle.trim() || !newContent.trim()}
              >
                Create Post
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>

      {/* Filter Section */}
      <Container maxWidth="lg" sx={{ pb: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Filter Posts
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              label="Search in titles and content"
              variant="outlined"
              size="small"
              fullWidth
              sx={{ flex: 1, minWidth: '200px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter search terms..."
            />
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              flexWrap: 'wrap',
              flex: 1,
              minWidth: '200px'
            }}>
              <DatePicker
                label="From Date"
                value={fromDate}
                onChange={(newValue) => setFromDate(newValue)}
                maxDate={toDate || undefined}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true
                  }
                }}
              />
              <DatePicker
                label="To Date"
                value={toDate}
                onChange={(newValue) => setToDate(newValue)}
                minDate={fromDate || undefined}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true
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
            Created Posts
          </Typography>

          {filteredPosts.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No posts created yet. Create your first post above!
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              {filteredPosts.map((post) => (
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
                          variant={post.isPublished ? "contained" : "outlined"}
                          color={post.isPublished ? "success" : "primary"}
                          sx={{ mr: 1 }}
                          onClick={() => handleTogglePublish(post.id)}
                        >
                          {post.isPublished ? "Published" : "Draft"}
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          sx={{ mr: 1 }}
                          onClick={() => handleEdit(post)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleDelete(post.id)}
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

                    {post.image && (
                      <Box sx={{ mb: 2 }}>
                        <img
                          src={getUploadUrl(post.image)}
                          alt={post.title}
                          style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px' }}
                        />
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

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Post</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Content
            </Typography>
            <ReactQuill
              value={editContent}
              onChange={setEditContent}
              style={{ height: '300px', marginBottom: '50px' }}
            />
          </Box>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="edit-image-upload"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="edit-image-upload">
            <Button variant="contained" component="span">
              {selectedPost?.image ? 'Change Image' : 'Add Image'}
            </Button>
          </label>
          {selectedFile && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Selected file: {selectedFile.name}
            </Typography>
          )}
          <FormControlLabel
            control={
              <Switch
                checked={editIsPublished}
                onChange={(e) => setEditIsPublished(e.target.checked)}
              />
            }
            label={editIsPublished ? 'Published' : 'Draft'}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default News;