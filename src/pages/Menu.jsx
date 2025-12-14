import DishCard from '../components/DishCard';
import { motion } from 'framer-motion';
import useFetch from '../hooks/useFetch';
import { useI18n } from '../i18n.jsx';
import { useMemo, useState } from 'react';

export default function Menu() {
  const { data, loading, error } = useFetch('/api/dishes');
  const dishes = Array.isArray(data) ? data : [];
  const { data: categoriesData } = useFetch('/api/categories');
  const categories = Array.isArray(categoriesData) ? categoriesData : [];
  const [active, setActive] = useState('all');
  const { t } = useI18n();

  const grouped = useMemo(() => {
    const map = new Map();
    categories.forEach((c) => map.set(c.id, { info: c, items: [] }));
    (dishes || []).forEach((d) => {
      const key = d.categoryId && map.has(d.categoryId) ? d.categoryId : 'uncategorized';
      if (!map.has(key)) map.set(key, { info: { id: 'uncategorized', name: 'Others', order: 999 }, items: [] });
      map.get(key).items.push(d);
    });
    // Build ordered array including 'all'
    return Array.from(map.values()).sort((a,b) => (a.info.order||0)-(b.info.order||0));
  }, [dishes, categories]);

  return (
    <motion.section
      className="py-16 md:py-20 bg-gedo-cream min-h-[60vh]"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="font-playfair text-3xl sm:text-4xl text-gedo-green mb-3 md:mb-4">{t('signature.viewFull')}</h1>
          <p className="text-gedo-brown max-w-2xl mx-auto text-base sm:text-lg">
            {t('misc.todaysSpecial')}
          </p>
        </div>

        {loading && <p className="text-center">Loading…</p>}
        {error && <p className="text-center text-gedo-red">Failed to load menu</p>}

        {/* Category chips */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          <button className={`px-4 py-2 rounded-full border ${active==='all'?'bg-gedo-green text-white border-gedo-green':'border-gedo-green text-gedo-green'}`} onClick={()=>setActive('all')}>All</button>
          {categories.map((c)=> (
            <button key={c.id} className={`px-4 py-2 rounded-full border ${active===c.id?'bg-gedo-green text-white border-gedo-green':'border-gedo-green text-gedo-green'}`} onClick={()=>setActive(c.id)}>{c.name}</button>
          ))}
        </div>

        {/* Sections by category */}
        {active==='all' ? (
          grouped.map((g) => (
            <div key={g.info.id} className="mb-10">
              <h3 className="font-playfair text-2xl text-gedo-green mb-4">{g.info.name}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {g.items.map((dish)=> <DishCard key={dish.id} dish={dish} />)}
              </div>
            </div>
          ))
        ) : (
          (()=>{
            const g = grouped.find((x)=>x.info.id===active);
            if (!g) return <p className="text-center text-gedo-brown">No dishes in this category.</p>;
            return (
              <div className="mb-10">
                <h3 className="font-playfair text-2xl text-gedo-green mb-4">{g.info.name}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {g.items.map((dish)=> <DishCard key={dish.id} dish={dish} />)}
                </div>
              </div>
            );
          })()
        )}
      </div>
    </motion.section>
  );
}
