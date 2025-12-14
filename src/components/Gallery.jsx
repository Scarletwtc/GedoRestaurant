import { useState } from 'react';
import useFetch from '../hooks/useFetch';
import { getImageUrl } from '../api.js';

export default function Gallery() {
  const { data } = useFetch('/api/gallery');
  const images = Array.isArray(data) ? data : [];
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  return (
    <section id="gallery" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="font-playfair text-3xl md:text-4xl text-gedo-green mb-6 text-center">Gallery</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((img, i) => (
            <button key={img.id} className="relative group" onClick={() => { setIdx(i); setOpen(true); }}>
              <img src={getImageUrl(img.url)} alt={img.caption || 'photo'} className="w-full h-32 md:h-40 object-cover rounded shadow-card group-hover:shadow-hover transition" />
            </button>
          ))}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={() => setOpen(false)}>
                  <div className="relative max-w-3xl w-full px-4" onClick={(e) => e.stopPropagation()}>
          <img src={getImageUrl(images[idx]?.url)} alt={images[idx]?.caption || 'photo'} className="w-full max-h-[80vh] object-contain rounded" />
            <div className="absolute inset-y-1/2 left-2 right-2 flex justify-between -translate-y-1/2">
              <button className="h-10 w-10 rounded-full bg-white/80 hover:bg-white text-gedo-green" onClick={() => setIdx((i) => (i - 1 + images.length) % images.length)}>
                <i className="fa-solid fa-chevron-left" />
              </button>
              <button className="h-10 w-10 rounded-full bg-white/80 hover:bg-white text-gedo-green" onClick={() => setIdx((i) => (i + 1) % images.length)}>
                <i className="fa-solid fa-chevron-right" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

