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
      main: '#0284c7',
    },
    background: {
      default: '#f5f5f5',
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
