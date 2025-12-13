import { motion } from 'framer-motion';
import { phone } from '../data';
import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import ScrollHint from './ScrollHint';
import { useI18n } from '../i18n.jsx';
import { getImageUrl } from '../api.js';
import heroLocal from '../../images/hero_img.webp';
import logoLocal from '../../images/Gedo_Logo.png';

export default function Hero() {
  const { data: site } = useFetch('/api/site');
  const displayPhone = site?.contactPhone || phone;
  const { t, lang } = useI18n();
  return (
    <section
      id="hero"
      className="pt-28 md:pt-36 min-h-[70vh] relative overflow-hidden bg-gedo-green bg-opacity-95 bg-center"
      style={{
        backgroundImage: `url(${site?.heroBackgroundUrl ? getImageUrl(site.heroBackgroundUrl) : heroLocal})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-gedo-green/70 to-gedo-green/95"></div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center pt-8 md:pt-16"
        >
          {/* Logo plate */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-56 h-56 md:w-72 md:h-72 rounded-full border-gedo-gold/30 border-2 spin-slower"></div>
            </div>
            <div className="w-44 h-44 md:w-60 md:h-60 bg-white rounded-full shadow-hover flex items-center justify-center border-8 border-gedo-cream overflow-hidden pulse-glow">
              <img
                src={site?.logoUrl ? getImageUrl(site.logoUrl) : logoLocal}
                alt="logo"
                className="w-full h-full object-cover"
                width="240"
                height="240"
                loading="eager"
                decoding="sync"
                fetchpriority="high"
              />
            </div>
          </div>
          <ScrollHint />

          <h1 className="font-playfair text-3xl sm:text-4xl md:text-5xl text-white font-bold mb-4 max-w-4xl leading-tight">
            {lang === 'ro'
              ? site?.heroTitle_ro || site?.heroTitle || 'Bucătărie sudaneză și arabă autentică în București'
              : site?.heroTitle_en || site?.heroTitle || 'Authentic Sudanese & Arabic Cuisine in Bucharest'}
          </h1>

          <p className="text-gedo-cream text-base sm:text-lg md:text-xl mb-10 max-w-2xl">
            {lang === 'ro'
              ? site?.heroSubtitle_ro || site?.heroSubtitle || 'Caldura mâncărurilor de acasă și arome bogate, de la Khartoum la Obor'
              : site?.heroSubtitle_en || site?.heroSubtitle || 'Home-cooked warmth and rich flavors from Khartoum to Obor'}
          </p>

          <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4 lg:space-x-6">
            <Link to="/menu" className="px-8 py-3 bg-white text-gedo-green font-medium rounded-full shadow-md hover:shadow-lg transition duration-300 transform hover:-translate-y-1">
              <i className="fa-solid fa-utensils mr-2"></i> {t('hero.viewMenu')}
            </Link>
            <a href={`tel:${displayPhone}`} className="px-8 py-3 bg-gedo-gold text-white font-medium rounded-full shadow-md hover:shadow-lg transition duration-300 transform hover:-translate-y-1">
              <i className="fa-regular fa-calendar-check mr-2"></i> {t('hero.call')} {displayPhone}
            </a>
          </div>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div
        className="absolute bottom-0 left-0 w-full h-16 bg-gedo-cream"
        style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 0, 0 100%)' }}
      ></div>
      <div
        className="absolute bottom-0 left-0 w-full h-24 bg-gedo-cream opacity-30"
        style={{ clipPath: 'polygon(0 100%, 100% 100%, 0 0)' }}
      ></div>
    </section>
  );
}
