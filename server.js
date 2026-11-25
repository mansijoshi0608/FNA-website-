/**
 * FNA Design Lab — Hardened Atelier Web & Security Engine
 * Features:
 *  - Single-owner Server-Side Authentication (credentials provided by environment)
 *  - HttpOnly, SameSite=Strict Session Management with 2-hour idle timeouts
 *  - Anti-Brute-Force Rate Limiting (5 failed attempts locks for 15 minutes)
 *  - Path Traversal & File Inclusion Shields (Blocks data/, hidden files, server.js)
 *  - HTTP Security Headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, CSP)
 *  - Protected REST API for Inquiries & Portfolio CMS (401 Unauthorized for non-owners)
 *  - Public Inquiries Submission & Search Endpoints
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const ROOT = path.resolve(__dirname);
const DATA_DIR = path.join(ROOT, 'data');
const INQUIRIES_FILE = path.join(DATA_DIR, 'inquiries.json');
const PORTFOLIO_FILE = path.join(DATA_DIR, 'portfolio.json');
const OWNER_EMAIL = process.env.FNA_OWNER_EMAIL;
const OWNER_PASSWORD = process.env.FNA_OWNER_PASSWORD;
const OWNER_NAME = process.env.FNA_OWNER_NAME || 'Principal Architect Aayushi';

if (!OWNER_EMAIL || !OWNER_PASSWORD) {
  console.error('Missing required FNA_OWNER_EMAIL or FNA_OWNER_PASSWORD environment variable.');
  process.exit(1);
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
};

/* ─── In-Memory Security State ─── */
const activeSessions = new Map(); // token -> { email, ownerName, expiresAt, createdAt }
const loginAttempts = new Map();  // ip -> { count, lockedUntil }

/* ─── Security Headers ─── */
function setSecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self';"
  );
}

function constantTimeEqual(left, right) {
  const a = crypto.createHash('sha256').update(String(left)).digest();
  const b = crypto.createHash('sha256').update(String(right)).digest();
  return crypto.timingSafeEqual(a, b);
}

function secureCookie(req) {
  return req.socket.encrypted || req.headers['x-forwarded-proto'] === 'https' ? '; Secure' : '';
}

