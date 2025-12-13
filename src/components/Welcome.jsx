import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { useI18n } from '../i18n.jsx';

export default function Welcome() {
  const { data: site } = useFetch('/api/site');
  const { t, lang } = useI18n();
  return (
    <motion.section
      id="welcome"
      className="py-16 bg-gedo-cream"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl text-gedo-green mb-6 md:mb-8 relative inline-block leading-tight">
            {lang === 'ro'
              ? site?.welcomeTitle_ro || site?.welcomeTitle || 'Bine ai venit la Gedo'
              : site?.welcomeTitle_en || site?.welcomeTitle || 'Welcome to Gedo'}
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gedo-gold"></span>
          </h2>

          <p className="text-gedo-brown text-base sm:text-lg mb-8 leading-relaxed">
            {lang === 'ro'
              ? site?.welcomeText_ro || site?.welcomeText || 'Fondat de Chef Mahmoud „Gedo” Ibrahim în 2018...'
              : site?.welcomeText_en || site?.welcomeText || `Founded by Chef Mahmoud "Gedo" Ibrahim in 2018, our restaurant brings the authentic flavors of Sudan and the Middle East to Romania. Every dish is prepared with traditional recipes passed down through generations, using carefully selected ingredients that capture the essence of our homeland.`}
          </p>

          <div className="flex justify-center">
            <Link to="/about" className="inline-flex items-center text-gedo-green font-medium hover:text-gedo-gold transition">
              {t('misc.readStory')} <i className="fa-solid fa-arrow-right ml-2"></i>
            </Link>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
