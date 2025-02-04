import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import News from './pages/News';
import Contact from './pages/Contact';
import Imprint from './pages/Imprint';

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
    fontFamily: '"Roboto", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
      color: '#1b5e20',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
      color: '#2e7d32',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
      color: '#2e7d32',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
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
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