/* ─── Database Initialization ─── */
function initDataStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Portfolio Store
  if (!fs.existsSync(PORTFOLIO_FILE)) {
    const initialPortfolio = [
      {
        id: 'p1',
        title: 'Monolith Lounge & Pavilion',
        category: 'Architecture',
        year: '2025',
        location: 'Alibaug, Maharashtra',
        image: 'images/hero.jpg',
        description: 'A monolithic concrete pavilion that dissolves the boundary between shelter and landscape. Raw board-formed concrete walls frame curated views of the Arabian Sea.',
        index: '01',
        createdAt: '2025-03-15T10:00:00Z',
      },
      {
        id: 'p2',
        title: 'Curved Fluted Suite & Wardrobe System',
        category: 'Interiors',
        year: '2026',
        location: 'Nagpur, India',
        image: 'images/feed-curved-wardrobe.jpg',
        description: 'Full-height custom curved wardrobes with seamless fluted oak panelling, soft radius corners, concealed touch-latches, and warm 2700K indirect LED cove illumination.',
        index: '02',
        createdAt: '2026-02-10T10:00:00Z',
      },
      {
        id: 'p3',
        title: 'Cantilevered Study & Acoustic Flutes',
        category: 'Interiors',
        year: '2026',
        location: 'Gurugram, Haryana',
        image: 'images/feed-floating-desk.jpg',
        description: 'Intelligent space planning manifested in a cantilevered solid walnut floating desk with concealed wire-management channels, vertical acoustic wooden slats, and soft ceiling cove wash.',
        index: '03',
        createdAt: '2026-03-01T10:00:00Z',
      },
      {
        id: 'p4',
        title: 'Onda Sculpted Lounge Chair',
        category: 'Objects',
        year: '2024',
        location: 'Studio, Nagpur',
        image: 'images/furniture-1.jpg',
        description: 'Sculpted from a single block of Indian rosewood using CNC milling and hand-finishing techniques passed through three generations.',
        index: '04',
        createdAt: '2024-11-10T10:00:00Z',
      },
      {
        id: 'p5',
        title: 'Terra House',
        category: 'Architecture',
        year: '2026',
        location: 'Auroville, Tamil Nadu',
        image: 'images/arch-2.jpg',
        description: 'A residence that emerges from its site like a geological formation. Rammed-earth walls provide thermal mass in the tropical climate.',
        index: '05',
        createdAt: '2026-01-25T10:00:00Z',
      },
      {
        id: 'p6',
        title: 'Horizon Alpine Residence',
        category: 'Interiors',
        year: '2025',
        location: 'Kasauli, Himachal Pradesh',
        image: 'images/interior-1.jpg',
        description: 'An alpine retreat where every material decision serves the panorama. Floor-to-ceiling glazing dissolves walls into mountain vistas.',
        index: '06',
        createdAt: '2025-06-20T10:00:00Z',
      },
      {
        id: 'p7',
        title: 'Communis Dining Table',
        category: 'Objects',
        year: '2026',
        location: 'Studio, Nagpur',
        image: 'images/furniture-2.jpg',
        description: 'A 3.2-meter live-edge oak dining table resting on blackened steel frames. The Communis celebrates the raw character of the timber.',
        index: '07',
        createdAt: '2026-07-08T10:00:00Z',
      },
      {
        id: 'p8',
        title: 'Sanctum Spa Suite',
        category: 'Interiors',
        year: '2026',
        location: 'Goa, India',
        image: 'images/interior-2.jpg',
        description: 'A private spa suite where water, stone, and light compose a sensory narrative. A monolithic travertine bathtub is positioned against floor-to-ceiling glass.',
        index: '08',
        createdAt: '2026-04-12T10:00:00Z',
      },
    ];
    fs.writeFileSync(PORTFOLIO_FILE, JSON.stringify(initialPortfolio, null, 2), 'utf8');
  }

  // 3. Inquiries Store
  if (!fs.existsSync(INQUIRIES_FILE)) {
    const initialInquiries = [
      {
        id: 'inq1',
        ref: 'FNA-2026-8812',
        name: 'Arjun Malhotra',
        email: 'arjun.malhotra@gmail.com',
        phone: '+91 98765 43210',
        city: 'Mumbai (Bandra West)',
        scopes: ['Interior Architecture', 'Bespoke Curved Joinery', 'Object Commission'],
        notes: 'We are renovating our duplex apartment in Bandra. We admire your work on the Monolith Pavilion — the restrained materiality and curved oak joinery are exactly what we envision.',
        status: 'New',
        createdAt: '2026-11-04T14:30:00Z',
      },
      {
        id: 'inq2',
        ref: 'FNA-2026-7241',
        name: 'Priya Kapoor',
        email: 'priya.kapoor@kapoorgroup.in',
        phone: '+91 98110 54321',
        city: 'New Delhi (Chhatarpur)',
        scopes: ['Architecture', 'Turnkey Execution'],
        notes: 'Commissioning a 2.5-acre modern farmhouse estate in Chhatarpur. Passive solar orientation, raw travertine, and curved board-formed concrete walls.',
        status: 'New',
        createdAt: '2026-11-03T09:15:00Z',
      },
      {
        id: 'inq3',
        ref: 'FNA-2026-4419',
        name: 'Vikram & Nisha Desai',
        email: 'vikram.desai@outlook.com',
        phone: '+91 97400 21098',
        city: 'Bangalore (Indiranagar)',
        scopes: ['Interior Architecture', 'Bespoke Curved Joinery'],
        notes: 'Purchased a heritage residence in Indiranagar. Preserving the vintage shell while inserting curved fluted wardrobe systems and floating study desks.',
        status: 'In Review',
        createdAt: '2026-10-30T16:45:00Z',
      },
      {
        id: 'inq4',
        ref: 'FNA-2026-3105',
        name: 'Devika Singhal',
        email: 'devika@atelierroasters.com',
        phone: '+91 99200 88765',
        city: 'Goa (Assagao)',
        scopes: ['Architecture', 'Interior Architecture'],
        notes: 'Opening an artisan roastery and cafe pavilion in Assagao, Goa. Indoor-outdoor flow, monolithic rammed earth bar counter, bespoke curved wood seating.',
        status: 'Contacted',
        createdAt: '2026-10-25T11:20:00Z',
      },
    ];
    fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(initialInquiries, null, 2), 'utf8');
  }
}

