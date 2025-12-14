import { useEffect, useState } from 'react';
function Collapsible({ title, description, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border rounded">
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-3 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <div>
          <div className="font-semibold">{title}</div>
          {description ? <div className="text-xs text-gedo-brown">{description}</div> : null}
        </div>
        <i className={`fa-solid ${open ? 'fa-chevron-up' : 'fa-chevron-down'} text-gedo-green`}></i>
      </button>
      {open ? <div className="px-4 pb-4">{children}</div> : null}
    </div>
  );
}
import DishForm from '../components/DishForm';
import TestimonialForm from '../components/TestimonialForm';
import { getImageUrl, apiUrl } from '../api.js';

export default function Admin() {
  const ADMIN_USER = 'Gedo';
  const ADMIN_PASS = 'Gedo1999';
  const BASIC_AUTH = `Basic ${btoa(`${ADMIN_USER}:${ADMIN_PASS}`)}`;
  const [user, setUser] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formState, setFormState] = useState({ show: false, editing: null, type: 'dish' });
  const [section, setSection] = useState('dishes'); // 'dishes' | 'testimonials' | 'categories' | 'site'
  const [gallery, setGallery] = useState([]);
  const [site, setSite] = useState(null);
  const [settingsLang, setSettingsLang] = useState('en');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (user) {
      fetchCollection('dishes');
      fetchCollection('testimonials');
      fetchSite();
      fetchGallery();
      fetchCategories();
    }
  }, [user]);

  async function fetchCategories() {
    try {
      const res = await fetch(apiUrl('/api/categories'));
      setCategories(await res.json());
    } catch (e) {
      console.error(e);
    }
  }

  async function saveCategory(payload, id) {
    try {
      const headers = { 'Content-Type': 'application/json', Authorization: BASIC_AUTH };
      const res = await fetch(apiUrl(id ? `/api/categories/${id}` : '/api/categories'), { method: id ? 'PUT' : 'POST', headers, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('Failed');
      await fetchCategories();
    } catch (e) {
      alert('Save failed');
    }
  }

  async function deleteCategory(id) {
    if (!window.confirm('Delete category?')) return;
    try {
      const res = await fetch(apiUrl(`/api/categories/${id}`), { method: 'DELETE', headers: { Authorization: BASIC_AUTH } });
      if (!res.ok) throw new Error('Failed');
      await fetchCategories();
    } catch (e) {
      alert('Delete failed');
    }
  }

  async function fetchCollection(col) {
    try {
      let res;
      if (col === 'testimonials') {
        res = await fetch(apiUrl('/api/admin/testimonials'), {
          headers: { Authorization: BASIC_AUTH },
        });
      } else {
        res = await fetch(apiUrl(`/api/${col}`));
      }
      const data = await res.json();
      if (col === 'dishes') setDishes(data);
      else setTestimonials(data);
    } catch (err) {
      console.error(err);
      alert(`Failed to load ${col}`);
    }
  }

  async function upsert(col, payload, id) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: BASIC_AUTH,
      };
      const res = await fetch(apiUrl(id ? `/api/${col}/${id}` : `/api/${col}`), {
        method: id ? 'PUT' : 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Request failed');
      if (col === 'dishes') {
        if (id) setDishes((p) => p.map((d) => (d.id === id ? { ...d, ...payload } : d)));
        else setDishes((p) => [...p, { ...payload, id: json.id }]);
      } else {
        if (id) setTestimonials((p) => p.map((t) => (t.id === id ? { ...t, ...payload } : t)));
        else setTestimonials((p) => [...p, { ...payload, id: json.id }]);
      }
    } catch (err) {
      alert(err.message);
    }
  }

  async function fetchSite() {
    try {
      const res = await fetch(apiUrl('/api/site'));
      const data = await res.json();
      setSite(data);
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchGallery() {
    try {
      const res = await fetch(apiUrl('/api/gallery'));
      setGallery(await res.json());
    } catch (e) {
      console.error(e);
    }
  }

  async function saveSite(partial) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: BASIC_AUTH,
      };
      const res = await fetch(apiUrl('/api/site'), { method: 'PUT', headers, body: JSON.stringify(partial) });
      if (!res.ok) throw new Error('Failed to save');
      setSite((p) => ({ ...(p || {}), ...partial }));
    } catch (e) {
      alert('Save failed');
    }
  }

  async function saveSiteAll() {
    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: BASIC_AUTH,
      };
      const res = await fetch(apiUrl('/api/site'), { method: 'PUT', headers, body: JSON.stringify(site || {}) });
      if (!res.ok) throw new Error('Failed to save');
      alert('Site settings saved');
    } catch (e) {
      alert('Save failed');
    }
  }

  async function revertSiteChanges() {
    await fetchSite();
  }

  async function uploadSiteImage(file, key) {
    try {
      const res = await fetch(apiUrl('/api/upload'), {
        method: 'POST',
        headers: { Authorization: BASIC_AUTH },
        body: (() => { const fd = new FormData(); fd.append('image', file); return fd; })(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      const partial = { [key]: data.url };
      setSite((p) => ({ ...(p || {}), ...partial }));
    } catch (e) {
      alert('Upload failed');
    }
  }

  async function handleDelete(col, id) {
    if (!window.confirm('Delete?')) return;
    try {
      await fetch(apiUrl(`/api/${col}/${id}`), {
        method: 'DELETE',
        headers: {
          Authorization: BASIC_AUTH,
        },
      });
      if (col === 'dishes') setDishes((p) => p.filter((d) => d.id !== id));
      else setTestimonials((p) => p.filter((t) => t.id !== id));
    } catch (err) {
      alert('Delete failed');
    }
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <form
          className="space-y-4 w-full max-w-sm"
          onSubmit={(e) => {
            e.preventDefault();
            const username = e.currentTarget.username.value;
            const password = e.currentTarget.password.value;
            if (username === ADMIN_USER && password === ADMIN_PASS) setUser({ username });
            else alert('Invalid credentials');
          }}
        >
          <input name="username" placeholder="Username" className="w-full border rounded px-3 py-2" required />
          <input name="password" type="password" placeholder="Password" className="w-full border rounded px-3 py-2" required />
          <button className="px-6 py-3 bg-gedo-green text-white rounded-full hover:bg-gedo-gold" type="submit">
            Sign in
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-32 pb-16 min-h-[60vh]">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-playfair text-3xl text-gedo-green">Admin Panel</h1>
        <div className="space-x-4">
          <button
            className="px-4 py-2 bg-gedo-green text-white rounded"
            onClick={() =>
              setFormState({ show: true, editing: null, type: section === 'dishes' ? 'dish' : 'testimonial' })
            }
          >
            + Add {section === 'dishes' ? 'Dish' : 'Testimonial'}
          </button>
          <button className="text-gedo-red underline" onClick={() => setUser(null)}>
            Sign out
          </button>
        </div>
      </div>

      <div className="mb-6 space-x-4">
        <button
          className={`px-4 py-2 rounded ${section === 'dishes' ? 'bg-gedo-green text-white' : 'bg-gray-200'}`}
          onClick={() => setSection('dishes')}
        >
          Dishes
        </button>
        <button
          className={`px-4 py-2 rounded ${
            section === 'testimonials' ? 'bg-gedo-green text-white' : 'bg-gray-200'
          }`}
          onClick={() => setSection('testimonials')}
        >
          Testimonials
        </button>
        <button
          className={`px-4 py-2 rounded ${section === 'site' ? 'bg-gedo-green text-white' : 'bg-gray-200'}`}
          onClick={() => setSection('site')}
        >
          Site Settings
        </button>
        <button
          className={`px-4 py-2 rounded ${section === 'gallery' ? 'bg-gedo-green text-white' : 'bg-gray-200'}`}
          onClick={() => setSection('gallery')}
        >
          Gallery
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : section === 'dishes' ? (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gedo-green text-white">
              <th className="p-2">Name</th>
              <th className="p-2">Price</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(dishes || []).map((d) => (
              <tr key={d.id} className="border-b">
                <td className="p-2">{d.name}</td>
                <td className="p-2">{d.price}</td>
                <td className="p-2 space-x-4">
                  <button
                    className="text-gedo-green"
                    onClick={() => setFormState({ show: true, editing: d, type: 'dish' })}
                  >
                    Edit
                  </button>
                  <button className="text-gedo-red" onClick={() => handleDelete('dishes', d.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : section === 'testimonials' ? (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gedo-green text-white">
              <th className="p-2">Name</th>
              <th className="p-2">Quote</th>
              <th className="p-2">Stars</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {testimonials.map((t) => (
              <tr key={t.id} className="border-b">
                <td className="p-2">{t.name}</td>
                <td className="p-2 max-w-sm truncate">{t.quote}</td>
                <td className="p-2">{t.stars}</td>
                <td className="p-2">{t.approved ? 'Approved' : 'Pending'}</td>
                <td className="p-2 space-x-4">
                  <button
                    className="text-gedo-green"
                    onClick={() => setFormState({ show: true, editing: t, type: 'testimonial' })}
                  >
                    Edit
                  </button>
                  <button
                    className="text-blue-600"
                    onClick={async () => {
                      await upsert('testimonials', { approved: !t.approved }, t.id);
                      setTestimonials((p) => p.map((x) => (x.id === t.id ? { ...x, approved: !t.approved } : x)));
                    }}
                  >
                    {t.approved ? 'Unapprove' : 'Approve'}
                  </button>
                  <button className="text-gedo-red" onClick={() => handleDelete('testimonials', t.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : section === 'categories' ? (
        <div className="max-w-xl space-y-4">
          <div className="flex items-center gap-2">
            <input id="newCatName" placeholder="Category name" className="flex-1 border rounded px-3 py-2" />
            <input id="newCatOrder" type="number" placeholder="Order" className="w-24 border rounded px-3 py-2" />
            <button className="px-4 py-2 bg-gedo-green text-white rounded" onClick={() => saveCategory({ name: document.getElementById('newCatName').value, order: Number(document.getElementById('newCatOrder').value) || 0 })}>Add</button>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gedo-green text-white">
                <th className="p-2">Name</th>
                <th className="p-2 w-24">Order</th>
                <th className="p-2 w-40">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-b">
                  <td className="p-2">
                    <input className="border rounded px-2 py-1 w-full" defaultValue={c.name} onBlur={(e) => saveCategory({ name: e.target.value }, c.id)} />
                  </td>
                  <td className="p-2">
                    <input className="border rounded px-2 py-1 w-full" type="number" defaultValue={c.order || 0} onBlur={(e) => saveCategory({ order: Number(e.target.value) || 0 }, c.id)} />
                  </td>
                  <td className="p-2">
                    <button className="text-gedo-red" onClick={() => deleteCategory(c.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : section === 'site' ? (
        <div className="max-w-4xl space-y-6">
          <div className="flex items-center justify-between sticky top-20 bg-white/95 backdrop-blur z-10 py-2 border-b">
            <h2 className="text-xl font-semibold">Site Settings</h2>
            <div className="space-x-2">
              <button className="px-4 py-2 bg-gray-200 rounded" onClick={revertSiteChanges}>Revert</button>
              <button className="px-4 py-2 bg-gedo-green text-white rounded" onClick={saveSiteAll}>Save Changes</button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Collapsible title="Branding" description="Logo and tagline shown in navbar and hero badge.">
                <div>
                  <label className="block text-sm mb-1">Logo</label>
                  {site?.logoUrl ? (
                    <div className="flex items-center gap-3 mb-2">
                      <img src={getImageUrl(site.logoUrl)} alt="logo" className="h-12 w-12 object-cover rounded" />
                      <button className="px-3 py-2 bg-gray-200 rounded" onClick={() => setSite((p) => ({ ...(p || {}), logoUrl: null }))}>Remove</button>
                    </div>
                  ) : null}
                  <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadSiteImage(e.target.files[0], 'logoUrl')} />
                  <p className="text-xs text-gedo-brown mt-1">Upload your restaurant logo to replace the default "G" badge.</p>
                </div>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  <label className="block text-sm mb-1">Tagline (EN)</label>
                  <input className="w-full border rounded px-3 py-2" placeholder="Short line under logo (English)" value={site?.tagline_en || ''} onChange={(e) => setSite((p) => ({ ...(p || {}), tagline_en: e.target.value }))} />
                  <label className="block text-sm mb-1 mt-2">Slogan (RO)</label>
                  <input className="w-full border rounded px-3 py-2" placeholder="Text scurt sub logo (Română)" value={site?.tagline_ro || ''} onChange={(e) => setSite((p) => ({ ...(p || {}), tagline_ro: e.target.value }))} />
                </div>
              </Collapsible>

              <Collapsible title="Hero (Homepage)" description="Large headline and subtitle in the top section.">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-1 rounded ${settingsLang==='en'?'bg-gedo-green text-white':'bg-gray-200'}`} onClick={()=>setSettingsLang('en')}>EN</span>
                  <span className={`text-xs px-2 py-1 rounded ${settingsLang==='ro'?'bg-gedo-green text-white':'bg-gray-200'}`} onClick={()=>setSettingsLang('ro')}>RO</span>
                </div>
                {settingsLang==='en' ? (
                  <>
                    <label className="block text-xs mb-1">Hero Title (EN)</label>
                    <input className="w-full border rounded px-3 py-2" value={site?.heroTitle_en || ''} onChange={(e) => setSite((p) => ({ ...(p || {}), heroTitle_en: e.target.value }))} />
                    <label className="block text-xs mb-1 mt-2">Hero Subtitle (EN)</label>
                    <input className="w-full border rounded px-3 py-2" value={site?.heroSubtitle_en || ''} onChange={(e) => setSite((p) => ({ ...(p || {}), heroSubtitle_en: e.target.value }))} />
                  </>
                ) : (
                  <>
                    <label className="block text-xs mb-1">Titlu Hero (RO)</label>
                    <input className="w-full border rounded px-3 py-2" value={site?.heroTitle_ro || ''} onChange={(e) => setSite((p) => ({ ...(p || {}), heroTitle_ro: e.target.value }))} />
                    <label className="block text-xs mb-1 mt-2">Subtitlu Hero (RO)</label>
                    <input className="w-full border rounded px-3 py-2" value={site?.heroSubtitle_ro || ''} onChange={(e) => setSite((p) => ({ ...(p || {}), heroSubtitle_ro: e.target.value }))} />
                  </>
                )}
              </Collapsible>

              <Collapsible title="Welcome Section" description="Title and intro paragraph on the homepage.">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-1 rounded ${settingsLang==='en'?'bg-gedo-green text-white':'bg-gray-200'}`} onClick={()=>setSettingsLang('en')}>EN</span>
                  <span className={`text-xs px-2 py-1 rounded ${settingsLang==='ro'?'bg-gedo-green text-white':'bg-gray-200'}`} onClick={()=>setSettingsLang('ro')}>RO</span>
                </div>
                {settingsLang==='en' ? (
                  <>
                    <label className="block text-xs mb-1">Welcome Title (EN)</label>
                    <input className="w-full border rounded px-3 py-2" value={site?.welcomeTitle_en || ''} onChange={(e) => setSite((p) => ({ ...(p || {}), welcomeTitle_en: e.target.value }))} />
                    <label className="block text-xs mb-1 mt-2">Welcome Text (EN)</label>
                    <textarea className="w-full border rounded px-3 py-2" rows={3} value={site?.welcomeText_en || ''} onChange={(e) => setSite((p) => ({ ...(p || {}), welcomeText_en: e.target.value }))} />
                  </>
                ) : (
                  <>
                    <label className="block text-xs mb-1">Titlu Bun Venit (RO)</label>
                    <input className="w-full border rounded px-3 py-2" value={site?.welcomeTitle_ro || ''} onChange={(e) => setSite((p) => ({ ...(p || {}), welcomeTitle_ro: e.target.value }))} />
                    <label className="block text-xs mb-1 mt-2">Text Bun Venit (RO)</label>
                    <textarea className="w-full border rounded px-3 py-2" rows={3} value={site?.welcomeText_ro || ''} onChange={(e) => setSite((p) => ({ ...(p || {}), welcomeText_ro: e.target.value }))} />
                  </>
                )}
              </Collapsible>
            </div>

            <div className="space-y-4">
              <Collapsible title="About Page" description="Content for the About page (both languages).">
                <div className="grid grid-cols-1 gap-3">
                  <label className="block text-xs mb-1">About Title (EN)</label>
                  <input className="w-full border rounded px-3 py-2" placeholder="About title (English)" value={site?.aboutTitle_en || ''} onChange={(e) => setSite((p) => ({ ...(p || {}), aboutTitle_en: e.target.value }))} />
                  <label className="block text-xs mb-1">About Body (EN)</label>
                  <textarea className="w-full border rounded px-3 py-2" rows={6} placeholder="About body (English)" value={site?.aboutBody_en || ''} onChange={(e) => setSite((p) => ({ ...(p || {}), aboutBody_en: e.target.value }))} />
                  <label className="block text-xs mb-1">Titlu Despre (RO)</label>
                  <input className="w-full border rounded px-3 py-2" placeholder="Titlu Despre (Română)" value={site?.aboutTitle_ro || ''} onChange={(e) => setSite((p) => ({ ...(p || {}), aboutTitle_ro: e.target.value }))} />
                  <label className="block text-xs mb-1">Conținut Despre (RO)</label>
                  <textarea className="w-full border rounded px-3 py-2" rows={6} placeholder="Conținut Despre (Română)" value={site?.aboutBody_ro || ''} onChange={(e) => setSite((p) => ({ ...(p || {}), aboutBody_ro: e.target.value }))} />
                </div>
              </Collapsible>

              <Collapsible title="Homepage Dishes" description="Choose special and signature dishes.">
                <div className="mb-3">
                  <label className="block text-sm mb-1">Today's Special</label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={site?.todaysSpecialDishId || ''}
                    onChange={(e) => setSite((p) => ({ ...(p || {}), todaysSpecialDishId: e.target.value || null }))}
                  >
                    <option value="">— None —</option>
                    {dishes.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gedo-brown mt-1">Pick one of your dishes to feature on the homepage.</p>
                </div>
                <div>
                  <label className="block text-sm mb-1">Signature Dishes (showcase)</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(site?.signatureDishIds || []).map((id) => {
                      const d = dishes.find((x) => x.id === id);
                      if (!d) return null;
                      return (
                        <span key={id} className="px-2 py-1 bg-gray-100 rounded text-sm flex items-center gap-2">
                          {d.name}
                          <button className="text-gedo-red" onClick={() => setSite((p) => ({ ...(p || {}), signatureDishIds: (p?.signatureDishIds || []).filter((x) => x !== id) }))}>
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                  <select
                    className="w-full border rounded px-3 py-2"
                    onChange={(e) => {
                      const id = e.target.value;
                      if (!id) return;
                      setSite((p) => ({ ...(p || {}), signatureDishIds: Array.from(new Set([ ...(p?.signatureDishIds || []), id ])) }));
                    }}
                  >
                    <option value="">+ Add dish</option>
                    {dishes.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  <div className="mt-2">
                    <button className="px-4 py-2 bg-gedo-green text-white rounded" onClick={() => saveSite({ signatureDishIds: site?.signatureDishIds || [] })}>Save Signature Dishes</button>
                  </div>
                </div>
              </Collapsible>

              <Collapsible title="Contact & Hours" description="Phone, address, schedule, social links, Google Map.">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">Phone</label>
                    <input className="w-full border rounded px-3 py-2" placeholder="Display phone number" value={site?.contactPhone || ''} onChange={(e) => setSite((p) => ({ ...(p || {}), contactPhone: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Address</label>
                    <input className="w-full border rounded px-3 py-2" placeholder="Street, City, Country" value={site?.contactAddress || ''} onChange={(e) => setSite((p) => ({ ...(p || {}), contactAddress: e.target.value }))} />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-sm mb-2">Opening Hours</label>
                  <div className="space-y-2">
                    {(site?.openingHours || []).map((h, idx) => (
                      <div key={idx} className="flex flex-wrap gap-2 items-center">
                        <select
                          className="border rounded px-3 py-2"
                          value={h.label}
                          onChange={(e) => setSite((p) => ({ ...(p || {}), openingHours: (p?.openingHours || []).map((x, i) => i === idx ? { ...x, label: e.target.value } : x) }))}
                        >
                          {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday','Monday - Thursday','Friday - Saturday'].map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                        <input type="time" className="border rounded px-3 py-2" value={(h.value || '').split(' - ')[0] || ''} onChange={(e) => setSite((p) => ({ ...(p || {}), openingHours: (p?.openingHours || []).map((x, i) => i === idx ? { ...x, value: `${e.target.value} - ${(x.value || '').split(' - ')[1] || ''}` } : x) }))} />
                        <span>to</span>
                        <input type="time" className="border rounded px-3 py-2" value={(h.value || '').split(' - ')[1] || ''} onChange={(e) => setSite((p) => ({ ...(p || {}), openingHours: (p?.openingHours || []).map((x, i) => i === idx ? { ...x, value: `${(x.value || '').split(' - ')[0] || ''} - ${e.target.value}` } : x) }))} />
                        <button className="px-3 py-2 bg-gedo-red text-white rounded" onClick={() => setSite((p) => ({ ...(p || {}), openingHours: (p?.openingHours || []).filter((_, i) => i !== idx) }))}>Remove</button>
                      </div>
                    ))}
                    <div className="space-x-2">
                      <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setSite((p) => ({ ...(p || {}), openingHours: [ ...(p?.openingHours || []), { label: 'Monday - Thursday', value: '11:00 - 22:00' } ] }))}>+ Add Row</button>
                      <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setSite((p) => ({ ...(p || {}), openingHours: [
                        { label: 'Monday - Thursday', value: '11:00 - 22:00' },
                        { label: 'Friday - Saturday', value: '11:00 - 23:00' },
                        { label: 'Sunday', value: '12:00 - 21:00' },
                      ] }))}>Use Defaults</button>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                  <div>
                    <label className="block text-sm mb-1">Facebook</label>
                    <input className="w-full border rounded px-3 py-2" placeholder="https://facebook.com/yourpage" value={site?.social?.facebook || ''} onChange={(e) => setSite((p) => ({ ...(p || {}), social: { ...(p?.social || {}), facebook: e.target.value } }))} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Instagram</label>
                    <input className="w-full border rounded px-3 py-2" placeholder="https://instagram.com/yourhandle" value={site?.social?.instagram || ''} onChange={(e) => setSite((p) => ({ ...(p || {}), social: { ...(p?.social || {}), instagram: e.target.value } }))} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">TikTok</label>
                    <input className="w-full border rounded px-3 py-2" placeholder="https://tiktok.com/@yourhandle" value={site?.social?.tiktok || ''} onChange={(e) => setSite((p) => ({ ...(p || {}), social: { ...(p?.social || {}), tiktok: e.target.value } }))} />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-sm mb-1">Google Map Embed URL</label>
                  <input className="w-full border rounded px-3 py-2" placeholder="Paste Google Maps embed URL" value={site?.mapEmbedUrl || ''} onChange={(e) => setSite((p) => ({ ...(p || {}), mapEmbedUrl: e.target.value }))} />
                </div>
              </Collapsible>

              <Collapsible title="Hero Background" description="Large cover image behind the hero content.">
                {site?.heroBackgroundUrl ? (
                  <div className="mb-2">
                    <img src={getImageUrl(site.heroBackgroundUrl)} alt="hero" className="h-20 w-full object-cover rounded" />
                  </div>
                ) : null}
                <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadSiteImage(e.target.files[0], 'heroBackgroundUrl')} />
                <p className="text-xs text-gedo-brown mt-1">Recommended 1920×1080 or larger.</p>
              </Collapsible>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Gallery</h2>
            <label className="px-4 py-2 bg-gedo-green text-white rounded cursor-pointer">
              + Upload
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const up = await fetch(apiUrl('/api/upload'), { method: 'POST', headers: { Authorization: BASIC_AUTH }, body: (() => { const fd = new FormData(); fd.append('image', file); return fd; })() });
                    const { url } = await up.json();
                    const res = await fetch(apiUrl('/api/gallery'), { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: BASIC_AUTH }, body: JSON.stringify({ url }) });
                    if (!res.ok) throw new Error('Failed');
                    fetchGallery();
                  } catch (err) {
                    alert('Upload failed');
                  }
                }}
              />
            </label>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {gallery.map((g) => (
              <div key={g.id} className="relative group">
                <img src={getImageUrl(g.url)} alt="gallery" className="w-full h-32 md:h-36 object-cover rounded" />
                <button
                  className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gedo-red px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition"
                  onClick={async () => { await fetch(apiUrl(`/api/gallery/${g.id}`), { method: 'DELETE', headers: { Authorization: BASIC_AUTH } }); fetchGallery(); }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {formState.show &&
        (formState.type === 'dish' ? (
          <DishForm
            initial={formState.editing || {}}
            onCancel={() => setFormState({ show: false, editing: null, type: 'dish' })}
            onSave={async (payload) => {
              await upsert('dishes', payload, formState.editing?.id);
              setFormState({ show: false, editing: null, type: 'dish' });
            }}
          />
        ) : (
          <TestimonialForm
            initial={formState.editing || {}}
            onCancel={() => setFormState({ show: false, editing: null, type: 'testimonial' })}
            onSave={async (payload) => {
              await upsert('testimonials', payload, formState.editing?.id);
              setFormState({ show: false, editing: null, type: 'testimonial' });
            }}
          />
        ))}
    </div>
  );
}
