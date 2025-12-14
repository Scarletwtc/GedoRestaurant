import { motion } from 'framer-motion';
import { useI18n } from '../i18n.jsx';
import useFetch from '../hooks/useFetch';

export default function About() {
  const { lang } = useI18n();
  const { data: site } = useFetch('/api/site');
  return (
    <motion.section
      className="py-16 md:py-20 bg-white"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="font-playfair text-3xl sm:text-4xl md:text-5xl text-gedo-green mb-6 text-center leading-tight">
          {lang === 'ro' ? (site?.aboutTitle_ro || 'Povestea noastră') : (site?.aboutTitle_en || 'Our Story')}
        </h1>
        <div className="text-gedo-brown leading-relaxed space-y-4 whitespace-pre-line text-base sm:text-lg">
          {lang === 'ro' ? (site?.aboutBody_ro || '') : (site?.aboutBody_en || '')}
        </div>
      </div>
    </motion.section>
  );
}
