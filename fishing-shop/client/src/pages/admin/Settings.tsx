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
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import SessionTimer from '../../components/session/SessionTimer';
import { setupActivityTracking, cleanupActivityTracking } from '../../utils/session';
import { api } from '../../utils/api';

const Settings = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityQuestions, setSecurityQuestions] = useState<string[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState({
    question1: '',
    question2: '',
    question3: ''
  });
  const [answers, setAnswers] = useState({
    answer1: '',
    answer2: '',
    answer3: ''
  });

  useEffect(() => {
    setupActivityTracking();
    fetchUserData();
    fetchSecurityQuestions();
    return () => cleanupActivityTracking();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await api.getUserData();
      setSelectedQuestions({
        question1: response.securityQuestion1 || '',
        question2: response.securityQuestion2 || '',
        question3: response.securityQuestion3 || ''
      });
      setAnswers({
        answer1: response.securityAnswer1 || '',
        answer2: response.securityAnswer2 || '',
        answer3: response.securityAnswer3 || ''
      });
    } catch (err) {
      setError('Failed to load user data');
    }
  };

  const fetchSecurityQuestions = async () => {
    try {
      const response = await api.getSecurityQuestions();
      setSecurityQuestions(response.questions);
    } catch (err) {
      setError('Failed to load security questions');
    }
  };

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setAnswers(prev => ({
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

    if (newPassword && newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      const data = {
        currentPassword,
        newPassword: newPassword || undefined,
        securityQuestions: [
          { question: selectedQuestions.question1, answer: answers.answer1 },
          { question: selectedQuestions.question2, answer: answers.answer2 },
          { question: selectedQuestions.question3, answer: answers.answer3 }
        ]
      };

      await api.updateSettings(data);
      setSuccess('Settings updated successfully');

      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setAnswers({ answer1: '', answer2: '', answer3: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
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
            Settings
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
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom color="primary">
          Account Settings
        </Typography>

        <Paper sx={{ p: 4, mt: 4 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="h6" gutterBottom>
              Change Credentials
            </Typography>
            
            <TextField
              margin="normal"
              fullWidth
              type={showCurrentPassword ? 'text' : 'password'}
              label="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
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
              type={showNewPassword ? 'text' : 'password'}
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
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

            <TextField
              margin="normal"
              fullWidth
              type={showNewPassword ? 'text' : 'password'}
              label="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              Security Questions
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Set up security questions to help recover your account if you forget your credentials.
            </Typography>

            <FormControl fullWidth margin="normal">
              <InputLabel id="question1-label">Security Question 1</InputLabel>
              <Select
                labelId="question1-label"
                id="question1"
                value={selectedQuestions.question1}
                label="Security Question 1"
                onChange={(e) => setSelectedQuestions({ ...selectedQuestions, question1: e.target.value })}
              >
                <MenuItem value="">Select a question</MenuItem>
                {securityQuestions.map((question) => (
                  <MenuItem key={question} value={question}>
                    {question}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              margin="normal"
              fullWidth
              label="Answer 1"
              value={answers.answer1}
              onChange={handleInputChange('answer1')}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel id="question2-label">Security Question 2</InputLabel>
              <Select
                labelId="question2-label"
                id="question2"
                value={selectedQuestions.question2}
                label="Security Question 2"
                onChange={(e) => setSelectedQuestions({ ...selectedQuestions, question2: e.target.value })}
              >
                <MenuItem value="">Select a question</MenuItem>
                {securityQuestions.map((question) => (
                  <MenuItem key={question} value={question}>
                    {question}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              margin="normal"
              fullWidth
              label="Answer 2"
              value={answers.answer2}
              onChange={handleInputChange('answer2')}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel id="question3-label">Security Question 3</InputLabel>
              <Select
                labelId="question3-label"
                id="question3"
                value={selectedQuestions.question3}
                label="Security Question 3"
                onChange={(e) => setSelectedQuestions({ ...selectedQuestions, question3: e.target.value })}
              >
                <MenuItem value="">Select a question</MenuItem>
                {securityQuestions.map((question) => (
                  <MenuItem key={question} value={question}>
                    {question}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              margin="normal"
              fullWidth
              label="Answer 3"
              value={answers.answer3}
              onChange={handleInputChange('answer3')}
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
                Save Changes
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Settings; 