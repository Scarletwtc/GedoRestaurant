import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

// Initialise Firebase Admin SDK with robust env handling
if (!admin.apps.length) {
  let serviceAccount;
  const jsonEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const pathEnv = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  // Try explicit JSON first (can be JSON, a readable path, or base64-encoded JSON)
  if (!serviceAccount && jsonEnv) {
    try {
      serviceAccount = JSON.parse(jsonEnv);
    } catch (_) {
      // Not valid JSON, try base64 decode → JSON
      try {
        const decoded = Buffer.from(jsonEnv, 'base64').toString('utf8');
        serviceAccount = JSON.parse(decoded);
      } catch (_) {
        // Not base64 JSON either; try treating it as a file path
      }

      // If still not parsed, try reading as a file path
      try {
        const raw = fs.readFileSync(jsonEnv, 'utf8');
        serviceAccount = JSON.parse(raw);
      } catch (err) {
        console.warn('FIREBASE_SERVICE_ACCOUNT_JSON not valid JSON or readable path. Falling back to other options.');
      }
    }
  }

  // Try explicit path env
  if (!serviceAccount && pathEnv) {
    try {
      const raw = fs.readFileSync(pathEnv, 'utf8');
      serviceAccount = JSON.parse(raw);
    } catch (err) {
      console.warn('FIREBASE_SERVICE_ACCOUNT_PATH not readable. Falling back to local serviceAccountKey.json if present.');
    }
  }

  // Try local file
  if (!serviceAccount && fs.existsSync('./serviceAccountKey.json')) {
    const raw = fs.readFileSync('./serviceAccountKey.json', 'utf8');
    serviceAccount = JSON.parse(raw);
  }

  if (!serviceAccount) {
    console.error('Service account credentials not provided. Either:\n - set FIREBASE_SERVICE_ACCOUNT_JSON\n - set FIREBASE_SERVICE_ACCOUNT_PATH\n - add serviceAccountKey.json in project root');
    process.exit(1);
  }

  // Fix common formatting of private_key when provided via env (escaped newlines)
  if (serviceAccount.private_key && typeof serviceAccount.private_key === 'string') {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // databaseURL is optional for Firestore-only usage
    projectId: serviceAccount.project_id || process.env.FIREBASE_PROJECT_ID,
    storageBucket:
      process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id || process.env.FIREBASE_PROJECT_ID}.appspot.com`,
  });
}

const db = getFirestore();
// Helper to normalize media URLs (fix old localhost URLs and bare filenames)
function normalizeMediaUrl(input) {
  if (!input || typeof input !== 'string') return input;
  try {
    if (/^https?:\/\/localhost|^https?:\/\/127\.0\.0\.1/.test(input)) {
      const u = new URL(input);
      return `https://gedo-server-294732304552.us-central1.run.app${u.pathname}`;
    }
  } catch (_) {}
  if (input.startsWith('/media/')) return input;
  if (/^[0-9].*\.(png|jpe?g|webp|gif|svg)$/i.test(input)) return `/media/${input}`;
  return input;
}

