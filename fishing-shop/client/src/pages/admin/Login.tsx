import { useState, useEffect } from 'react';
import { Box, Paper, TextField, Button, Typography, Container, Alert, Link } from '@mui/material';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { getAuthToken } from '../../utils/auth';
import { initSession } from '../../utils/session';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Get the previous location or default to dashboard
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/admin/dashboard';

  useEffect(() => {
    // Check if user was redirected due to token expiration
    const params = new URLSearchParams(location.search);
    if (params.get('expired') === 'true') {
      setMessage('Your session has expired. Please log in again.');
    }
  }, [location]);

  // Check if already logged in with valid token
  useEffect(() => {
    const validateAndRedirect = async () => {
      const token = getAuthToken();
      if (!token) return;

      try {
        // Verify token with server
        const response = await fetch('http://localhost:3000/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          // Token is invalid, remove it
          localStorage.removeItem('authToken');
          return;
        }

        // Token is valid
        initSession();
        navigate(from, { replace: true });
      } catch (error) {
        // On error, remove token and stay on login page
        localStorage.removeItem('authToken');
        console.error('Token validation error:', error);
      }
    };

    validateAndRedirect();
  }, [navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store the token and initialize session
      localStorage.setItem('authToken', data.token);
      initSession();
      
      // Redirect to the previous attempted URL or dashboard
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper 
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Admin Login
          </Typography>

          {message && (
            <Alert severity="info" sx={{ mb: 2, width: '100%' }}>
              {message}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link
                component={RouterLink}
                to="/admin/recover"
                variant="body2"
                sx={{
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                Forgot username or password?
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 