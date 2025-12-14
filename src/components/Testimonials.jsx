import TestimonialCard from './TestimonialCard';
import { motion } from 'framer-motion';
import useFetch from '../hooks/useFetch';
import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n.jsx';
import { apiUrl } from '../api.js';

export default function Testimonials() {
  const { t } = useI18n();
  const { data, loading, error } = useFetch('/api/testimonials');
  const testimonials = Array.isArray(data) ? data : [];
  // Use CSS marquee for buttery infinite scroll; users can still scroll
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', quote: '', stars: 5 });

  return (
    <motion.section
      id="testimonials"
      className="py-20 bg-white relative"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="absolute inset-0 bg-arabic-pattern opacity-5"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-14">
          <h2 className="font-playfair text-3xl md:text-4xl text-gedo-green mb-3">{t('testimonials.title')}</h2>
          <p className="text-gedo-brown max-w-2xl mx-auto">
            The authentic taste of Sudan and the Middle East in the heart of Bucharest
          </p>
        </div>

        {loading && <p className="text-center">Loading…</p>}
        {error && <p className="text-center text-gedo-red">Failed to load testimonials</p>}

        <div className="marquee-container pb-2">
          <div className="marquee-track">
            {testimonials.concat(testimonials).map((t, idx) => (
              <div key={`${t.id}-${idx}`} className="min-w-[300px] md:min-w-[360px]">
                <TestimonialCard testimonial={t} />
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-10">
          <button
            className="px-6 py-3 bg-gedo-green text-white rounded-full shadow-card hover:shadow-hover transition"
            onClick={() => setShowForm(true)}
          >
            {t('testimonials.leave')}
          </button>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <form
              className="bg-white w-full max-w-lg p-6 rounded-lg shadow-card"
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const res = await fetch(apiUrl('/api/public/testimonials'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(form),
                  });
                  const json = await res.json();
                  if (!res.ok) throw new Error(json.error || 'Failed');
                  alert('Thanks! Your review is pending approval.');
                  setShowForm(false);
                } catch (err) {
                  alert(err.message);
                }
              }}
            >
              <h3 className="text-xl font-semibold mb-4">{t('testimonials.leave')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input className="border rounded px-3 py-2" placeholder="Your name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <input className="border rounded px-3 py-2" type="email" placeholder="Your email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="mt-3">
                <textarea className="w-full border rounded px-3 py-2" rows={4} placeholder="Your review" required value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} />
              </div>
              <div className="mt-3">
                <label className="text-sm mr-2">Stars:</label>
                <input type="number" min={0} max={5} className="border rounded px-2 py-1 w-20" value={form.stars} onChange={(e) => setForm({ ...form, stars: Number(e.target.value) })} />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" className="px-4 py-2 bg-gray-200 rounded" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="px-4 py-2 bg-gedo-green text-white rounded">Submit</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </motion.section>
  );
}