const app = express();
app.use(cors());
app.use(express.json());
// Ensure uploads directory exists
// - In Cloud Run, only /tmp is writable. Use it in production. Use local folder in dev.
const uploadsDir = process.env.NODE_ENV === 'production'
  ? path.join('/tmp', 'uploads')
  : path.resolve('server', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/media', express.static(uploadsDir));
// Serve static images from the images directory
app.use('/images', express.static(path.join(process.cwd(), 'images')));

// Simple request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Middleware to verify auth for protected routes
async function verifyAuth(req, res, next) {
  const header = req.headers.authorization || '';

  // 1) Allow Basic auth using DB-stored credentials (with env fallback)
  const basic = header.match(/^Basic\s+(.*)$/i);
  if (basic) {
    try {
      const decoded = Buffer.from(basic[1], 'base64').toString('utf8');
      const [username, password] = decoded.split(':');
      // Check Firestore settings first
      const snap = await db.collection('site').doc('settings').get();
      const settings = snap.exists ? snap.data() : {};
      const adminAuth = settings?.adminAuth;
      if (adminAuth && adminAuth.username && adminAuth.passwordHash) {
        const providedHash = crypto.createHash('sha256').update(String(password)).digest('hex');
        if (username === adminAuth.username && providedHash === adminAuth.passwordHash) {
          req.user = { username };
          return next();
        }
      }
      // Fallback to env pair for compatibility
      const expectedUser = process.env.ADMIN_USERNAME || 'Gedo';
      const expectedPass = process.env.ADMIN_PASSWORD || 'Gedo1999';
      if (username === expectedUser && password === expectedPass) {
        req.user = { username };
        return next();
      }
    } catch (_) {}
    return res.status(401).json({ error: 'Invalid basic credentials' });
  }

  // 2) Fallback: verify Firebase ID token if provided as Bearer
  const bearer = header.match(/^Bearer\s+(.*)$/i);
  const idToken = bearer && bearer[1];
  if (idToken) {
    try {
      const decoded = await admin.auth().verifyIdToken(idToken);
      req.user = decoded;
      return next();
    } catch (err) {
      console.error('Auth error', err);
      return res.status(401).json({ error: 'Invalid token' });
    }
  }

  return res.status(401).json({ error: 'Missing Authorization' });
}

// CRUD routes for dishes
const dishesCol = db.collection('dishes');
const categoriesCol = db.collection('categories');

app.get('/api/dishes', async (req, res) => {
  try {
    const snapshot = await dishesCol.get();
    const data = snapshot.docs.map((d) => {
      const doc = { id: d.id, ...d.data() };
      if (doc.image) doc.image = normalizeMediaUrl(doc.image);
      return doc;
    });
    res.json(data);
  } catch (err) {
    console.error('GET /api/dishes error:', err);
    // Return empty list to keep frontend functional
    res.json([]);
  }
});

app.get('/api/dishes/:id', async (req, res) => {
  try {
    const doc = await dishesCol.doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Not found' });
    const data = { id: doc.id, ...doc.data() };
    if (data.image) data.image = normalizeMediaUrl(data.image);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/dishes', verifyAuth, async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.price != null) payload.price = Number(payload.price);
    const doc = await dishesCol.add(payload);
    res.json({ id: doc.id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/dishes/:id', verifyAuth, async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.price != null) payload.price = Number(payload.price);
    await dishesCol.doc(req.params.id).set(payload, { merge: true });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/dishes/:id', verifyAuth, async (req, res) => {
  try {
    await dishesCol.doc(req.params.id).delete();
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ---- Categories endpoints ----
app.get('/api/categories', async (_req, res) => {
  try {
    const snap = await categoriesCol.orderBy('order', 'asc').get().catch(async () => await categoriesCol.get());
    const data = snap.docs.map((d) => ({ id: d.id, order: 0, ...d.data() }));
    res.json(data);
  } catch (err) {
    res.json([]);
  }
});

app.post('/api/categories', verifyAuth, async (req, res) => {
  try {
    const { name, order = 0 } = req.body || {};
    if (!name) return res.status(400).json({ error: 'Missing name' });
    const doc = await categoriesCol.add({ name: String(name), order: Number(order) || 0, createdAt: Date.now() });
    res.json({ id: doc.id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/categories/:id', verifyAuth, async (req, res) => {
  try {
    const payload = {};
    if (req.body?.name != null) payload.name = String(req.body.name);
    if (req.body?.order != null) payload.order = Number(req.body.order) || 0;
    await categoriesCol.doc(req.params.id).set(payload, { merge: true });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/categories/:id', verifyAuth, async (req, res) => {
  try {
    await categoriesCol.doc(req.params.id).delete();
    // Optional: clear categoryId from dishes referencing this category
    const snap = await dishesCol.where('categoryId', '==', req.params.id).get();
    const batch = db.batch();
    snap.forEach((doc) => batch.set(dishesCol.doc(doc.id), { categoryId: null }, { merge: true }));
    await batch.commit();
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// CRUD routes for testimonials
const testimonialsCol = db.collection('testimonials');
const galleryCol = db.collection('gallery');

const isProd = process.env.NODE_ENV === 'production';
const makeFilename = (originalname = '') => {
  const ext = path.extname(originalname) || '';
  return `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
};

// Use memory storage in production (Cloud Run) and disk locally
const upload = multer(
  isProd
    ? { storage: multer.memoryStorage() }
    : {
        storage: multer.diskStorage({
          destination: (_req, _file, cb) => cb(null, uploadsDir),
          filename: (_req, file, cb) => cb(null, makeFilename(file.originalname)),
        }),
      }
);

// Image upload endpoint → returns a public URL to use in image fields
app.post('/api/upload', verifyAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const filename = req.file.filename || makeFilename(req.file.originalname);
    const mediaPath = `/media/${filename}`;

    if (isProd) {
      const bucket = admin.storage().bucket();
      const file = bucket.file(`uploads/${filename}`);
      await file.save(req.file.buffer, {
        contentType: req.file.mimetype || 'application/octet-stream',
        public: true,
        resumable: false,
        metadata: { cacheControl: 'public, max-age=31536000, immutable' },
      });
    }

    const baseUrl = isProd
      ? 'https://gedo-server-294732304552.us-central1.run.app'
      : `http://localhost:${PORT}`;
    const absoluteMediaUrl = `${baseUrl}${mediaPath}`;
    const bucketUrl = isProd
      ? `https://storage.googleapis.com/${admin.storage().bucket().name}/uploads/${filename}`
      : absoluteMediaUrl;
    res.json({ url: bucketUrl, path: mediaPath });
  } catch (err) {
    console.error('Upload error', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

if (isProd) {
  app.get('/media/:filename', async (req, res) => {
    try {
      const bucket = admin.storage().bucket();
      const f = bucket.file(`uploads/${req.params.filename}`);
      const [exists] = await f.exists();
      if (!exists) return res.status(404).end();
      res.set('Cache-Control', 'public, max-age=31536000, immutable');
      f.createReadStream().on('error', () => res.status(500).end()).pipe(res);
    } catch (e) {
      res.status(500).end();
    }
  });
}

app.get('/api/testimonials', async (req, res) => {
  try {
    // Public: only return approved testimonials
    const snapshot = await testimonialsCol.where('approved', '==', true).get();
    const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json(data);
  } catch (err) {
    console.error('GET /api/testimonials error:', err);
    // Return empty list to keep frontend functional
    res.json([]);
  }
});

app.post('/api/testimonials', verifyAuth, async (req, res) => {
  try {
    const payload = { ...req.body, approved: req.body.approved ?? true, createdAt: Date.now() };
    const doc = await testimonialsCol.add(payload);
    res.json({ id: doc.id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/testimonials/:id', verifyAuth, async (req, res) => {
  try {
    await testimonialsCol.doc(req.params.id).set(req.body, { merge: true });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/testimonials/:id', verifyAuth, async (req, res) => {
  try {
    await testimonialsCol.doc(req.params.id).delete();
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ---- Gallery endpoints ----
app.get('/api/gallery', async (_req, res) => {
  try {
    const snap = await galleryCol.orderBy('createdAt', 'desc').get();
    const data = snap.docs.map((d) => {
      const g = { id: d.id, ...d.data() };
      if (g.url) g.url = normalizeMediaUrl(g.url);
      return g;
    });
    res.json(data);
  } catch (err) {
    console.error('GET /api/gallery error:', err);
    res.json([]);
  }
});

app.post('/api/gallery', verifyAuth, async (req, res) => {
  try {
    const { url, caption } = req.body || {};
    if (!url) return res.status(400).json({ error: 'Missing url' });
    const doc = await galleryCol.add({ url, caption: caption || '', createdAt: Date.now() });
    res.json({ id: doc.id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/gallery/:id', verifyAuth, async (req, res) => {
  try {
    await galleryCol.doc(req.params.id).delete();
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin-only list of testimonials (all, including unapproved)
app.get('/api/admin/testimonials', verifyAuth, async (_req, res) => {
  try {
    const snapshot = await testimonialsCol.get();
    const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- Public testimonial submission with validation and basic anti-spam ---
const lastPostByIp = new Map();
const BAD_WORDS = ['fuck','shit','bitch','asshole','cunt','bastard','dick','piss'];
function containsProfanity(text = '') {
  const lower = String(text).toLowerCase();
  return BAD_WORDS.some((w) => lower.includes(w));
}
function isValidEmail(email = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

app.post('/api/public/testimonials', async (req, res) => {
  try {
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString();
    const now = Date.now();
    const last = lastPostByIp.get(ip) || 0;
    if (now - last < 5 * 60 * 1000) {
      return res.status(429).json({ error: 'Please wait before submitting another review.' });
    }
    const { name, email, quote, stars } = req.body || {};
    if (!name || !email || !quote) return res.status(400).json({ error: 'Missing fields' });
    if (!isValidEmail(email)) return res.status(400).json({ error: 'Invalid email' });
    if (containsProfanity(quote) || containsProfanity(name)) return res.status(400).json({ error: 'Inappropriate language detected' });
    const safeStars = Math.max(0, Math.min(5, Number(stars ?? 5)));
    const payload = { name, email, quote, stars: safeStars, approved: false, createdAt: now, avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}` };
    const doc = await testimonialsCol.add(payload);
    lastPostByIp.set(ip, now);
    res.json({ id: doc.id, success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ---- Site settings ----
const siteDocRef = db.collection('site').doc('settings');

const defaultSiteSettings = {
  todaysSpecialDishId: null,
  heroTitle: 'Authentic Sudanese & Arabic Cuisine in Bucharest',
  heroSubtitle: 'Home-cooked warmth and rich flavors from Khartoum to Obor',
  heroTitle_en: 'Authentic Sudanese & Arabic Cuisine in Bucharest',
  heroSubtitle_en: 'Home-cooked warmth and rich flavors from Khartoum to Obor',
  heroTitle_ro: 'Bucătărie sudaneză și arabă autentică în București',
  heroSubtitle_ro: 'Caldura mâncărurilor de acasă și arome bogate, de la Khartoum la Obor',
  welcomeTitle: 'Welcome to Gedo',
  welcomeText:
    'Founded by Chef Mahmoud "Gedo" Ibrahim in 2018, our restaurant brings the authentic flavors of Sudan and the Middle East to Romania.',
  welcomeTitle_en: 'Welcome to Gedo',
  welcomeText_en:
    'Founded by Chef Mahmoud "Gedo" Ibrahim in 2018, our restaurant brings the authentic flavors of Sudan and the Middle East to Romania.',
  welcomeTitle_ro: 'Bine ai venit la Gedo',
  welcomeText_ro:
    'Fondat de Chef Mahmoud „Gedo” Ibrahim în 2018, restaurantul nostru aduce în România aromele autentice ale Sudanului și Orientului Mijlociu.',
  logoUrl: null,
  heroBackgroundUrl: null,
  // Defaults that point to server images directory
  defaultLogoUrl: '/images/Gedo_Logo.png',
  defaultHeroUrl: '/images/hero_img.webp',
  signatureDishIds: [],
  contactPhone: '+40 721 234 567',
  contactAddress: 'Str. Ion Maiorescu 18, Obor, Bucharest, Romania',
  mapEmbedUrl:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2848.1495794762375!2d26.11831591553598!3d44.448180579102395!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40b1fff4c02a0a27%3A0x4b37b3303ef1d640!2sStrada%20Ion%20Maiorescu%2018%2C%20Bucure%C8%99ti%20030671!5e0!3m2!1sen!2sro!4v1691498320221!5m2!1sen!2sro',
  openingHours: [
    { label: 'Monday - Thursday', value: '11:00 - 22:00' },
    { label: 'Friday - Saturday', value: '11:00 - 23:00' },
    { label: 'Sunday', value: '12:00 - 21:00' },
  ],
  social: { facebook: '', instagram: '', tiktok: '' },
  tagline_en: 'Sudanese & Arabic Restaurant',
  tagline_ro: 'Restaurant sudanez și arab',
  adminAuth: {
    username: 'Gedo',
    passwordHash: crypto.createHash('sha256').update('Gedo1999').digest('hex'),
  },
  // About content (bilingual)
  aboutTitle_en: 'Our Story',
  aboutTitle_ro: 'Povestea noastră',
  aboutBody_en:
    'Gedo Restaurant was founded by Chef Issam “Gedo” Mirghani in 1999, after he fled the civil war in Sudan and found a new home in Bucharest. “Gedo” means grandfather in Sudanese Arabic, a tribute to the chef’s own grandfather who taught him the secrets of heart‑warming home cooking back in Khartoum.\n\nHidden in the streets behind Piața Obor, Gedo quickly became an insider spot for expats, Arab communities and adventurous locals looking for authentic flavours at honest prices. Everyday the menu changes depending on the freshest produce and spices imported from Egypt, Syria and Lebanon, while meats are sourced locally and prepared in our own halal butchery.\n\nWhether you come for our emblematic Lentil Soup, slow-cooked Mulah Bamia, or fragrant Lamb Mandi, you’ll always be welcomed like family – with a cup of cardamom coffee and plenty of warm stories.',
  aboutBody_ro:
    'Restaurantul Gedo a fost fondat de Chef Issam „Gedo” Mirghani în 1999, după ce a fugit de războiul civil din Sudan și și-a găsit o nouă casă la București. „Gedo” înseamnă bunic în arabă sudaneză, un omagiu adus bunicului care i-a transmis secretele bucătăriei de acasă.\n\nAscuns pe străduțele din spatele Pieței Obor, Gedo a devenit rapid un loc preferat de expați, comunități arabe și localnici dornici de a descoperi arome autentice la prețuri corecte. Meniul se schimbă zilnic în funcție de cele mai proaspete ingrediente și condimente aduse din Egipt, Siria și Liban, iar carnea este selectată local și pregătită în măcelăria noastră halal.\n\nFie că vii pentru emblematica Ciorbă de linte, Mulah Bamia gătită încet sau aromatul Lamb Mandi, vei fi mereu întâmpinat ca în familie – cu o cafea cu cardamom și povești calde.',
};

async function getSiteSettings() {
  try {
    const snap = await siteDocRef.get();
    if (!snap.exists) return { ...defaultSiteSettings };
    const data = snap.data() || {};
    return { ...defaultSiteSettings, ...data };
  } catch (err) {
    console.error('GET /api/site error:', err);
    return { ...defaultSiteSettings };
  }
}

app.get('/api/site', async (_req, res) => {
  const settings = await getSiteSettings();
  const { adminAuth, ...publicSettings } = settings;
  res.json(publicSettings);
});

app.put('/api/site', verifyAuth, async (req, res) => {
  try {
    const payload = req.body || {};
    await siteDocRef.set(payload, { merge: true });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin: update credentials
app.put('/api/admin/credentials', verifyAuth, async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
    const passwordHash = crypto.createHash('sha256').update(String(password)).digest('hex');
    await siteDocRef.set({ adminAuth: { username: String(username), passwordHash } }, { merge: true });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend listening on ${PORT}`));

// Global error handler (keep minimal output in production)
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  res.status(500).json({ error: 'Internal Server Error' });
});
