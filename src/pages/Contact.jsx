import { motion } from 'framer-motion';
import { phone } from '../data';
import useFetch from '../hooks/useFetch';
import { useI18n } from '../i18n.jsx';

export default function Contact() {
  const { data: site } = useFetch('/api/site');
  const { t } = useI18n();
  return (
    <motion.section
      className="py-16 md:py-20 bg-gedo-cream"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="font-playfair text-4xl text-gedo-green mb-6">{t('contact.title')}</h1>

        <div className="mb-6 md:mb-8">
          <h3 className="font-playfair text-xl text-gedo-green mb-2">{t('contact.callUs')}</h3>
          <a href={`tel:${site?.contactPhone || phone}`} className="text-gedo-gold text-lg hover:underline">
            {site?.contactPhone || phone}
          </a>
        </div>

        <div className="mb-6 md:mb-8">
          <h3 className="font-playfair text-xl text-gedo-green mb-2">{t('contact.visitUs')}</h3>
          <p className="text-gedo-brown">
            {site?.contactAddress || (
              <>
                Str. Ion Maiorescu 18, Obor <br /> Bucharest, Romania
              </>
            )}
          </p>
        </div>

          <div className="h-64 w-full rounded-lg overflow-hidden shadow-md">
            <iframe
              title="map"
              src={site?.mapEmbedUrl || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2848.1495794762375!2d26.11831591553598!3d44.448180579102395!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40b1fff4c02a0a27%3A0x4b37b3303ef1d640!2sStrada%20Ion%20Maiorescu%2018%2C%20Bucure%C8%99ti%20030671!5e0!3m2!1sen!2sro!4v1691498320221!5m2!1sen!2sro'}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
      </div>
    </motion.section>
  );
}
