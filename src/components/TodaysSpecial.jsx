import { motion } from 'framer-motion';
import { phone } from '../data';
import useFetch from '../hooks/useFetch';
import { useI18n } from '../i18n.jsx';
import { getImageUrl } from '../api.js';

export default function TodaysSpecial() {
  const { data: site } = useFetch('/api/site');
  const specialId = site?.todaysSpecialDishId;
  const { data: dish } = useFetch(specialId ? `/api/dishes/${specialId}` : null);
  const tel = site?.contactPhone || phone;
  const { t } = useI18n();
  return (
    <motion.section
      id="todays-special"
      className="py-16 bg-gedo-cream relative"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="md:w-1/2 p-8 md:p-12">
            <span className="inline-block px-4 py-1 bg-gedo-red text-white text-sm rounded-full mb-6">
              {t('misc.todaysSpecial')}
            </span>
            <h2 className="font-playfair text-3xl text-gedo-green mb-4">{dish?.name || '—'}</h2>
            <p className="text-gedo-brown mb-6 leading-relaxed">
              {dish?.description || 'Discover today\'s chef special from our menu.'}
            </p>
            <div className="flex items-center mb-6">
              {dish?.price != null && (
                <span className="text-gedo-gold text-2xl font-playfair mr-2">{dish.price} Lei</span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="flex items-center text-sm text-gedo-brown">
                <i className="fa-regular fa-clock mr-2 text-gedo-gold"></i> {t('misc.availableUntil')}
              </span>
              <a href={`tel:${tel}`} className="px-6 py-2 bg-gedo-green text-white text-sm rounded-full hover:bg-gedo-gold transition duration-300">
                Call {tel}
              </a>
            </div>
          </div>
          <div className="md:w-1/2 h-80 md:h-auto">
            <img
              className="w-full h-full object-cover"
              src={dish?.image ? getImageUrl(dish.image) : 'https://storage.googleapis.com/uxpilot-auth.appspot.com/bf87ee1b13-a6b52c2f841c2ef4adf2.png'}
              alt={dish?.name || 'Today\'s special'}
            />
          </div>
        </div>
      </div>
    </motion.section>
  );
}
