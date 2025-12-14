import { motion } from 'framer-motion';
import { useI18n } from '../i18n.jsx';
import { getImageUrl } from '../api.js';

export default function DishCard({ dish = {} }) {
  const { t } = useI18n();
  return (
    <motion.div
      id={`dish-${dish.id}`}
      className="bg-white rounded-xl shadow-card overflow-hidden transform transition duration-300 ease-out-soft hover:-translate-y-1.5 hover:shadow-hover animate-fadeUp"
      whileHover={{ scale: 1.02 }}
    >
      <div className="h-56 md:h-64 overflow-hidden">
        <img className="w-full h-full object-cover" src={getImageUrl(dish.image)} alt={dish.name} loading="lazy" />
      </div>
      <div className="p-5 md:p-6 border-t-4 border-gedo-green">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-playfair text-xl md:text-2xl text-gedo-green">{dish.name}</h3>
          <span className="text-gedo-red font-semibold">{dish.price} Lei</span>
        </div>
        <p className="text-gedo-brown text-sm md:text-base mb-4 line-clamp-3">{dish.description}</p>
        <div className="flex justify-between items-center">
          {dish.badge && (
            <span className="text-xs md:text-sm text-gedo-gold flex items-center">
              <i className={`fa-solid ${dish.badge.icon} mr-1`}></i> {dish.badge.text}
            </span>
          )}
          <a href="#reserve" className="text-gedo-green hover:text-gedo-gold transition transform hover:-translate-y-0.5 flex items-center gap-1">
            <i className="fa-solid fa-phone"></i>
            <span className="text-sm">{t('misc.callToOrder')}</span>
          </a>
        </div>
      </div>
    </motion.div>
  );
}
