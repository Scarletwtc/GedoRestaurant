import { useEffect, useState } from 'react';
import useFetch from '../hooks/useFetch';
import LanguageToggle from './LanguageToggle';
import { useI18n } from '../i18n.jsx';
import { motion } from 'framer-motion';
import { phone } from '../data';
import { Link, useLocation } from 'react-router-dom';
import { getImageUrl } from '../api.js';
import logoLocal from '../../images/Gedo_Logo.png';

const navItems = [
  { name: 'home', path: '/' },
  { name: 'menu', path: '/menu' },
  { name: 'about', path: '/about' },
  { name: 'contact', path: '/contact' },
  { name: 'gallery', path: '/gallery' },
  { name: 'admin', path: '/admin' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [elevated, setElevated] = useState(false);
  const location = useLocation();
  const { data: site } = useFetch('/api/site');
  const phoneNum = site?.contactPhone || phone;
  const { lang, setLang, t } = useI18n();

  useEffect(() => {
    const onScroll = () => setElevated(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const linkBase =
    'text-gedo-green hover:text-gedo-gold transition cursor-pointer font-medium';

  return (
    <motion.header
      initial={{ y: -60 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed w-full z-50 transition duration-300 ${
        elevated ? 'bg-white/90 backdrop-blur shadow-lg' : 'bg-white/95'
      }`}
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 md:py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img
            src={site?.logoUrl ? getImageUrl(site.logoUrl) : logoLocal}
            alt="logo"
            className="w-14 h-14 rounded-full object-cover mr-3 shadow-card"
            width="56"
            height="56"
            loading="eager"
            decoding="sync"
            fetchpriority="high"
          />
          <div>
            <h1 className="font-playfair text-gedo-green text-2xl font-bold">Gedo</h1>
            <p className="text-xs text-gedo-brown -mt-1">
              {lang === 'ro' ? (site?.tagline_ro || 'Restaurant sudanez și arab') : (site?.tagline_en || 'Sudanese & Arabic Restaurant')}
            </p>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`${linkBase} ${location.pathname === item.path ? 'text-gedo-gold' : ''}`}
            >
              {t(`nav.${item.name.toLowerCase()}`)}
            </Link>
          ))}
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent('Gedo Restaurant')}`}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 border border-gedo-green rounded-full text-sm hover:bg-gedo-green hover:text-white transition"
          >
            {t('footer.directions')}
          </a>
          <LanguageToggle value={lang} onChange={setLang} />
        </nav>

        {/* Right actions */}
        <div className="flex items-center space-x-4">
          <a
            href={`tel:${phoneNum}`}
            className="hidden md:block px-4 py-2 border-2 border-gedo-green text-gedo-green rounded-full hover:bg-gedo-green hover:text-white transition duration-300"
          >
            Call {phoneNum}
          </a>
          <button
            className="md:hidden text-gedo-green text-xl"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <i className="fa-solid fa-bars"></i>
          </button>
        </div>
      </div>

        {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden bg-white shadow-inner">
          <div className="flex flex-col space-y-4 px-4 sm:px-6 py-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={linkBase}
                onClick={() => setMobileOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <a
              href={`tel:${phoneNum}`}
              className="px-4 py-2 border-2 border-gedo-green text-gedo-green rounded-full hover:bg-gedo-green hover:text-white transition duration-300 w-max"
              onClick={() => setMobileOpen(false)}
            >
              Call {phoneNum}
            </a>
          </div>
        </div>
      )}
    </motion.header>
  );
}
