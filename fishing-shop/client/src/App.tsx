import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import News from './pages/News';
import Contact from './pages/Contact';
import Imprint from './pages/Imprint';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminGallery from './pages/admin/gallery/Gallery';
import ProtectedRoute from './components/auth/ProtectedRoute';

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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="gallery" element={<Gallery />} />
              <Route path="news" element={<News />} />
              <Route path="contact" element={<Contact />} />
              <Route path="imprint" element={<Imprint />} />
            </Route>
            
            <Route path="/admin/login" element={<AdminLogin />} />
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
          </Routes>
        </Router>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
