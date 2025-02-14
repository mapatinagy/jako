import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { HelmetProvider } from 'react-helmet-async';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import News from './pages/News';
import Contact from './pages/Contact';
import Imprint from './pages/Imprint';
import AdminLogin from './pages/admin/Login';
import AdminRecover from './pages/admin/Recover';
import AdminDashboard from './pages/admin/Dashboard';
import AdminGallery from './pages/admin/gallery/Gallery';
import AdminNews from './pages/admin/news/News';
import AdminSettings from './pages/admin/Settings';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useEffect } from 'react';
import SeasonalProducts from './pages/admin/SeasonalProducts';
import Seasonal from './pages/Seasonal';
import Privacy from './pages/Privacy';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32', // Forest green
      light: '#4caf50', // Lighter green
      dark: '#1b5e20', // Dark forest green
    },
    secondary: {
      main: '#81c784', // Sage green
      light: '#a5d6a7',
      dark: '#66bb6a',
    },
    background: {
      default: '#f5f7f5', // Very light sage
      paper: '#ffffff',
    },
    text: {
      primary: '#1c2121', // Dark green-gray
      secondary: '#2e3636', // Medium green-gray
    },
  },
  typography: {
    fontFamily: '"Quicksand", "Segoe UI", "Helvetica Neue", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      color: '#1b5e20',
      letterSpacing: '0.02em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
      color: '#2e7d32',
      letterSpacing: '0.01em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
      color: '#2e7d32',
    },
    h5: {
      fontWeight: 300,
    },
    h6: {
      fontWeight: 400,
    },
    body1: {
      fontWeight: 400,
      letterSpacing: '0.01em',
      lineHeight: 1.7,
    },
    body2: {
      fontWeight: 400,
      letterSpacing: '0.01em',
      lineHeight: 1.6,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1b5e20', // Dark forest green
        },
      },
    },
  },
});

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <CssBaseline />
          <Router>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="gallery" element={<Gallery />} />
                <Route path="news">
                  <Route index element={<News />} />
                  <Route path=":id" element={<News />} />
                </Route>
                <Route path="contact" element={<Contact />} />
                <Route path="imprint" element={<Imprint />} />
                <Route path="seasonal" element={<Seasonal />} />
                <Route path="privacy" element={<Privacy />} />
              </Route>
              
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/recover" element={<AdminRecover />} />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/gallery"
                element={
                  <ProtectedRoute>
                    <AdminGallery />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/news"
                element={
                  <ProtectedRoute>
                    <AdminNews />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute>
                    <AdminSettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/seasonal"
                element={
                  <ProtectedRoute>
                    <SeasonalProducts />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </LocalizationProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
