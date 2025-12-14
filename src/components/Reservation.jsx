import { motion } from 'framer-motion';
import { phone } from '../data';
import useFetch from '../hooks/useFetch';
import { useI18n } from '../i18n.jsx';

export default function Reservation() {
  const { data: site } = useFetch('/api/site');
  const tel = site?.contactPhone || phone;
  const wa = (tel || '').replace(/[^\d]/g, '');
  const { t } = useI18n();
  return (
    <motion.section
      id="reserve"
      className="py-16 bg-gedo-green relative overflow-hidden"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="absolute inset-0 bg-arabic-pattern opacity-10"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-playfair text-3xl md:text-4xl text-white mb-6">{t('reservation.title')}</h2>
          <p className="text-gedo-cream text-lg mb-8">
            Call us directly and we’ll happily secure your table or prepare your takeaway.
          </p>

          <div className="flex items-center justify-center gap-4">
            <a
              href={`tel:${tel}`}
              className="inline-block px-8 py-3 bg-gedo-gold text-white font-medium rounded-full shadow-md hover:bg-white hover:text-gedo-green transition duration-300"
            >
              {tel}
            </a>
            <a
              href={`https://wa.me/${wa}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-full shadow-md hover:shadow-lg transition"
            >
              <i className="fa-brands fa-whatsapp"></i> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
