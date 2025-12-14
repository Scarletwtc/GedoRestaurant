import { useState } from 'react';
import { apiUrl } from '../api.js';

export default function TestimonialForm({ initial = {}, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: initial.name || '',
    quote: initial.quote || '',
    stars: initial.stars || 5,
    avatar: initial.avatar || '',
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const payload = { ...form, stars: Number(form.stars) };
    onSave(payload);
  }

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await fetch(apiUrl('/api/upload'), {
        method: 'POST',
        headers: { Authorization: `Basic ${btoa('Gedo:Gedo1999')}` },
        body: (() => {
          const fd = new FormData();
          fd.append('image', file);
          return fd;
        })(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setForm((p) => ({ ...p, avatar: data.url }));
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-lg p-6 rounded-lg shadow-md overflow-y-auto max-h-[90vh]"
      >
        <h2 className="text-xl font-semibold mb-4">
          {initial.id ? 'Edit Testimonial' : 'Add Testimonial'}
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="name">Name</label>
          <input id="name" name="name" type="text" value={form.name} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="quote">Quote</label>
          <input id="quote" name="quote" type="text" value={form.quote} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="stars">Stars</label>
          <input id="stars" name="stars" type="number" min={0} max={5} value={form.stars} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="avatarFile">Avatar</label>
          {form.avatar && (
            <div className="mb-2">
              <img src={form.avatar} alt="preview" className="h-16 w-16 object-cover rounded-full" />
            </div>
          )}
          <input id="avatarFile" name="avatarFile" type="file" accept="image/*" onChange={handleAvatarChange} className="w-full" />
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 bg-gedo-green text-white rounded">
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
