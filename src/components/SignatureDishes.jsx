import DishCard from './DishCard';
import { motion } from 'framer-motion';
import useFetch from '../hooks/useFetch';
import { Link } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useI18n } from '../i18n.jsx';

export default function SignatureDishes() {
  const { t } = useI18n();
  const { data, loading, error } = useFetch('/api/dishes');
  const dishes = Array.isArray(data) ? data : [];
  const { data: site } = useFetch('/api/site');
  const showcaseIds = site?.signatureDishIds || [];
  const showcase = useMemo(
    () => (showcaseIds.length ? dishes.filter((d) => showcaseIds.includes(d.id)) : dishes),
    [dishes, showcaseIds]
  );

  const [paused, setPaused] = useState(false);
  const resumeTimer = useRef(null);
  const containerRef = useRef(null);
  const rafRef = useRef(0);

  function scheduleResume(delayMs = 3000) {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setPaused(false), delayMs);
  }

  function pauseAutoScroll() {
    if (!paused) setPaused(true);
    scheduleResume(3000);
  }

  // Smooth auto-scroll using scrollLeft instead of CSS animation (prevents fighting user scroll)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let lastTs = 0;
    const speedPxPerSec = 80; // faster auto-scroll

    const tick = (ts) => {
      if (!lastTs) lastTs = ts;
      const dt = (ts - lastTs) / 1000;
      lastTs = ts;
      if (!paused) {
        const half = container.scrollWidth / 2;
        const next = container.scrollLeft + speedPxPerSec * dt;
        // If user took control (pointer down / wheel), paused will be true and we won't run
        // When auto-scrolling, wrap seamlessly at half width
        if (next >= half) {
          container.scrollLeft = next - half;
        } else {
          container.scrollLeft = next;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [paused, showcase.length]);

  return (
    <motion.section
      id="signature-dishes"
      className="py-20 bg-white relative overflow-hidden"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="absolute inset-0 bg-arabic-pattern opacity-5"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-14">
          <h2 className="font-playfair text-3xl md:text-4xl text-gedo-green mb-3">{t('signature.title')}</h2>
          <p className="text-gedo-brown max-w-2xl mx-auto">
            Explore our most beloved dishes, carefully crafted with authentic spices and traditional
            techniques
          </p>
        </div>

        {loading && <p className="text-center">Loading…</p>}
        {error && <p className="text-center text-gedo-red">Failed to load dishes</p>}

        <div
          className={`marquee-container pb-2 ${paused ? 'marquee-paused' : ''}`}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => scheduleResume(1000)}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => scheduleResume(1500)}
          onPointerDown={() => setPaused(true)}
          onPointerUp={() => scheduleResume(1500)}
          onWheel={pauseAutoScroll}
          onScroll={pauseAutoScroll}
          ref={containerRef}
        >
          <div
            className="marquee-track cursor-grab active:cursor-grabbing"
            style={{ animation: 'none' }}
          >
            {showcase.concat(showcase).map((dish, idx) => (
              <div key={`${dish.id}-${idx}`} className="min-w-[280px] md:min-w-[320px]">
                <DishCard dish={dish} />
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <Link
            to="/menu"
            className="inline-block px-8 py-3 bg-gedo-green text-white font-medium rounded-full shadow-md hover:shadow-lg transition duration-300"
          >
            {t('signature.viewFull')}
          </Link>
        </div>
      </div>
    </motion.section>
  );
}


