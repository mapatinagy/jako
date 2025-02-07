import { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  TextField, 
  Button, 
  Alert,
  Divider
} from '@mui/material';
import { Helmet } from 'react-helmet-async';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

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

  const validateForm = () => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus({ type: null, message: '' });

    if (!validateForm()) {
      return;
    }

    try {
      // Here you would typically send the form data to your backend
      // For now, we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitStatus({
        type: 'success',
        message: 'Thank you for your message! We will get back to you soon.'
      });
      
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: ''
      });
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'Failed to send message. Please try again later.'
      });
    }
  };

  const handleInputChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  return (
    <Box sx={{ py: 6, bgcolor: 'background.default' }}>
      <Helmet>
        <title>Contact Us - Fishing Shop</title>
        <meta name="description" content="Get in touch with our fishing shop. Contact us for inquiries about our fishing equipment, animal feed, plants, or any other questions." />
        <meta name="keywords" content="contact fishing shop, fishing shop contact, customer service, contact form" />
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
                left: '50%',
                transform: 'translateX(-50%)',
                width: 100,
                height: 3,
                bgcolor: 'primary.main',
                borderRadius: 1
              }
            }}
          >
            Contact Us
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto', mt: 3 }}>
            We're here to help and answer any questions you might have
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
                Get in Touch
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              {/* Contact Information */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                  <LocationOnIcon color="primary" sx={{ mr: 2, fontSize: 28, mt: 0.5 }} />
                  <Box>
                    <Typography variant="body1" color="text.secondary">
                      Hauptstraße 123<br />
                      20095 Hamburg<br />
                      Germany
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                  <EmailIcon color="primary" sx={{ mr: 2, fontSize: 28, mt: 0.5 }} />
                  <Box>
                    <Typography variant="body1" color="text.secondary">
                      info@fishing-shop.com
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 4 }}>
                  <PhoneIcon color="primary" sx={{ mr: 2, fontSize: 28, mt: 0.5 }} />
                  <Box>
                    <Typography variant="body1" color="text.secondary">
                      +49 (0) 123 456789
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Google Maps Integration */}
              <Box sx={{ width: '100%', height: 300, mb: 2 }}>
                <iframe
                  title="Store Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2370.2089037461697!2d9.993870776677766!3d53.55131997231989!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47b18f1c3d3c6e45%3A0x1f4dd4d2c9d2590!2sHauptstra%C3%9Fe%2C%20Hamburg%2C%20Germany!5e0!3m2!1sen!2sus!4v1709246400000!5m2!1sen!2sus"
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
                Send us a Message
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Box component="form" onSubmit={handleSubmit}>
                {submitStatus.type && (
                  <Alert 
                    severity={submitStatus.type} 
                    sx={{ mb: 3 }}
                    onClose={() => setSubmitStatus({ type: null, message: '' })}
                  >
                    {submitStatus.message}
                  </Alert>
                )}

                <TextField
                  fullWidth
                  label="Name"
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
                  label="Phone Number (optional)"
                  value={formData.phone}
                  onChange={handleInputChange('phone')}
                  sx={{ mb: 3 }}
                />

                <TextField
                  fullWidth
                  label="Message"
                  required
                  multiline
                  rows={6}
                  value={formData.message}
                  onChange={handleInputChange('message')}
                  error={!!errors.message}
                  helperText={errors.message}
                  sx={{ mb: 3 }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  sx={{
                    py: 1.5,
                    transition: 'transform 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  Send Message
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Contact; 