initDataStore();

/* ─── Helpers: File I/O ─── */
function readJson(file, fallback = []) {
  try {
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    }
  } catch (err) {
    console.error(`Read error on ${file}:`, err);
  }
  return fallback;
}

function writeJson(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Write error on ${file}:`, err);
    return false;
  }
}

/* ─── Helpers: Request/Response ─── */
function sendJson(res, statusCode, data, headers = {}) {
  setSecurityHeaders(res);
  const payload = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
    ...headers,
  });
  res.end(payload);
}

function sendError(res, statusCode, message) {
  sendJson(res, statusCode, { error: message });
}

function parseBody(req, maxBytes = 1048576) {
  return new Promise((resolve, reject) => {
    let body = '';
    let bytes = 0;
    req.on('data', (chunk) => {
      bytes += chunk.length;
      if (bytes > maxBytes) {
        req.destroy();
        reject(new Error('Payload Too Large'));
        return;
      }
      body += chunk;
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Invalid JSON Payload'));
      }
    });
    req.on('error', reject);
  });
}

function parseCookies(req) {
  const list = {};
  const rc = req.headers.cookie;
  if (rc) {
    rc.split(';').forEach((cookie) => {
      const parts = cookie.split('=');
      const name = parts.shift().trim();
      const val = decodeURIComponent(parts.join('='));
      list[name] = val;
    });
  }
  return list;
}

function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || '127.0.0.1';
}

/* ─── Rate Limiter ─── */
function checkRateLimit(ip) {
  const record = loginAttempts.get(ip);
  if (!record) return { allowed: true };
  if (record.lockedUntil && Date.now() < record.lockedUntil) {
    const minutesLeft = Math.ceil((record.lockedUntil - Date.now()) / 60000);
    return {
      allowed: false,
      message: `Too many failed login attempts. Authentication locked for ${minutesLeft} minute(s).`,
    };
  }
  return { allowed: true };
}

function recordFailedLogin(ip) {
  const record = loginAttempts.get(ip) || { count: 0, lockedUntil: null };
  record.count += 1;
  if (record.count >= 5) {
    record.lockedUntil = Date.now() + 15 * 60 * 1000; // 15-minute lockout
    record.count = 0;
  }
  loginAttempts.set(ip, record);
}

function resetFailedLogin(ip) {
  loginAttempts.delete(ip);
}

/* ─── Session Validator ─── */
function getAuthenticatedSession(req) {
  const cookies = parseCookies(req);
  const token = cookies['fna_owner_session'];
  if (!token) return null;

  const session = activeSessions.get(token);
  if (!session) return null;

  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    return null;
  }

  // Slide expiration (2 hours)
  session.expiresAt = Date.now() + 2 * 60 * 60 * 1000;
  return session;
}

/* ─── Static File Shield ─── */
function isSafeStaticPath(filePath) {
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(ROOT)) return false;
  // Deny any file inside data/ directory or server source files or hidden files
  if (resolved.startsWith(DATA_DIR)) return false;
  const basename = path.basename(resolved);
  if (basename.startsWith('.') || basename === 'server.js') return false;
  return true;
}

/* ─── Local Dev CORS (allows Live Server / local ports to reach API) ─── */
function applyLocalCors(req, res) {
  const origin = req.headers.origin;
  if (origin && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Vary', 'Origin');
  }
}

/* ══════════════════════════════════════════════════════════════
   HTTP REQUEST DISPATCHER
   ══════════════════════════════════════════════════════════════ */
const server = http.createServer(async (req, res) => {
  const urlParts = req.url.split('?');
  const pathname = urlParts[0];
  const method = req.method.toUpperCase();
  const clientIp = getClientIp(req);

  /* ─────────────────────────────────────────────────────────────
     API ROUTES: /api/...
     ───────────────────────────────────────────────────────────── */
  if (pathname.startsWith('/api/')) {
    applyLocalCors(req, res);
    if (method === 'OPTIONS') {
      setSecurityHeaders(res);
      res.writeHead(204);
      return res.end();
    }
    // 1. Auth: Check Active Session
    if (pathname === '/api/auth/session' && method === 'GET') {
      const session = getAuthenticatedSession(req);
      if (session) {
        return sendJson(res, 200, {
          authenticated: true,
          owner: {
            name: session.ownerName,
            email: session.email,
          },
        });
      }
      return sendJson(res, 200, { authenticated: false });
    }

    // 2. Auth: Login (Owner Only)
    if (pathname === '/api/auth/login' && method === 'POST') {
      const rateLimit = checkRateLimit(clientIp);
      if (!rateLimit.allowed) {
        return sendError(res, 429, rateLimit.message);
      }

      try {
        const { email, password } = await parseBody(req);
        if (!email || !password) {
          return sendError(res, 400, 'Email and password are required.');
        }

        const isEmailMatch = constantTimeEqual(email.trim().toLowerCase(), OWNER_EMAIL.trim().toLowerCase());
        const isPasswordMatch = constantTimeEqual(password, OWNER_PASSWORD);

        if (!isEmailMatch || !isPasswordMatch) {
          recordFailedLogin(clientIp);
          const currentAttempts = (loginAttempts.get(clientIp)?.count || 0);
          const remaining = Math.max(0, 5 - currentAttempts);
          return sendError(res, 401, `Invalid credentials. (${remaining} attempt(s) remaining before security lockout).`);
        }

        // Successful Owner Login
        resetFailedLogin(clientIp);

        // Generate 256-bit cryptographically secure session token
        const sessionToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = Date.now() + 2 * 60 * 60 * 1000; // 2 hours

        activeSessions.set(sessionToken, {
          email: OWNER_EMAIL,
          ownerName: OWNER_NAME,
          expiresAt,
          createdAt: Date.now(),
        });

        const cookieHeader = `fna_owner_session=${sessionToken}; HttpOnly; SameSite=Strict; Path=/; Max-Age=7200${secureCookie(req)}`;
        return sendJson(res, 200, {
          success: true,
          message: 'Owner authenticated successfully.',
          owner: {
            name: OWNER_NAME,
            email: OWNER_EMAIL,
          },
        }, { 'Set-Cookie': cookieHeader });
      } catch (err) {
        return sendError(res, 400, err.message);
      }
    }

    // 3. Auth: Logout
    if (pathname === '/api/auth/logout' && method === 'POST') {
      const cookies = parseCookies(req);
      const token = cookies['fna_owner_session'];
      if (token) {
        activeSessions.delete(token);
      }
      const clearCookie = `fna_owner_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secureCookie(req)}`;
      return sendJson(res, 200, { success: true, message: 'Signed out.' }, { 'Set-Cookie': clearCookie });
    }

    // 4. Inquiries: GET (Owner Only)
    if (pathname === '/api/inquiries' && method === 'GET') {
      const session = getAuthenticatedSession(req);
      if (!session) {
        return sendError(res, 401, 'Access restricted. Studio owner authentication required.');
      }
      const inquiries = readJson(INQUIRIES_FILE, []);
      return sendJson(res, 200, inquiries);
    }

    // 6. Inquiries: POST (Public Client Submission)
    if (pathname === '/api/inquiries' && method === 'POST') {
      try {
        const body = await parseBody(req);
        const name = String(body.name || '').trim();
        const email = String(body.email || '').trim();
        const phone = String(body.phone || '').trim();
        const whatsapp = String(body.whatsapp || phone).trim();
        const clientType = String(body.clientType || 'Private Homeowner / Family').trim();
        const city = String(body.city || '').trim();
        const channel = String(body.channel || 'WhatsApp').trim();
        const timeSlot = String(body.timeSlot || 'Flexible / Anytime').trim();
        const typology = String(body.typology || 'Architecture / Interior').trim();
        const area = String(body.area || '').trim();
        const budget = String(body.budget || '').trim();
        const timeline = String(body.timeline || '').trim();
        const notes = String(body.notes || '').trim();
        const scopes = Array.isArray(body.scopes) ? body.scopes.map(s => String(s).trim()) : [];

        if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return sendError(res, 400, 'Valid name and email address are required.');
        }

        const id = (body.id && typeof body.id === 'string' && body.id.length < 64) ? body.id : ('inq' + Date.now());
        const refCode = (body.ref && /^FNA-\d{4}-\d{4}$/.test(body.ref)) ? body.ref : `FNA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

        const newInquiry = {
          id,
          ref: refCode,
          name,
          email,
          phone,
          whatsapp,
          clientType,
          city,
          channel,
          timeSlot,
          typology,
          area,
          budget,
          timeline,
          scopes,
          notes,
          status: 'New',
          createdAt: new Date().toISOString(),
        };

        const inquiries = readJson(INQUIRIES_FILE, []);
        inquiries.unshift(newInquiry);
        writeJson(INQUIRIES_FILE, inquiries);

        return sendJson(res, 201, { success: true, ref: refCode, inquiry: newInquiry });
      } catch (err) {
        return sendError(res, 400, err.message);
      }
    }

    // 7. Inquiries: PUT /api/inquiries/:id (Owner Only)
    if (pathname.startsWith('/api/inquiries/') && method === 'PUT') {
      const session = getAuthenticatedSession(req);
      if (!session) {
        return sendError(res, 401, 'Unauthorized. Owner session required.');
      }

      const id = pathname.replace('/api/inquiries/', '');
      try {
        const updates = await parseBody(req);
        const inquiries = readJson(INQUIRIES_FILE, []);
        const idx = inquiries.findIndex((i) => i.id === id);
        if (idx === -1) {
          return sendError(res, 404, 'Inquiry not found.');
        }

        if (updates.status) inquiries[idx].status = updates.status;
        if (updates.notes !== undefined) inquiries[idx].notes = updates.notes;
        writeJson(INQUIRIES_FILE, inquiries);

        return sendJson(res, 200, inquiries[idx]);
      } catch (err) {
        return sendError(res, 400, err.message);
      }
    }

    // 8. Inquiries: DELETE /api/inquiries/:id (Owner Only)
    if (pathname.startsWith('/api/inquiries/') && method === 'DELETE') {
      const session = getAuthenticatedSession(req);
      if (!session) {
        return sendError(res, 401, 'Unauthorized. Owner session required.');
      }

      const id = pathname.replace('/api/inquiries/', '');
      let inquiries = readJson(INQUIRIES_FILE, []);
      inquiries = inquiries.filter((i) => i.id !== id);
      writeJson(INQUIRIES_FILE, inquiries);
      return sendJson(res, 200, { success: true, message: 'Inquiry deleted.' });
    }

    // 9. Portfolio: GET (Public)
    if (pathname === '/api/portfolio' && method === 'GET') {
      const portfolio = readJson(PORTFOLIO_FILE, []);
      return sendJson(res, 200, portfolio);
    }

    // 10. Portfolio: POST (Owner Only)
    if (pathname === '/api/portfolio' && method === 'POST') {
      const session = getAuthenticatedSession(req);
      if (!session) {
        return sendError(res, 401, 'Unauthorized. Owner session required.');
      }

      try {
        const body = await parseBody(req, 15 * 1024 * 1024);
        const items = readJson(PORTFOLIO_FILE, []);
        const id = (body.id && typeof body.id === 'string' && body.id.length < 64) ? body.id : ('p' + Date.now());
        const newItem = {
          id,
          title: String(body.title || 'Untitled Project'),
          category: String(body.category || 'Architecture'),
          year: String(body.year || new Date().getFullYear()),
          location: String(body.location || 'Nagpur, India'),
          image: String(body.image || 'images/hero.jpg'),
          description: String(body.description || ''),
          index: String(items.length + 1).padStart(2, '0'),
          createdAt: new Date().toISOString(),
        };

        items.push(newItem);
        writeJson(PORTFOLIO_FILE, items);
        return sendJson(res, 201, newItem);
      } catch (err) {
        return sendError(res, err.message === 'Payload Too Large' ? 413 : 400, err.message);
      }
    }

    // 11. Portfolio: PUT /api/portfolio/:id (Owner Only)
    if (pathname.startsWith('/api/portfolio/') && method === 'PUT') {
      const session = getAuthenticatedSession(req);
      if (!session) {
        return sendError(res, 401, 'Unauthorized. Owner session required.');
      }

      const id = pathname.replace('/api/portfolio/', '');
      try {
        const updates = await parseBody(req, 15 * 1024 * 1024);
        const items = readJson(PORTFOLIO_FILE, []);
        const idx = items.findIndex((i) => i.id === id);
        if (idx === -1) {
          return sendError(res, 404, 'Portfolio item not found.');
        }

        items[idx] = { ...items[idx], ...updates };
        writeJson(PORTFOLIO_FILE, items);
        return sendJson(res, 200, items[idx]);
      } catch (err) {
        return sendError(res, err.message === 'Payload Too Large' ? 413 : 400, err.message);
      }
    }

    // 12. Portfolio: DELETE /api/portfolio/:id (Owner Only)
    if (pathname.startsWith('/api/portfolio/') && method === 'DELETE') {
      const session = getAuthenticatedSession(req);
      if (!session) {
        return sendError(res, 401, 'Unauthorized. Owner session required.');
      }

      const id = pathname.replace('/api/portfolio/', '');
      let items = readJson(PORTFOLIO_FILE, []);
      items = items.filter((i) => i.id !== id);
      items.forEach((item, idx) => {
        item.index = String(idx + 1).padStart(2, '0');
      });
      writeJson(PORTFOLIO_FILE, items);
      return sendJson(res, 200, { success: true, message: 'Portfolio item deleted.' });
    }

    return sendError(res, 404, 'API endpoint not found.');
  }

  /* ─────────────────────────────────────────────────────────────
     STATIC FILE ROUTING & HARDENED PROTECTION
     ───────────────────────────────────────────────────────────── */
  let reqUrl = pathname;
  try {
    reqUrl = decodeURIComponent(pathname);
  } catch(e) {}
  if (reqUrl === '/') reqUrl = '/index.html';

  const safePath = path.normalize(reqUrl).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(ROOT, safePath);

  // Security Check: Path Traversal & Internal Data Protection
  if (!isSafeStaticPath(filePath)) {
    setSecurityHeaders(res);
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('403 Forbidden: Access to protected resource denied.');
  }

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      setSecurityHeaders(res);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
    } else {
      const notFoundPath = path.join(ROOT, '404.html');
      fs.readFile(notFoundPath, (err404, data404) => {
        setSecurityHeaders(res);
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        if (!err404) {
          res.end(data404);
        } else {
          res.end('<h1>404 Not Found</h1>');
        }
      });
    }
  });
});

server.listen(PORT, HOST, () => {
  const displayHost = HOST || '127.0.0.1';
  console.log(`\n======================================================`);
  console.log(`  FNA Design Lab Atelier Web Engine (Secure Production)`);
  console.log(`  Local URL: http://${displayHost}:${PORT}/`);
  console.log(`  Local URL: http://localhost:${PORT}/`);
  console.log(`  Owner Portal: http://localhost:${PORT}/admin.html`);
  console.log(`======================================================\n`);
});
