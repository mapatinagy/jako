import { useState, useEffect } from 'react';
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
  Alert,
  Divider,
  IconButton,
  InputAdornment
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import SessionTimer from '../../components/session/SessionTimer';
import { setupActivityTracking, cleanupActivityTracking } from '../../utils/session';

const Settings = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newUsername: '',
    newEmail: '',
    newPassword: '',
    securityQuestion1: '',
    securityAnswer1: '',
    securityQuestion2: '',
    securityAnswer2: '',
    securityQuestion3: '',
    securityAnswer3: ''
  });

  useEffect(() => {
    setupActivityTracking();
    fetchUserData();
    return () => cleanupActivityTracking();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const [questionsResponse, userDataResponse] = await Promise.all([
        fetch('http://localhost:3000/api/auth/security-questions', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
        fetch('http://localhost:3000/api/auth/user-data', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      ]);

      if (questionsResponse.ok) {
        const questionsData = await questionsResponse.json();
        setFormData(prev => ({
          ...prev,
          securityQuestion1: questionsData.securityQuestion1 || '',
          securityQuestion2: questionsData.securityQuestion2 || '',
          securityQuestion3: questionsData.securityQuestion3 || ''
        }));
      }

      if (userDataResponse.ok) {
        const userData = await userDataResponse.json();
        setFormData(prev => ({
          ...prev,
          newEmail: userData.email || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.currentPassword) {
      setError('A jelenlegi jelszó megadása kötelező');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:3000/api/auth/update-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Beállítások frissítése sikertelen');
      }

      setSuccess('Beállítások sikeresen frissítve');
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newUsername: '',
        newPassword: ''
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Beállítások frissítése sikertelen');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/admin/login');
  };

  return (
    <Box>
      <AppBar position="static" sx={{ backgroundColor: 'primary.main' }}>
        <Toolbar sx={{ px: { xs: 2, sm: 4, md: 6, lg: 8 } }}>
          <Stack 
            direction="row" 
            alignItems="center" 
            spacing={1.5} 
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
                fontSize: 32,
                color: 'white',
                transition: 'opacity 0.2s ease'
              }} 
            />
            <Typography 
              variant="h5" 
              sx={{ 
                color: 'white',
                fontWeight: 600,
                transition: 'opacity 0.2s ease'
              }}
            >
              Admin Panel
            </Typography>
          </Stack>
          <Box sx={{ flexGrow: 1 }} />
          <SessionTimer />
          <Button
            onClick={() => navigate('/admin/settings')}
            startIcon={<SettingsIcon sx={{ fontSize: 28 }} />}
            sx={{
              ml: 2,
              color: 'white',
              fontSize: '1.2rem',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Beállítások
          </Button>
          <Button
            onClick={handleLogout}
            startIcon={<LogoutIcon sx={{ fontSize: 28 }} />}
            sx={{
              ml: 2,
              color: 'white',
              fontSize: '1.2rem',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Kijelentkezés
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom color="primary">
          Fiók beállítások
        </Typography>

        <Paper sx={{ p: 4, mt: 4 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="h6" gutterBottom>
              Hitelesítési adatok módosítása
            </Typography>
            
            <TextField
              margin="normal"
              fullWidth
              type={showCurrentPassword ? 'text' : 'password'}
              label="Jelenlegi jelszó"
              value={formData.currentPassword}
              onChange={handleInputChange('currentPassword')}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      edge="end"
                    >
                      {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              margin="normal"
              fullWidth
              label="Új felhasználónév (opcionális)"
              value={formData.newUsername}
              onChange={handleInputChange('newUsername')}
            />

            <TextField
              margin="normal"
              fullWidth
              type="email"
              label="Email cím"
              value={formData.newEmail}
              onChange={handleInputChange('newEmail')}
              helperText="Fiók helyreállításhoz használható"
            />

            <TextField
              margin="normal"
              fullWidth
              type={showNewPassword ? 'text' : 'password'}
              label="Új jelszó (opcionális)"
              value={formData.newPassword}
              onChange={handleInputChange('newPassword')}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                    >
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Divider sx={{ my: 4 }} />

            <Typography variant="h6" gutterBottom>
              Biztonsági kérdések
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Állítsd be a biztonsági kérdéseket a fiókod helyreállításához, ha elfelejtenéd a belépési adataidat.
            </Typography>

            <TextField
              margin="normal"
              fullWidth
              label="1. Biztonsági kérdés"
              value={formData.securityQuestion1}
              onChange={handleInputChange('securityQuestion1')}
              placeholder="pl.: Mi volt az első háziállatod neve?"
            />
            <TextField
              margin="normal"
              fullWidth
              label="1. Válasz"
              value={formData.securityAnswer1}
              onChange={handleInputChange('securityAnswer1')}
            />

            <TextField
              margin="normal"
              fullWidth
              label="2. Biztonsági kérdés"
              value={formData.securityQuestion2}
              onChange={handleInputChange('securityQuestion2')}
              placeholder="pl.: Melyik városban születtél?"
            />
            <TextField
              margin="normal"
              fullWidth
              label="2. Válasz"
              value={formData.securityAnswer2}
              onChange={handleInputChange('securityAnswer2')}
            />

            <TextField
              margin="normal"
              fullWidth
              label="3. Biztonsági kérdés"
              value={formData.securityQuestion3}
              onChange={handleInputChange('securityQuestion3')}
              placeholder="pl.: Mi volt a beceneved gyerekkorodban?"
            />
            <TextField
              margin="normal"
              fullWidth
              label="3. Válasz"
              value={formData.securityAnswer3}
              onChange={handleInputChange('securityAnswer3')}
            />

            <Box sx={{ mt: 3 }}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {success}
                </Alert>
              )}
              <Button
                type="submit"
                variant="contained"
                fullWidth
              >
                Módosítások mentése
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Settings; 