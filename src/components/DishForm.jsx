import { useState } from 'react';
import { apiUrl } from '../api.js';

export default function DishForm({ initial = {}, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: initial.name || '',
    price: initial.price || '',
    description: initial.description || '',
    image: initial.image || '',
    badgeIcon: initial.badge?.icon || '',
    badgeText: initial.badge?.text || '',
    categoryId: initial.categoryId || '',
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      name: form.name,
      price: Number(form.price),
      description: form.description,
      image: form.image,
      categoryId: form.categoryId || null,
      badge: form.badgeIcon || form.badgeText ? { icon: form.badgeIcon, text: form.badgeText } : undefined,
    };
    onSave(payload);
  }

  async function handleImageChange(e) {
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
      // Prefer the relative path to be robust across environments
      setForm((p) => ({ ...p, image: data.path || data.url }));
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
        <h2 className="text-xl font-semibold mb-4">{initial.id ? 'Edit Dish' : 'Add New Dish'}</h2>

        {/* Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="name">Name</label>
          <input id="name" name="name" type="text" value={form.name} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        {/* Price */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="price">Price</label>
          <input id="price" name="price" type="number" value={form.price} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="description">Description</label>
          <input id="description" name="description" type="text" value={form.description} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        {/* Image upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="imageFile">Image</label>
          {form.image && (
            <div className="mb-2">
              <img src={form.image} alt="preview" className="h-24 w-24 object-cover rounded" />
            </div>
          )}
          <input id="imageFile" name="imageFile" type="file" accept="image/*" onChange={handleImageChange} className="w-full" />
        </div>
        {/* Category */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="categoryId">Category</label>
          <CategorySelect value={form.categoryId} onChange={(v) => setForm((p) => ({ ...p, categoryId: v }))} />
        </div>
        {/* Badge icon/text */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="badgeIcon">Badge Icon</label>
          <input id="badgeIcon" name="badgeIcon" type="text" value={form.badgeIcon} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="badgeText">Badge Text</label>
          <input id="badgeText" name="badgeText" type="text" value={form.badgeText} onChange={handleChange} className="w-full border rounded px-3 py-2" />
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

function CategorySelect({ value, onChange }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCat, setNewCat] = useState('');
  const AUTH = `Basic ${btoa('Gedo:Gedo1999')}`;

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/categories'));
      setCategories(await res.json());
    } catch {}
    setLoading(false);
  }
  async function create() {
    if (!newCat.trim()) return;
    const res = await fetch(apiUrl('/api/categories'), { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: AUTH }, body: JSON.stringify({ name: newCat }) });
    if (res.ok) {
      setNewCat('');
      load();
    }
  }
  useState(() => { load(); }, []);

  return (
    <div className="flex items-center gap-2">
      <select className="flex-1 border rounded px-3 py-2" value={value || ''} onChange={(e) => onChange(e.target.value)} disabled={loading}>
        <option value="">— None —</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <input className="border rounded px-2 py-2 w-28" placeholder="New cat" value={newCat} onChange={(e) => setNewCat(e.target.value)} />
      <button type="button" className="px-3 py-2 bg-gray-200 rounded" onClick={create}>Add</button>
    </div>
  );
}
