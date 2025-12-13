import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const I18nContext = createContext({ lang: 'en', setLang: () => {}, t: (k) => k });

const translations = {
  en: {
    nav: { home: 'Home', menu: 'Menu', about: 'About', contact: 'Contact', gallery: 'Gallery', admin: 'Admin' },
    hero: { viewMenu: 'View Menu', call: 'Call' },
    signature: { title: 'Our Signature Dishes', viewFull: 'View Full Menu' },
    testimonials: { title: 'What Our Guests Say', leave: 'Leave a Review' },
    reservation: { title: 'Reserve / Order' },
    contact: { title: 'Get in Touch', callUs: 'Call Us', visitUs: 'Visit Us' },
    footer: { about: 'Gedo Restaurant', contactUs: 'Contact Us', opening: 'Opening Hours', findUs: 'Find Us', directions: 'Get Directions' },
    misc: { todaysSpecial: "Today's Special", readStory: 'Read Our Story', callToOrder: 'Call to Order' },
  },
  ro: {
    nav: { home: 'Acasă', menu: 'Meniu', about: 'Despre', contact: 'Contact', gallery: 'Galerie', admin: 'Admin' },
    hero: { viewMenu: 'Vezi meniul', call: 'Sună' },
    signature: { title: 'Preparate semnătură', viewFull: 'Vezi tot meniul' },
    testimonials: { title: 'Ce spun oaspeții noștri', leave: 'Lasă o recenzie' },
    reservation: { title: 'Rezervări / Comenzi' },
    contact: { title: 'Contactează-ne', callUs: 'Sună-ne', visitUs: 'Vizitează-ne' },
    footer: { about: 'Restaurant Gedo', contactUs: 'Contact', opening: 'Program', findUs: 'Găsește-ne', directions: 'Indicații' },
    misc: { todaysSpecial: 'Specialitatea zilei', readStory: 'Citește povestea noastră', callToOrder: 'Sună pentru comandă' },
  },
};

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'en');
  useEffect(() => { localStorage.setItem('lang', lang); }, [lang]);
  const t = useMemo(() => {
    const dict = translations[lang] || translations.en;
    return (key) => key.split('.').reduce((acc, k) => (acc && acc[k] != null ? acc[k] : null), dict) || key;
  }, [lang]);
  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

