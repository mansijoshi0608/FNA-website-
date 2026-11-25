/**
 * FNA Design Lab — Shared Data Layer
 * localStorage-backed state with pre-seeded data.
 * Structured for future swap to Supabase / Firebase / FastAPI.
 */

const FNA_DB = {
  KEYS: {
    PORTFOLIO: 'fna_portfolio',
    INQUIRIES: 'fna_inquiries',
    INITIALIZED: 'fna_initialized_v3_6',
  },

  /* ─── Pre-seeded Portfolio Items (Architecture | Interiors | Objects) ─── */
  SEED_PORTFOLIO: [
    {
      id: 'p1',
      title: 'Monolith Lounge & Pavilion',
      category: 'Architecture',
      year: '2025',
      location: 'Alibaug, Maharashtra',
      image: 'images/hero.jpg',
      description: 'A monolithic concrete pavilion that dissolves the boundary between shelter and landscape. Raw board-formed concrete walls frame curated views of the Arabian Sea, while a cantilevered roof plane hovers above an open-air lounge. The interplay of mass and void creates a meditative retreat — architecture as geological event.',
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
      description: 'Full-height custom curved wardrobes with seamless fluted oak panelling, soft radius corners, concealed touch-latches, and warm 2700K indirect LED cove illumination. Designed for effortless spatial continuity, eliminating visual clutter in a modern luxury master sanctuary with honed travertine floors.',
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
      description: 'Intelligent space planning manifested in a cantilevered solid walnut floating desk with concealed wire-management channels, vertical acoustic wooden slats, and soft ceiling cove wash. A dedicated sanctuary for deep work and spatial serenity.',
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
      description: 'Sculpted from a single block of Indian rosewood using CNC milling and hand-finishing techniques passed through three generations. The Onda explores the tension between digital precision and artisanal intuition. Each curve is calibrated for ergonomic support while maintaining the visual weightlessness of a continuous ribbon.',
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
      description: 'A residence that emerges from its site like a geological formation. Rammed-earth walls provide thermal mass in the tropical climate, while deep overhangs and a central courtyard orchestrate passive cooling. Mature olive and neem trees were preserved in situ — the architecture negotiates with the existing landscape rather than imposing upon it.',
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
      description: 'An alpine retreat where every material decision serves the panorama. Floor-to-ceiling glazing dissolves walls into mountain vistas. Bespoke walnut millwork, polished concrete floors, and a restrained palette of earth tones create warmth without competing with nature. The kitchen island doubles as a sculptural anchor — a monolith of honed basalt.',
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
      description: 'A 3.2-meter live-edge oak dining table resting on blackened steel frames. The Communis celebrates the raw character of the timber — every knot, crack, and grain line is preserved and highlighted. Designed for gathering, its proportions encourage conversation across its generous width.',
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
      description: 'A private spa suite where water, stone, and light compose a sensory narrative. A monolithic travertine bathtub is positioned against floor-to-ceiling glass overlooking a curated fern garden. Brass fixtures age gracefully, developing a living patina. Every surface invites touch — a space designed not just to be seen, but to be felt.',
      index: '08',
      createdAt: '2026-04-12T10:00:00Z',
    },
  ],

  /* ─── Pre-seeded Client Inquiries ─── */
  SEED_INQUIRIES: [
    {
      id: 'inq1',
      ref: 'FNA-2026-8812',
      name: 'Arjun Malhotra',
      email: 'arjun.malhotra@gmail.com',
      phone: '+91 98765 43210',
      whatsapp: '+91 98765 43210',
      clientType: 'Private Homeowner / Family',
      city: 'Mumbai (Bandra West)',
      channel: 'WhatsApp',
      timeSlot: 'Evening (5 PM – 8 PM)',
      scopes: ['Interior Architecture', 'Bespoke Curved Joinery', 'Object Commission'],
      typology: 'Luxury Penthouse / Apartment',
      area: '4,200 sq ft',
      budget: '₹50L – ₹1 Cr',
      timeline: '3–6 Months',
      notes: 'We are renovating our 4,200 sq ft duplex apartment in Bandra. We admire your work on the Monolith Pavilion — the restrained materiality and curved oak joinery are exactly what we envision. Looking forward to discussing the vision via WhatsApp first.',
      status: 'New',
      createdAt: '2026-11-04T14:30:00Z',
    },
    {
      id: 'inq2',
      ref: 'FNA-2026-7241',
      name: 'Priya Kapoor',
      email: 'priya.kapoor@kapoorgroup.in',
      phone: '+91 98110 54321',
      whatsapp: '+91 98110 54321',
      clientType: 'Real Estate Developer',
      city: 'New Delhi (Chhatarpur)',
      channel: 'Phone Call',
      timeSlot: 'Morning (10 AM – 1 PM)',
      scopes: ['Architecture', 'Turnkey Execution', 'Spatial Consultation'],
      typology: 'Private Villa / Bungalow',
      area: '10,000+ sq ft',
      budget: '₹2.5 Cr+',
      timeline: '6–12 Months',
      notes: 'Commissioning a 2.5-acre modern farmhouse estate in Chhatarpur. Passive solar orientation, raw travertine, and curved board-formed concrete walls. Need turnkey architectural design and site execution supervision. Please give me a call during morning hours.',
      status: 'New',
      createdAt: '2026-11-03T09:15:00Z',
    },
    {
      id: 'inq3',
      ref: 'FNA-2026-4419',
      name: 'Vikram & Nisha Desai',
      email: 'vikram.desai@outlook.com',
      phone: '+91 97400 21098',
      whatsapp: '+91 97400 21098',
      clientType: 'Private Homeowner / Family',
      city: 'Bangalore (Indiranagar)',
      channel: 'Studio Meeting',
      timeSlot: 'Afternoon (1 PM – 5 PM)',
      scopes: ['Interior Architecture', 'Bespoke Curved Joinery'],
      typology: 'Private Villa / Bungalow',
      area: '5,000 – 10,000 sq ft',
      budget: '₹1 Cr – ₹2.5 Cr',
      timeline: 'Immediate (Next 1–3 Months)',
      notes: 'Purchased a heritage residence in Indiranagar. Preserving the vintage shell while inserting curved fluted wardrobe systems, floating study desks, and monolithic terrazzo bath suites. We would love to fly down to Nagpur for a studio consultation.',
      status: 'In Review',
      createdAt: '2026-10-30T16:45:00Z',
    },
    {
      id: 'inq4',
      ref: 'FNA-2026-3105',
      name: 'Devika Singhal',
      email: 'devika@atelierroasters.com',
      phone: '+91 99200 88765',
      whatsapp: '+91 99200 88765',
      clientType: 'Hospitality / Cafe / Boutique Hotel',
      city: 'Goa (Assagao)',
      channel: 'WhatsApp',
      timeSlot: 'Flexible / Anytime',
      scopes: ['Architecture', 'Interior Architecture', 'Object Commission'],
      typology: 'Hospitality / Cafe / Restaurant',
      area: '2,000 – 5,000 sq ft',
      budget: '₹50L – ₹1 Cr',
      timeline: '3–6 Months',
      notes: 'Opening an artisan roastery and cafe pavilion in Assagao, Goa. Indoor-outdoor flow, monolithic rammed earth bar counter, bespoke curved wood seating. Looking for an architectural signature that reflects tactile luxury.',
      status: 'Contacted',
      createdAt: '2026-10-25T11:20:00Z',
    },
  ],

  /* ─── Core API ─── */
  init() {
    if (localStorage.getItem(this.KEYS.INITIALIZED) !== 'true') {
      localStorage.setItem(this.KEYS.PORTFOLIO, JSON.stringify(this.SEED_PORTFOLIO));
      localStorage.setItem(this.KEYS.INQUIRIES, JSON.stringify(this.SEED_INQUIRIES));
      localStorage.setItem(this.KEYS.INITIALIZED, 'true');
    }
  },

  normalizeCategory(cat) {
    if (!cat) return 'Objects';
    const c = String(cat).toLowerCase();
    if (c.includes('arch')) return 'Architecture';
    if (c.includes('inter')) return 'Interiors';
    if (c.includes('furn') || c.includes('obj')) return 'Objects';
    return cat;
  },

  getPortfolio() {
    this.init();
    return JSON.parse(localStorage.getItem(this.KEYS.PORTFOLIO) || '[]');
  },

  getInquiries() {
    this.init();
    return JSON.parse(localStorage.getItem(this.KEYS.INQUIRIES) || '[]');
  },

  async addPortfolioItem(item) {
    const items = this.getPortfolio();
    const newItem = {
      ...item,
      id: 'p' + Date.now(),
      index: String(items.length + 1).padStart(2, '0'),
      createdAt: new Date().toISOString(),
    };
    try {
      const res = await this._apiFetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save portfolio item to server.');
      }
      items.push(data);
      localStorage.setItem(this.KEYS.PORTFOLIO, JSON.stringify(items));
      return data;
    } catch (err) {
      if (err.message === 'ERR_SERVER_OFFLINE') {
        items.push(newItem);
        localStorage.setItem(this.KEYS.PORTFOLIO, JSON.stringify(items));
        return newItem;
      }
      throw err;
    }
  },

  async updatePortfolioItem(id, updates) {
    const applyLocalUpdate = (savedItem) => {
      const items = this.getPortfolio();
      const idx = items.findIndex(i => i.id === id);
      if (idx !== -1) {
        items[idx] = savedItem || { ...items[idx], ...updates };
        localStorage.setItem(this.KEYS.PORTFOLIO, JSON.stringify(items));
        return items[idx];
      }
      return null;
    };

    try {
      const res = await this._apiFetch(`/api/portfolio/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update portfolio item.');
      }
      return applyLocalUpdate(data);
    } catch (err) {
      if (err.message === 'ERR_SERVER_OFFLINE') {
        return applyLocalUpdate(null);
      }
      throw err;
    }
  },

  async deletePortfolioItem(id) {
    const applyLocalDelete = () => {
      let items = this.getPortfolio().filter(i => i.id !== id);
      items.forEach((item, i) => { item.index = String(i + 1).padStart(2, '0'); });
      localStorage.setItem(this.KEYS.PORTFOLIO, JSON.stringify(items));
      return true;
    };

    try {
      const res = await this._apiFetch(`/api/portfolio/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete portfolio item.');
      }
      return applyLocalDelete();
    } catch (err) {
      if (err.message === 'ERR_SERVER_OFFLINE') {
        return applyLocalDelete();
      }
      throw err;
    }
  },

  async addInquiry(inquiry) {
    const items = this.getInquiries();
    const newInquiry = {
      ...inquiry,
      id: inquiry.id || ('inq' + Date.now()),
      ref: inquiry.ref || `FNA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'New',
      createdAt: new Date().toISOString(),
    };
    items.unshift(newInquiry);
    localStorage.setItem(this.KEYS.INQUIRIES, JSON.stringify(items));
    try {
      const res = await this._apiFetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInquiry)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.inquiry) return data.inquiry;
      }
    } catch (e) {}
    return newInquiry;
  },

  async updateInquiryStatus(id, status) {
    const applyLocalStatus = (saved) => {
      const items = this.getInquiries();
      const idx = items.findIndex(i => i.id === id);
      if (idx !== -1) {
        items[idx] = saved || { ...items[idx], status };
        localStorage.setItem(this.KEYS.INQUIRIES, JSON.stringify(items));
        return items[idx];
      }
      return null;
    };

    try {
      const res = await this._apiFetch(`/api/inquiries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update inquiry status.');
      }
      return applyLocalStatus(data);
    } catch (err) {
      if (err.message === 'ERR_SERVER_OFFLINE') {
        return applyLocalStatus(null);
      }
      throw err;
    }
  },

  async deleteInquiry(id) {
    const applyLocalDelete = () => {
      const items = this.getInquiries().filter(i => i.id !== id);
      localStorage.setItem(this.KEYS.INQUIRIES, JSON.stringify(items));
      return true;
    };

    try {
      const res = await this._apiFetch(`/api/inquiries/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete inquiry.');
      }
      return applyLocalDelete();
    } catch (err) {
      if (err.message === 'ERR_SERVER_OFFLINE') {
        return applyLocalDelete();
      }
      throw err;
    }
  },

  /* ─── Resilient API Fetch (supports Node server + Live Server / file:// fallback) ─── */
  _apiBase: '',

  async _apiFetch(path, options = {}) {
    const isHttp = window.location.protocol === 'http:' || window.location.protocol === 'https:';
    const fallbackHost = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? window.location.hostname
      : '127.0.0.1';
    const fallbackBase = `http://${fallbackHost}:3000`;

    const tryFetch = async (base, creds) => {
      const res = await fetch(`${base}${path}`, { credentials: creds, ...options });
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('NON_JSON_RESPONSE');
      }
      return res;
    };

    if (isHttp && this._apiBase !== fallbackBase) {
      try {
        return await tryFetch(this._apiBase, 'same-origin');
      } catch (err) {
        if (window.location.port !== '3000') {
          try {
            const res = await tryFetch(fallbackBase, 'include');
            this._apiBase = fallbackBase;
            return res;
          } catch (_) {}
        }
        throw new Error('ERR_SERVER_OFFLINE');
      }
    }

    try {
      return await tryFetch(fallbackBase, 'include');
    } catch (_) {
      throw new Error('ERR_SERVER_OFFLINE');
    }
  },

  /* ─── Server-Side Owner Authentication ─── */
  _sessionUser: null,

  async login(email, password) {
    try {
      const res = await this._apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');
      this._sessionUser = data.owner;
      sessionStorage.setItem('fna_owner_active', 'true');
      return { success: true, owner: data.owner };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async logout() {
    try {
      await this._apiFetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    this._sessionUser = null;
    sessionStorage.removeItem('fna_owner_active');
    return true;
  },

  async verifySession() {
    try {
      const res = await this._apiFetch('/api/auth/session');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          this._sessionUser = data.owner;
          sessionStorage.setItem('fna_owner_active', 'true');
          return true;
        }
      }
    } catch (err) {}
    this._sessionUser = null;
    sessionStorage.removeItem('fna_owner_active');
    return false;
  },

  isLoggedIn() {
    return sessionStorage.getItem('fna_owner_active') === 'true';
  },

  /* ─── Server Sync Methods ─── */
  async fetchPortfolioFromServer() {
    try {
      const res = await this._apiFetch('/api/portfolio');
      if (res.ok) {
        const items = await res.json();
        if (Array.isArray(items)) {
          localStorage.setItem(this.KEYS.PORTFOLIO, JSON.stringify(items));
          return items;
        }
      }
    } catch (e) {}
    return this.getPortfolio();
  },

  async fetchInquiriesFromServer() {
    try {
      const res = await this._apiFetch('/api/inquiries');
      if (res.ok) {
        const items = await res.json();
        if (Array.isArray(items)) {
          localStorage.setItem(this.KEYS.INQUIRIES, JSON.stringify(items));
          return items;
        }
      }
    } catch (e) {}
    return this.getInquiries();
  },

  /* ─── Utility: Export Inquiries as CSV (Formula-Injection Hardened) ─── */
  exportInquiriesCSV() {
    const inquiries = this.getInquiries();
    const headers = [
      'Ref ID',
      'Client Name',
      'Client Profile',
      'Email Address',
      'Calling Phone',
      'WhatsApp Number',
      'Project City',
      'Preferred Contact Channel',
      'Preferred Time Slot',
      'Disciplines',
      'Typology',
      'Carpet Area',
      'Budget Range',
      'Timeline',
      'Brief / Notes',
      'Status',
      'Submission Date'
    ];

    // CSV Formula Injection Shield
    const sanitizeCsv = (val) => {
      let str = String(val == null ? '' : val);
      if (/^[=+\-@\t\r]/.test(str)) {
        str = "'" + str; // Neutralize formula execution in Excel/Sheets
      }
      return `"${str.replace(/"/g, '""')}"`;
    };

    const rows = inquiries.map(i => [
      sanitizeCsv(i.ref || 'FNA-LEGACY'),
      sanitizeCsv(i.name || ''),
      sanitizeCsv(i.clientType || 'Private Client'),
      sanitizeCsv(i.email || ''),
      sanitizeCsv(i.phone || ''),
      sanitizeCsv(i.whatsapp || i.phone || ''),
      sanitizeCsv(i.city || ''),
      sanitizeCsv(i.channel || 'WhatsApp'),
      sanitizeCsv(i.timeSlot || 'Anytime'),
      sanitizeCsv((i.scopes || []).join('; ')),
      sanitizeCsv(i.typology || 'Architecture / Interior'),
      sanitizeCsv(i.area || '—'),
      sanitizeCsv(i.budget || '—'),
      sanitizeCsv(i.timeline || 'Standard'),
      sanitizeCsv(i.notes || i.message || ''),
      sanitizeCsv(i.status || 'New'),
      sanitizeCsv(new Date(i.createdAt || i.timestamp || Date.now()).toLocaleDateString('en-IN')),
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FNA_Client_Inquiries_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },
};

/* Initialize on load */
FNA_DB.init();
