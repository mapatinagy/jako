import { useState, useRef } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  TextField, 
  Button, 
  Alert,
  Divider,
  CircularProgress,
  Link
} from '@mui/material';
import { Helmet } from 'react-helmet-async';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import emailjs from '@emailjs/browser';
import ReCAPTCHA from "react-google-recaptcha";
import { Link as RouterLink } from 'react-router-dom';

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

// Replace the environment variable declarations
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

const Contact = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>('success');
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const handleInputChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    let value = e.target.value;

    // Phone number validation - only allow numbers and + symbol
    if (field === 'phone') {
      value = value.replace(/[^\d+]/g, '');
    }

    // Message length validation
    if (field === 'message' && value.length > 300) {
      return; // Don't update if exceeding 300 characters
    }

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'A név megadása kötelező';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Az email cím megadása kötelező';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Érvénytelen email formátum';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Az üzenet megadása kötelező';
    } else if (formData.message.length > 300) {
      newErrors.message = 'Az üzenet nem lehet hosszabb 300 karakternél';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !captchaToken) {
      setAlertSeverity('error');
      setAlertMessage('Kérjük, igazolja, hogy nem robot!');
      setShowAlert(true);
      return;
    }

    setIsLoading(true);

    try {
      // Add rate limiting check
      const lastSubmission = localStorage.getItem('lastSubmission');
      const now = Date.now();
      if (lastSubmission && now - parseInt(lastSubmission) < 60000) { // 1 minute cooldown
        throw new Error('Kérjük várjon egy percet az újabb üzenet küldése előtt.');
      }

      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: formData.name,
          from_email: formData.email,
          from_phone: formData.phone || '',
          message: formData.message,
          'g-recaptcha-response': captchaToken,
        },
        EMAILJS_PUBLIC_KEY
      );

      if (response.status === 200) {
        localStorage.setItem('lastSubmission', now.toString());
        setAlertSeverity('success');
        setAlertMessage('Üzenet sikeresen elküldve!');
        setShowAlert(true);
        
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: ''
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setAlertSeverity('error');
      setAlertMessage('Hiba történt az üzenet küldése során. Kérjük próbálja újra később.');
      setShowAlert(true);
    } finally {
      setIsLoading(false);
      setCaptchaToken(null);
      recaptchaRef.current?.reset();
    }
  };

  return (
    <Box sx={{ py: 6, bgcolor: 'background.default' }}>
      <Helmet>
        <title>Kapcsolat - Jákó Díszállat és Horgászbolt</title>
        <meta name="description" content="Lépjen kapcsolatba horgászboltunkkal! Forduljon hozzánk bizalommal horgászfelszereléseinkkel, állateledelünkkel, növényeinkkel vagy bármilyen egyéb kérdésével kapcsolatban." />
        <meta name="keywords" content="kapcsolat, ügyfélszolgálat, kérdés, kérdés horgászatrl, kérdés állateledelről, kérdés növényekről" />
      </Helmet>

      <Container maxWidth="lg">
        {/* Header Section */}
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
                left: 0,
                width: '100%',
                height: 3,
                bgcolor: 'primary.main',
                borderRadius: 1
              }
            }}
          >
            Kapcsolat
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto', mt: 3 }}>
            Bármilyen kérdése van termékeinkkel és szolgáltatásainkkal kapcsolatban, ne habozzon felvenni velünk a kapcsolatot!
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Left Column - Contact Info & Map */}
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 4,
                height: '100%',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)'
                }
              }}
            >
              <Typography variant="h3" color="primary" gutterBottom>
                Kapcsolat
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              {/* Contact Information */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                  <LocationOnIcon color="primary" sx={{ mr: 2, fontSize: 28, mt: 0.5 }} />
                  <Box>
                    <Typography variant="body1" color="text.secondary">
                      5630 Békés Szánthó Albert utca 4.<br />                                            
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                  <EmailIcon color="primary" sx={{ mr: 2, fontSize: 28, mt: 0.5 }} />
                  <Box>
                    <Typography variant="body1" color="text.secondary">
                      info@jakobekes.hu
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 4 }}>
                  <PhoneIcon color="primary" sx={{ mr: 2, fontSize: 28, mt: 0.5 }} />
                  <Box>
                    <Typography variant="body1" color="text.secondary">
                      +36 30 471 7047
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Google Maps Integration */}
              <Box sx={{ width: '100%', height: 490, mb: 2 }}>
                <iframe
                  title="Store Location"
                  src="https://www.google.com/maps?q=46.77351657480384,21.13216451780124&z=16&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0, borderRadius: '8px' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </Box>
            </Paper>
          </Grid>

          {/* Right Column - Contact Form */}
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 4,
                height: '100%',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)'
                }
              }}
            >
              <Typography variant="h3" color="primary" gutterBottom>
                Üzenjen nekünk!
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Box component="form" onSubmit={handleSubmit}>
                {showAlert && (
                  <Alert 
                    severity={alertSeverity} 
                    sx={{ mb: 3 }}
                    onClose={() => setShowAlert(false)}
                  >
                    {alertMessage}
                  </Alert>
                )}

                <TextField
                  fullWidth
                  label="Név"
                  required
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  error={!!errors.name}
                  helperText={errors.name}
                  sx={{ mb: 3 }}
                />

                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  error={!!errors.email}
                  helperText={errors.email}
                  sx={{ mb: 3 }}
                />

                <TextField
                  fullWidth
                  label="Telefonszám (opcionális)"
                  value={formData.phone}
                  onChange={handleInputChange('phone')}
                  inputProps={{
                    pattern: '[0-9+]*'  // HTML5 validation for numbers and +
                  }}
                  sx={{ mb: 3 }}
                />

                <TextField
                  fullWidth
                  label="Üzenet"
                  required
                  multiline
                  rows={6}
                  value={formData.message}
                  onChange={handleInputChange('message')}
                  error={!!errors.message}
                  helperText={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{errors.message || ' '}</span>
                      <span style={{ color: formData.message.length > 280 ? '#ff9800' : 'inherit' }}>
                        {formData.message.length}/300
                      </span>
                    </Box>
                  }
                  sx={{ mb: 3 }}
                />

                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={RECAPTCHA_SITE_KEY}
                  onChange={(token) => setCaptchaToken(token)}
                  style={{ marginBottom: '24px' }}
                  hl="hu"
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={isLoading}
                  sx={{
                    py: 1.5,
                    transition: 'transform 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  {isLoading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} color="inherit" />
                      <span>Küldés...</span>
                    </Box>
                  ) : (
                    'Üzenet küldése'
                  )}
                </Button>

                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ mt: 2, textAlign: 'center' }}
                >
                  A "Üzenet küldése" gombra kattintva elfogadja az{' '}
                  <Link
                    component={RouterLink}
                    to="/privacy"
                    sx={{
                      color: 'primary.main',
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    Adatkezelési tájékoztatónkat
                  </Link>.
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Contact; 