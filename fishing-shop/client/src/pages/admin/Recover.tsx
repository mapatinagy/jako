import { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';

const Recover = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  const [identifierType, setIdentifierType] = useState('username');
  const [identifier, setIdentifier] = useState('');
  const [recoveredUsername, setRecoveredUsername] = useState('');
  const [securityQuestions, setSecurityQuestions] = useState<{
    question1?: string;
    question2?: string;
    question3?: string;
  }>({});
  const [answers, setAnswers] = useState({
    answer1: '',
    answer2: '',
    answer3: ''
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const steps = ['Verify Identity', 'Answer Security Questions', 'Reset Password'];

  const handleIdentifierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.getRecoveryQuestions({
        [identifierType]: identifier
      });

      setSecurityQuestions({
        question1: response.securityQuestion1,
        question2: response.securityQuestion2,
        question3: response.securityQuestion3
      });
      setActiveStep(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify identity');
    }
  };

  const handleAnswersSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.verifySecurityAnswers({
        [identifierType]: identifier,
        answers: [answers.answer1, answers.answer2, answers.answer3]
      });

      setRecoveredUsername(response.username);
      setActiveStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify answers');
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await api.resetPassword({
        username: recoveredUsername,
        newPassword,
        answers: [answers.answer1, answers.answer2, answers.answer3]
      });

      // Success! Redirect to login
      navigate('/admin/login', { 
        state: { message: 'Password reset successful. Please log in with your new password.' }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Account Recovery
          </Typography>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {activeStep === 0 && (
            <Box component="form" onSubmit={handleIdentifierSubmit}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Please enter your username or email to start the recovery process.
              </Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Identify with</InputLabel>
                <Select
                  value={identifierType}
                  label="Identify with"
                  onChange={(e) => setIdentifierType(e.target.value)}
                >
                  <MenuItem value="username">Username</MenuItem>
                  <MenuItem value="email">Email</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label={identifierType === 'username' ? 'Username' : 'Email'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                type={identifierType === 'email' ? 'email' : 'text'}
                required
                sx={{ mb: 3 }}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
              >
                Continue
              </Button>
            </Box>
          )}

          {activeStep === 1 && (
            <Box component="form" onSubmit={handleAnswersSubmit}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Please answer your security questions.
              </Typography>
              {securityQuestions.question1 && (
                <TextField
                  fullWidth
                  label={securityQuestions.question1}
                  value={answers.answer1}
                  onChange={(e) => setAnswers(prev => ({ ...prev, answer1: e.target.value }))}
                  required
                  sx={{ mb: 2 }}
                />
              )}
              {securityQuestions.question2 && (
                <TextField
                  fullWidth
                  label={securityQuestions.question2}
                  value={answers.answer2}
                  onChange={(e) => setAnswers(prev => ({ ...prev, answer2: e.target.value }))}
                  required
                  sx={{ mb: 2 }}
                />
              )}
              {securityQuestions.question3 && (
                <TextField
                  fullWidth
                  label={securityQuestions.question3}
                  value={answers.answer3}
                  onChange={(e) => setAnswers(prev => ({ ...prev, answer3: e.target.value }))}
                  required
                  sx={{ mb: 3 }}
                />
              )}
              <Button
                type="submit"
                variant="contained"
                fullWidth
              >
                Verify Answers
              </Button>
            </Box>
          )}

          {activeStep === 2 && (
            <Box component="form" onSubmit={handlePasswordReset}>
              <Alert severity="info" sx={{ mb: 3 }}>
                Your username is: <strong>{recoveredUsername}</strong>
              </Alert>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Please enter your new password.
              </Typography>
              <TextField
                fullWidth
                type="password"
                label="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                type="password"
                label="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                sx={{ mb: 3 }}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
              >
                Reset Password
              </Button>
            </Box>
          )}

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Link
              component={RouterLink}
              to="/admin/login"
              variant="body2"
              sx={{
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              Back to Login
            </Link>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Recover; 