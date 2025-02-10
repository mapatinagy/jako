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

  const steps = ['Identitás ellenőrzése', 'Biztonsági kérdések megválaszolása', 'Jelszó visszaállítás'];

  const handleIdentifierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/auth/get-recovery-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          [identifierType]: identifier
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Felhasználó nem található');
      }

      setSecurityQuestions({
        question1: data.securityQuestion1,
        question2: data.securityQuestion2,
        question3: data.securityQuestion3
      });
      setActiveStep(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Identitás ellenőrzés sikertelen');
    }
  };

  const handleAnswersSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/auth/verify-security-answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          [identifierType]: identifier,
          answers: [answers.answer1, answers.answer2, answers.answer3]
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Hibás válaszok');
      }

      setRecoveredUsername(data.username);
      setActiveStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Válaszok ellenőrzése sikertelen');
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('A jelszavak nem egyeznek');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: recoveredUsername,
          newPassword,
          answers: [answers.answer1, answers.answer2, answers.answer3]
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Jelszó visszaállítás sikertelen');
      }

      // Success! Redirect to login
      navigate('/admin/login', { 
        state: { message: 'Jelszó visszaállítás sikeres. Kérlek, lépj be új jelszóval.' }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Jelszó visszaállítás sikertelen');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Fiók helyreállítás
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
                Kérlek, add meg a felhasználónevedet vagy email címedet a helyreállítás folytatásához.
              </Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Identitás ellenőrzése</InputLabel>
                <Select
                  value={identifierType}
                  label="Identitás ellenőrzése"
                  onChange={(e) => setIdentifierType(e.target.value)}
                >
                  <MenuItem value="username">Felhasználónév</MenuItem>
                  <MenuItem value="email">Email</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label={identifierType === 'username' ? 'Felhasználónév' : 'Email'}
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
                Folytatás
              </Button>
            </Box>
          )}

          {activeStep === 1 && (
            <Box component="form" onSubmit={handleAnswersSubmit}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Kérlek, válaszd ki a biztonsági kérdéseket és add meg a válaszait.
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
                Válaszok ellenőrzése
              </Button>
            </Box>
          )}

          {activeStep === 2 && (
            <Box component="form" onSubmit={handlePasswordReset}>
              <Alert severity="info" sx={{ mb: 3 }}>
                A felhasználóneved: <strong>{recoveredUsername}</strong>
              </Alert>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Kérlek, add meg az új jelszavad.
              </Typography>
              <TextField
                fullWidth
                type="password"
                label="Új jelszó"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                type="password"
                label="Új jelszó megerősítése"
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
                Jelszó visszaállítás
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
              Vissza a belépéshez
            </Link>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Recover; 