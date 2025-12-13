import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import BackgroundFX from './components/BackgroundFX';
import ScrollToTop from './components/ScrollToTop';
import FloatingCTA from './components/FloatingCTA';
import { I18nProvider } from './i18n.jsx';
import Footer from './components/Footer';
import Home from './pages/Home';
import Menu from './pages/Menu';
import About from './pages/About';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import GalleryPage from './pages/Gallery';

export default function App() {
  return (
    <BrowserRouter>
      <I18nProvider>
        <BackgroundFX />
        <Header />
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/admin" element={<Admin />} />
        </Routes>
        <Footer />
        <ScrollToTop />
        <FloatingCTA />
      </I18nProvider>
    </BrowserRouter>
  );
}
