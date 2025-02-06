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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ImageIcon from '@mui/icons-material/Image';
import SessionTimer from '../../../components/session/SessionTimer';
import { setupActivityTracking, cleanupActivityTracking } from '../../../utils/session';

const News = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const quillRef = useRef<ReactQuill>(null);

  useEffect(() => {
    setupActivityTracking();
    return () => cleanupActivityTracking();
  }, []);

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
      setError('Only image files (JPEG, JPG, PNG, GIF, WebP, SVG) are allowed.');
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
        throw new Error('Failed to upload images');
      }

      const data = await response.json();
      if (data.success) {
        // Insert all successfully uploaded images into the editor
        const quill = quillRef.current?.getEditor();
        if (quill) {
          const range = quill.getSelection() || { index: quill.getLength(), length: 0 };
          data.images.forEach((image: { url: string }, index: number) => {
            if (index > 0) {
              // Add a newline between images
              quill.insertText(range.index + index, '\n');
            }
            quill.insertEmbed(range.index + index, 'image', `http://localhost:3000${image.url}`);
          });
          quill.setSelection((range.index || 0) + data.images.length, 0);
        }
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      setError('Failed to upload images. Please try again.');
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:3000/api/news/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          is_published: false
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create news post');
      }

      setTitle('');
      setContent('');
    } catch (error) {
      console.error('Error creating news post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ]
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline',
    'list', 'bullet',
    'link', 'image'
  ];

  return (
    <Box>
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
                {isSubmitting ? 'Creating...' : 'Create Post'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default News; 