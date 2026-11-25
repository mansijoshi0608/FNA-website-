/**
 * FNA Design Lab — Admin Portal Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  const loginPage = document.getElementById('login-page');
  const dashboard = document.getElementById('admin-dashboard');

  /* ─── Auth Flow ─── */
  async function checkAuth() {
    const isAuthed = await FNA_DB.verifySession();
    if (isAuthed) {
      loginPage.style.display = 'none';
      dashboard.classList.add('active');
      await initDashboard();
    } else {
      loginPage.style.display = '';
      dashboard.classList.remove('active');
    }
  }

  /* Secure Owner Login (server-side verification) */
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      const errorEl = document.getElementById('login-error');
      const submitBtn = document.getElementById('btn-login-submit');

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Verifying with Atelier…';
      }

      const res = await FNA_DB.login(email, password);

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Authenticate as Owner →';
      }

      if (res.success) {
        errorEl.classList.remove('active');
        await checkAuth();
        showToast(`Welcome back, ${res.owner?.name || 'Principal Architect'}.`, 'success');
      } else {
        errorEl.textContent = res.error || 'Invalid credentials. Only the verified studio owner may sign in.';
        errorEl.classList.add('active');
        shakeElement(loginForm);
        showToast(res.error || 'Authentication rejected.', 'error');
      }
    });
  }

  /* Owner credential management information */
  const securityModal = document.getElementById('security-modal');
  const btnOpenSecurity = document.getElementById('btn-open-security');
  const securityModalClose = document.getElementById('security-modal-close');

  if (btnOpenSecurity && securityModal) {
    btnOpenSecurity.addEventListener('click', () => {
      securityModal.style.display = 'flex';
    });
  }

  if (securityModalClose && securityModal) {
    securityModalClose.addEventListener('click', () => {
      securityModal.style.display = 'none';
    });
    securityModal.addEventListener('click', (e) => {
      if (e.target === securityModal) securityModal.style.display = 'none';
    });
  }

  /* Easter Egg 1: Click Logo 3 times for Blueprint CAD Mode */
  let logoClickCount = 0;
  let logoClickTimeout = null;
  const easterLogo = document.getElementById('login-easter-logo');
  const blueprintOverlay = document.getElementById('blueprint-overlay');

  function toggleBlueprintMode() {
    const isBp = document.body.classList.toggle('blueprint-mode');
    if (blueprintOverlay) blueprintOverlay.classList.toggle('active', isBp);
    showToast(isBp ? '📐 Blueprint CAD Mode Activated! Scale 1:50.' : 'Standard Studio View Restored.', 'info');
  }

  if (easterLogo) {
    easterLogo.addEventListener('click', () => {
      logoClickCount++;
      clearTimeout(logoClickTimeout);
      logoClickTimeout = setTimeout(() => { logoClickCount = 0; }, 1200);

      if (logoClickCount === 3) {
        logoClickCount = 0;
        toggleBlueprintMode();
      }
    });
  }

  // Key 'B' shortcut for Blueprint mode
  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'b' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
      toggleBlueprintMode();
    }
  });

  /* Easter Egg 2: Spatial Compass Click */
  const easterCompass = document.getElementById('easter-compass');
  const compassNeedle = document.getElementById('compass-needle');
  const easterQuote = document.getElementById('easter-quote-box');
  let compassDegrees = 0;

  if (easterCompass) {
    easterCompass.addEventListener('click', () => {
      compassDegrees += 360;
      if (compassNeedle) compassNeedle.style.transform = `rotate(${compassDegrees}deg)`;
      if (easterQuote) {
        easterQuote.style.display = easterQuote.style.display === 'none' ? 'block' : 'none';
      }
      showToast('📍 Spatial Coordinates Calibrated: 21.1354° N, 79.0692° E', 'info');
    });
  }

  /* Easter Egg 3: Tri-color Bar Wave */
  const easterTribar = document.getElementById('easter-tribar');
  if (easterTribar) {
    easterTribar.addEventListener('click', () => {
      easterTribar.classList.add('pulse-wave');
      setTimeout(() => easterTribar.classList.remove('pulse-wave'), 1000);
      showToast('Terracotta #A24929 · Petroleum Slate #25383E · Forest Olive #525C3A', 'info');
    });
  }

  /* Logout */
  document.getElementById('btn-logout').addEventListener('click', async () => {
    await FNA_DB.logout();
    await checkAuth();
    /* Reset login fields */
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
    document.getElementById('login-error').classList.remove('active');
    showToast('Signed out of admin portal.', 'info');
  });

  checkAuth();

  /* ─── Dashboard Init ─── */
  async function initDashboard() {
    await Promise.all([
      FNA_DB.fetchPortfolioFromServer(),
      FNA_DB.fetchInquiriesFromServer()
    ]);
    updateMetrics();
    renderInquiries();
    renderInventory();
  }

  /* ─── Metrics (4 Key Studio KPIs) ─── */
  function updateMetrics() {
    const inquiries = FNA_DB.getInquiries();
    const portfolio = FNA_DB.getPortfolio();
    const totalEl = document.getElementById('metric-total');
    const newEl = document.getElementById('metric-new');
    const reachEl = document.getElementById('metric-reach');
    const portEl = document.getElementById('metric-portfolio');

    const newCount = inquiries.filter(i => (i.status || 'New') === 'New').length;
    const directReachCount = inquiries.filter(i => {
      const ch = (i.channel || '').toLowerCase();
      return ch.includes('whatsapp') || ch.includes('phone') || ch.includes('call');
    }).length;

    if (totalEl) totalEl.textContent = inquiries.length;
    if (newEl) newEl.textContent = newCount;
    if (reachEl) reachEl.textContent = directReachCount;
    if (portEl) portEl.textContent = portfolio.length;

    // Filter pill count badges
    const filterAllCount = document.getElementById('filter-all-count');
    const filterNewCount = document.getElementById('filter-new-count');
    if (filterAllCount) filterAllCount.textContent = inquiries.length;
    if (filterNewCount) filterNewCount.textContent = newCount;
  }

  /* ─── Tabs ─── */
  const tabButtons = document.querySelectorAll('.admin-tab');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
      document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
    });
  });

  /* ═══════════════════════════════════════════════════════
     TAB A: CLIENT INQUIRIES CRM & DIRECT CONNECT ENGINE
     ═══════════════════════════════════════════════════════ */

  let currentSearch = '';
  let activeFilter = 'all';

  // Filter Pills Binding
  const filterPills = document.querySelectorAll('.crm-filter-pill');
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeFilter = pill.getAttribute('data-filter') || 'all';
      renderInquiries();
    });
  });

  function renderInquiries() {
    const inquiries = FNA_DB.getInquiries();
    const tbody = document.getElementById('inquiry-tbody');
    tbody.innerHTML = '';

    // Apply Active Filter Pill
    let filtered = inquiries;
    if (activeFilter === 'new') {
      filtered = filtered.filter(i => (i.status || 'New') === 'New');
    } else if (activeFilter === 'whatsapp') {
      filtered = filtered.filter(i => (i.channel || '').toLowerCase().includes('whatsapp'));
    } else if (activeFilter === 'call') {
      filtered = filtered.filter(i => (i.channel || '').toLowerCase().includes('call') || (i.channel || '').toLowerCase().includes('phone'));
    } else if (activeFilter === 'high-budget') {
      filtered = filtered.filter(i => (i.budget || '').includes('1 Cr') || (i.budget || '').includes('2.5 Cr') || (i.budget || '').includes('2Cr'));
    }

    // Apply Search Query
    if (currentSearch) {
      filtered = filtered.filter(i =>
        (i.name || '').toLowerCase().includes(currentSearch) ||
        (i.email || '').toLowerCase().includes(currentSearch) ||
        (i.phone || '').toLowerCase().includes(currentSearch) ||
        (i.whatsapp || '').toLowerCase().includes(currentSearch) ||
        (i.city || '').toLowerCase().includes(currentSearch) ||
        (i.typology || '').toLowerCase().includes(currentSearch) ||
        (i.ref || '').toLowerCase().includes(currentSearch)
      );
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 3rem; color: #64748B;">No matching inquiries found in registry.</td></tr>`;
      return;
    }

    filtered.forEach(inq => {
      const tr = document.createElement('tr');
      const cleanPhone = (inq.whatsapp || inq.phone || '').replace(/[^0-9]/g, '');
      const refCode = inq.ref || `FNA-2026-${inq.id || '0000'}`;
      const channel = inq.channel || 'WhatsApp';
      const timeSlot = inq.timeSlot || 'Flexible / Anytime';
      const typology = inq.typology || 'Architecture / Interior';
      const area = inq.area || '2,000–5,000 sq ft';
      const budget = inq.budget || '₹50L – ₹1 Cr';
      const timeline = inq.timeline || '3–6 Months';

      const scopesBadges = (inq.scopes || []).map(s => {
        let badgeClass = 'badge-interiors';
        if (s.toLowerCase().includes('arch')) badgeClass = 'badge-arch';
        if (s.toLowerCase().includes('object') || s.toLowerCase().includes('furn') || s.toLowerCase().includes('join')) badgeClass = 'badge-objects';
        return `<span class="type-badge ${badgeClass} font-mono" style="margin: 2px 2px 2px 0; display: inline-block;">${escapeHTML(s)}</span>`;
      }).join('') || '<span class="text-mist">—</span>';

      // Prefilled WhatsApp link
      const waGreeting = encodeURIComponent(`Hello ${inq.name}, thank you for reaching out to FNA Design Lab regarding your ${typology} in ${inq.city || 'your area'}. Principal Architect Aayushi reviewed your project dossier [${refCode}] and would love to connect.`);
      const waLink = cleanPhone ? `https://wa.me/${cleanPhone}?text=${waGreeting}` : '#';

      tr.innerHTML = `
        <td>
          <div class="client-meta-box">
            <strong style="display: block; font-size: 0.95rem; color: #0F172A; margin-bottom: 2px;">${escapeHTML(inq.name)}</strong>
            <span class="crm-pill-badge" style="background: rgba(162, 73, 41, 0.08); color: var(--fna-terracotta);">${escapeHTML(refCode)}</span>
            <div style="font-size: 0.74rem; color: #64748B; margin-top: 3px;">
              ${escapeHTML(inq.clientType || 'Private Homeowner')} · <strong>${escapeHTML(inq.city || '—')}</strong>
            </div>
          </div>
        </td>
        <td>
          <div class="direct-actions-cell">
            ${cleanPhone ? `<a href="${waLink}" target="_blank" class="btn-crm-whatsapp" title="Open Instant WhatsApp Chat with client"><span>💬</span> WhatsApp</a>` : ''}
            ${inq.phone ? `<a href="tel:${escapeHTML(inq.phone)}" class="btn-crm-call"><span>📞</span> ${escapeHTML(inq.phone)}</a>` : ''}
            <a href="mailto:${escapeHTML(inq.email)}" class="btn-crm-mail"><span>✉️</span> ${escapeHTML(inq.email)}</a>
          </div>
        </td>
        <td>
          <div>
            <span class="crm-pill-badge ${channel.toLowerCase().includes('whatsapp') ? 'channel-whatsapp' : 'channel-call'}">
              ${channel.toLowerCase().includes('whatsapp') ? '💬 ' : channel.toLowerCase().includes('call') ? '📞 ' : channel.toLowerCase().includes('email') ? '✉️ ' : '🏛️ '}${escapeHTML(channel)}
            </span>
            <div style="font-family: var(--font-mono); font-size: 0.7rem; color: #64748B; margin-top: 3px;">
              ${escapeHTML(timeSlot)}
            </div>
          </div>
        </td>
        <td>
          <div>
            <strong style="display: block; font-size: 0.825rem; color: #0F172A;">${escapeHTML(typology)}</strong>
            <span class="text-xs font-mono text-mist">${escapeHTML(area)}</span>
            <div style="margin-top: 4px;">${scopesBadges}</div>
          </div>
        </td>
        <td>
          <div>
            <span class="crm-pill-badge budget-high">${escapeHTML(budget)}</span>
            <div style="font-family: var(--font-mono); font-size: 0.7rem; color: #64748B; margin-top: 2px;">
              ${escapeHTML(timeline)}
            </div>
          </div>
        </td>
        <td>
          <select class="status-select" data-id="${inq.id}" onchange="updateInquiryStatus(this)">
            <option value="New" ${inq.status === 'New' ? 'selected' : ''}>New Lead</option>
            <option value="In Review" ${inq.status === 'In Review' ? 'selected' : ''}>In Review</option>
            <option value="Contacted" ${inq.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
            <option value="Meeting Scheduled" ${inq.status === 'Meeting Scheduled' ? 'selected' : ''}>Meeting Scheduled</option>
            <option value="Proposal Sent" ${inq.status === 'Proposal Sent' ? 'selected' : ''}>Proposal Sent</option>
            <option value="Commissioned" ${inq.status === 'Commissioned' ? 'selected' : ''}>Commissioned</option>
          </select>
        </td>
        <td>
          <div class="table-actions">
            <button type="button" class="btn-sm primary" onclick="viewInquiryDossier('${inq.id}')">👁️ Dossier</button>
            <button type="button" class="btn-sm danger" onclick="deleteInquiry('${inq.id}')">Delete</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  /* Search */
  document.getElementById('inquiry-search').addEventListener('input', (e) => {
    currentSearch = e.target.value.trim().toLowerCase();
    renderInquiries();
  });

  /* Export CSV */
  document.getElementById('btn-export-csv').addEventListener('click', () => {
    FNA_DB.exportInquiriesCSV();
    showToast('Complete Client Inquiries exported to CSV.', 'success');
  });

  /* View Client Dossier Modal */
  window.viewInquiryDossier = function(id) {
    const inq = FNA_DB.getInquiries().find(i => i.id === id);
    if (!inq) return;

    const modal = document.getElementById('inquiry-modal');
    const modalRef = document.getElementById('modal-dossier-ref');
    const modalName = document.getElementById('modal-dossier-name');
    const modalMeta = document.getElementById('modal-dossier-meta');
    const modalBody = document.getElementById('modal-dossier-body');

    if (!modal) return;

    const refCode = inq.ref || `FNA-2026-${inq.id}`;
    const cleanPhone = (inq.whatsapp || inq.phone || '').replace(/[^0-9]/g, '');
    const waGreeting = encodeURIComponent(`Hello ${inq.name}, Principal Architect Aayushi from FNA Design Lab is following up on your project enquiry [${refCode}] for your ${inq.typology || 'project'}.`);
    const waLink = cleanPhone ? `https://wa.me/${cleanPhone}?text=${waGreeting}` : '#';

    modalRef.textContent = `REF: ${refCode}`;
    modalName.textContent = inq.name;
    modalMeta.textContent = `${inq.city || 'India'} · ${inq.clientType || 'Private Homeowner'} · Submitted ${new Date(inq.createdAt || inq.timestamp || Date.now()).toLocaleDateString('en-IN')}`;

    modalBody.innerHTML = `
      <!-- Quick Action Buttons -->
      <div class="modal-cta-row">
        ${cleanPhone ? `<a href="${waLink}" target="_blank" class="btn-modal-wa"><span>💬</span> Open WhatsApp Chat</a>` : ''}
        ${inq.phone ? `<a href="tel:${escapeHTML(inq.phone)}" class="btn-modal-call"><span>📞</span> Call (${escapeHTML(inq.phone)})</a>` : ''}
        <a href="mailto:${escapeHTML(inq.email)}" class="btn-modal-email"><span>✉️</span> Email Proposal</a>
      </div>

      <!-- Section 1: Contact Coordinates & Preferred Channel -->
      <div class="modal-section-box">
        <span class="modal-section-title">01 / Connection Coordinates &amp; Preferences</span>
        <div class="modal-key-value-grid">
          <div class="kv-item"><span class="kv-label">Email Address</span><span class="kv-value"><a href="mailto:${escapeHTML(inq.email)}" style="text-decoration: underline; color: var(--fna-terracotta);">${escapeHTML(inq.email)}</a></span></div>
          <div class="kv-item"><span class="kv-label">Primary Calling Phone</span><span class="kv-value">${escapeHTML(inq.phone || '—')}</span></div>
          <div class="kv-item"><span class="kv-label">WhatsApp Number</span><span class="kv-value">${escapeHTML(inq.whatsapp || inq.phone || '—')}</span></div>
          <div class="kv-item"><span class="kv-label">Project City / Location</span><span class="kv-value">${escapeHTML(inq.city || '—')}</span></div>
          <div class="kv-item"><span class="kv-label">Preferred Reach Channel</span><span class="kv-value" style="color: var(--fna-terracotta); font-weight: 700;">${escapeHTML(inq.channel || 'WhatsApp')}</span></div>
          <div class="kv-item"><span class="kv-label">Best Reach Time Window</span><span class="kv-value">${escapeHTML(inq.timeSlot || 'Flexible / Anytime')}</span></div>
        </div>
      </div>

      <!-- Section 2: Project Specifications -->
      <div class="modal-section-box">
        <span class="modal-section-title">02 / Spatial Parameters &amp; Scope</span>
        <div class="modal-key-value-grid">
          <div class="kv-item"><span class="kv-label">Project Typology</span><span class="kv-value">${escapeHTML(inq.typology || 'Architecture / Interior')}</span></div>
          <div class="kv-item"><span class="kv-label">Carpet Area</span><span class="kv-value">${escapeHTML(inq.area || '—')}</span></div>
          <div class="kv-item"><span class="kv-label">Estimated Budget</span><span class="kv-value">${escapeHTML(inq.budget || '—')}</span></div>
          <div class="kv-item"><span class="kv-label">Target Timeline</span><span class="kv-value">${escapeHTML(inq.timeline || '—')}</span></div>
          <div class="kv-item" style="grid-column: 1 / -1;"><span class="kv-label">Selected Disciplines</span><span class="kv-value">${(inq.scopes || []).map(escapeHTML).join(' · ') || '—'}</span></div>
        </div>
      </div>

      <!-- Section 3: Full Spatial Brief / Notes -->
      <div class="modal-section-box">
        <span class="modal-section-title">03 / Client Spatial Brief &amp; Intentions</span>
        <p style="font-size: 0.88rem; line-height: 1.6; color: #1E293B; white-space: pre-wrap;">${escapeHTML(inq.notes || inq.message || 'No specific notes provided.')}</p>
      </div>

      <!-- Status Updater Inside Modal -->
      <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 0.5rem; border-top: 1px solid #E2E8F0; flex-wrap: wrap; gap: 0.75rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span class="kv-label" style="margin: 0;">Update Status:</span>
          <select class="status-select" onchange="updateInquiryStatusFromModal('${inq.id}', this.value)">
            <option value="New" ${inq.status === 'New' ? 'selected' : ''}>New Lead</option>
            <option value="In Review" ${inq.status === 'In Review' ? 'selected' : ''}>In Review</option>
            <option value="Contacted" ${inq.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
            <option value="Meeting Scheduled" ${inq.status === 'Meeting Scheduled' ? 'selected' : ''}>Meeting Scheduled</option>
            <option value="Proposal Sent" ${inq.status === 'Proposal Sent' ? 'selected' : ''}>Proposal Sent</option>
            <option value="Commissioned" ${inq.status === 'Commissioned' ? 'selected' : ''}>Commissioned</option>
          </select>
        </div>
        <button type="button" class="btn-outline" onclick="window.print()">🖨️ Print Dossier</button>
      </div>
    `;

    modal.style.display = 'flex';
  };

  window.updateInquiryStatusFromModal = async function(id, status) {
    try {
      await FNA_DB.updateInquiryStatus(id, status);
      updateMetrics();
      renderInquiries();
      showToast(`Inquiry status updated to "${status}".`, 'info');
    } catch (err) {
      showToast(err.message || 'Could not save inquiry status.', 'error');
    }
  };

  // Close Dossier Modal
  const modalClose = document.getElementById('modal-dossier-close');
  const modal = document.getElementById('inquiry-modal');
  if (modalClose && modal) {
    modalClose.addEventListener('click', () => { modal.style.display = 'none'; });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const dossierModal = document.getElementById('inquiry-modal');
      const secModal = document.getElementById('security-modal');
      const editModal = document.getElementById('edit-modal');
      if (dossierModal && dossierModal.style.display !== 'none') dossierModal.style.display = 'none';
      if (secModal && secModal.style.display !== 'none') secModal.style.display = 'none';
      if (editModal && editModal.style.display !== 'none') editModal.style.display = 'none';
    }
  });

  /* Global functions for inline handlers */
  window.updateInquiryStatus = async function(selectEl) {
    const id = selectEl.dataset.id;
    const status = selectEl.value;
    try {
      await FNA_DB.updateInquiryStatus(id, status);
      updateMetrics();
      showToast(`Inquiry status updated to "${status}".`, 'info');
    } catch (err) {
      showToast(err.message || 'Could not save inquiry status.', 'error');
    }
  };

  window.deleteInquiry = async function(id) {
    if (confirm('Delete this inquiry? This action cannot be undone.')) {
      try {
        await FNA_DB.deleteInquiry(id);
        renderInquiries();
        updateMetrics();
        showToast('Inquiry removed from CRM.', 'info');
      } catch (err) {
        showToast(err.message || 'Could not delete inquiry.', 'error');
      }
    }
  };

  /* ═══════════════════════════════════════════════════════
     TAB B: PORTFOLIO CMS
     ═══════════════════════════════════════════════════════ */

  let imageMode = 'upload'; /* 'upload' or 'url' */
  let currentImageData = ''; /* base64 or URL */
  let editingItemId = null;

  /* Toggle image input mode */
  document.getElementById('toggle-upload').addEventListener('click', () => switchImageMode('upload'));
  document.getElementById('toggle-url').addEventListener('click', () => switchImageMode('url'));

  function switchImageMode(mode) {
    imageMode = mode;
    document.querySelectorAll('.image-toggle-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    document.getElementById('url-input-wrap').style.display = mode === 'url' ? '' : 'none';
    document.getElementById('image-preview-box').style.display = mode === 'upload' ? '' : 'none';

    if (mode === 'url') {
      /* Show preview box below URL input */
      document.getElementById('image-preview-box').style.display = '';
    }
  }

  /* File upload */
  const fileInput = document.getElementById('image-file-input');
  const previewBox = document.getElementById('image-preview-box');
  const previewImg = document.getElementById('image-preview');
  const placeholder = document.getElementById('image-placeholder');

  previewBox.addEventListener('click', () => {
    if (imageMode === 'upload') fileInput.click();
  });

  /* Drag and drop */
  previewBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    previewBox.style.borderColor = 'var(--bronze)';
    previewBox.style.background = 'rgba(166, 94, 70, 0.05)';
  });

  previewBox.addEventListener('dragleave', () => {
    previewBox.style.borderColor = '';
    previewBox.style.background = '';
  });

  previewBox.addEventListener('drop', (e) => {
    e.preventDefault();
    previewBox.style.borderColor = '';
    previewBox.style.background = '';
    if (e.dataTransfer.files.length) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length) {
      handleFileUpload(fileInput.files[0]);
    }
  });

  function handleFileUpload(file) {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      /* Compress large images */
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 1200;
        let w = img.width, h = img.height;
        if (w > MAX || h > MAX) {
          if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
          else { w = Math.round(w * MAX / h); h = MAX; }
        }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        currentImageData = canvas.toDataURL('image/jpeg', 0.85);
        showPreview(currentImageData);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function showPreview(src) {
    previewImg.src = src;
    previewImg.style.display = '';
    placeholder.style.display = 'none';
  }

  function clearPreview() {
    previewImg.src = '';
    previewImg.style.display = 'none';
    placeholder.style.display = '';
    currentImageData = '';
    fileInput.value = '';
    document.getElementById('image-url-input').value = '';
  }

  /* URL input with live preview */
  document.getElementById('image-url-input').addEventListener('input', debounce((e) => {
    const url = e.target.value.trim();
    if (url) {
      currentImageData = url;
      showPreview(url);
    } else {
      clearPreview();
    }
  }, 500));

  /* Publish / Update */
  document.getElementById('cms-publish').addEventListener('click', async () => {
    const title = document.getElementById('cms-title').value.trim();
    const category = document.getElementById('cms-category').value;
    const year = document.getElementById('cms-year').value.trim();
    const location = document.getElementById('cms-location').value.trim();
    const description = document.getElementById('cms-description').value.trim();

    if (!title || !category) {
      if (!title) shakeElement(document.getElementById('cms-title'));
      if (!category) shakeElement(document.getElementById('cms-category'));
      return;
    }

    if (!currentImageData && !editingItemId) {
      shakeElement(previewBox);
      return;
    }

    const itemData = {
      title,
      category,
      year: year || new Date().getFullYear().toString(),
      location: location || 'Nagpur, India',
      description: description || '',
      image: currentImageData,
    };

    const publishBtn = document.getElementById('cms-publish');
    if (publishBtn) publishBtn.disabled = true;

    try {
      if (editingItemId) {
        /* Update mode */
        if (!currentImageData) {
          delete itemData.image; /* Keep existing image */
        }
        await FNA_DB.updatePortfolioItem(editingItemId, itemData);
        editingItemId = null;
        document.getElementById('cms-form-title').textContent = 'Add New Portfolio Item';
        document.getElementById('cms-form-subtitle').textContent = 'Publish new work or studio updates to the main page';
        document.getElementById('cms-cancel').style.display = 'none';
        publishBtn.textContent = 'Publish Item →';
        showToast(`Portfolio item "${itemData.title}" updated and saved.`, 'success');
      } else {
        await FNA_DB.addPortfolioItem(itemData);
        showToast(`Portfolio item "${itemData.title}" published and saved.`, 'success');
      }

      /* Clear form */
      clearCmsForm();
      renderInventory();
      updateMetrics();
    } catch (err) {
      showToast(err.message || 'Failed to save to server. Check login session.', 'error');
    } finally {
      if (publishBtn) publishBtn.disabled = false;
    }
  });

  /* Cancel edit */
  document.getElementById('cms-cancel').addEventListener('click', () => {
    clearCmsForm();
    editingItemId = null;
    document.getElementById('cms-form-title').textContent = 'Add New Portfolio Item';
    document.getElementById('cms-form-subtitle').textContent = 'Publish new work or studio updates to the main page';
    document.getElementById('cms-cancel').style.display = 'none';
    document.getElementById('cms-publish').textContent = 'Publish Item →';
  });

  function clearCmsForm() {
    document.getElementById('cms-title').value = '';
    document.getElementById('cms-category').value = '';
    document.getElementById('cms-year').value = '';
    document.getElementById('cms-location').value = '';
    document.getElementById('cms-description').value = '';
    clearPreview();
  }

  /* ─── Inventory Grid ─── */
  function renderInventory() {
    const items = FNA_DB.getPortfolio();
    const grid = document.getElementById('inventory-grid');
    document.getElementById('inventory-count').textContent = items.length;
    grid.innerHTML = '';

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'inventory-card';
      card.innerHTML = `
        <img class="inventory-thumb" src="${item.image}" alt="${escapeHTML(item.title)}" onerror="this.style.background='var(--stone-light)'; this.alt='Image unavailable';">
        <div class="inventory-info">
          <h4>${escapeHTML(item.title)}</h4>
          <p class="card-meta font-mono">${escapeHTML(item.category)} — ${escapeHTML(item.year)}</p>
          <div class="inventory-actions">
            <button class="btn-sm" onclick="editPortfolioItem('${item.id}')">Edit</button>
            <button class="btn-sm danger" onclick="deletePortfolioItem('${item.id}')">Delete</button>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  /* Global functions for inline handlers */
  window.editPortfolioItem = function(id) {
    const items = FNA_DB.getPortfolio();
    const item = items.find(i => i.id === id);
    if (!item) return;

    /* Open edit modal */
    const modal = document.getElementById('edit-modal');
    document.getElementById('edit-id').value = id;
    document.getElementById('edit-title').value = item.title;
    document.getElementById('edit-category').value = FNA_DB.normalizeCategory(item.category);
    document.getElementById('edit-year').value = item.year;
    document.getElementById('edit-location').value = item.location;
    document.getElementById('edit-description').value = item.description;
    document.getElementById('edit-image-url').value = '';
    modal.classList.add('active');
  };

  window.deletePortfolioItem = async function(id) {
    if (confirm('Delete this portfolio item? This action cannot be undone.')) {
      try {
        await FNA_DB.deletePortfolioItem(id);
        renderInventory();
        updateMetrics();
        showToast('Portfolio item removed from archive.', 'info');
      } catch (err) {
        showToast(err.message || 'Could not delete portfolio item.', 'error');
      }
    }
  };

  /* Edit modal handlers */
  document.getElementById('edit-modal-close').addEventListener('click', () => {
    document.getElementById('edit-modal').classList.remove('active');
  });

  document.getElementById('edit-cancel').addEventListener('click', () => {
    document.getElementById('edit-modal').classList.remove('active');
  });

  document.getElementById('edit-save').addEventListener('click', async () => {
    const id = document.getElementById('edit-id').value;
    const updates = {
      title: document.getElementById('edit-title').value.trim(),
      category: document.getElementById('edit-category').value,
      year: document.getElementById('edit-year').value.trim(),
      location: document.getElementById('edit-location').value.trim(),
      description: document.getElementById('edit-description').value.trim(),
    };

    const newImageUrl = document.getElementById('edit-image-url').value.trim();
    if (newImageUrl) {
      updates.image = newImageUrl;
    }

    if (!updates.title) {
      shakeElement(document.getElementById('edit-title'));
      return;
    }

    try {
      await FNA_DB.updatePortfolioItem(id, updates);
      document.getElementById('edit-modal').classList.remove('active');
      renderInventory();
      updateMetrics();
      showToast(`Portfolio item "${updates.title}" updated and saved.`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to save changes to server.', 'error');
    }
  });

  /* Close edit modal on overlay click */
  document.getElementById('edit-modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('edit-modal')) {
      document.getElementById('edit-modal').classList.remove('active');
    }
  });

  /* ─── Listen for storage changes (cross-tab sync) ─── */
  window.addEventListener('storage', (e) => {
    if (e.key === FNA_DB.KEYS.INQUIRIES || e.key === FNA_DB.KEYS.PORTFOLIO) {
      updateMetrics();
      renderInquiries();
      renderInventory();
    }
  });

  /* ─── Utilities ─── */
  function debounce(fn, ms) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), ms);
    };
  }
});

/* ─── Global Utilities ─── */
function escapeHTML(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function shakeElement(el) {
  el.style.animation = 'none';
  el.offsetHeight;
  el.style.animation = 'shake 400ms ease';
  el.style.borderColor = 'var(--danger)';
  setTimeout(() => {
    el.style.borderColor = '';
    el.style.animation = '';
  }, 1500);
}

/* ─── Global Toast Notification System ─── */
window.showToast = function(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-dot"></span>
    <span>${escapeHTML(message)}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 300ms ease, transform 300ms ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
};

/* Shake keyframe */
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-6px); }
    40% { transform: translateX(6px); }
    60% { transform: translateX(-4px); }
    80% { transform: translateX(4px); }
  }
`;
document.head.appendChild(shakeStyle);

/* ─── Bespoke Architectural Drafting Cursor for Admin (FNA Design Lab) ─── */
const cursorLead = document.getElementById('fna-cursor-lead');
const cursorReticle = document.getElementById('fna-cursor-reticle');

if (cursorLead && cursorReticle) {
  let targetX = -100, targetY = -100;
  let frameX = -100, frameY = -100;
  let isInit = false, isVis = false;

  function glideAdmin() {
    if (isInit && isVis) {
      const dx = targetX - frameX;
      const dy = targetY - frameY;
      if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
        frameX += dx * 0.24;
        frameY += dy * 0.24;
      } else {
        frameX = targetX;
        frameY = targetY;
      }
      cursorReticle.style.transform = `translate3d(${frameX.toFixed(2)}px, ${frameY.toFixed(2)}px, 0) translate(-50%, -50%)`;
    }
    requestAnimationFrame(glideAdmin);
  }
  requestAnimationFrame(glideAdmin);

  window.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    cursorLead.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`;
    if (!isInit) {
      frameX = targetX;
      frameY = targetY;
      isInit = true;
      cursorReticle.style.transform = `translate3d(${frameX.toFixed(2)}px, ${frameY.toFixed(2)}px, 0) translate(-50%, -50%)`;
    }
    if (!isVis) {
      isVis = true;
      cursorLead.style.opacity = '1';
      cursorReticle.style.opacity = '1';
    }
  }, { passive: true });

  window.addEventListener('mousedown', () => document.body.classList.add('cursor-down'), { passive: true });
  window.addEventListener('mouseup', () => document.body.classList.remove('cursor-down'), { passive: true });

  document.addEventListener('mouseleave', () => { isVis = false; cursorLead.style.opacity = '0'; cursorReticle.style.opacity = '0'; });
  document.addEventListener('mouseenter', (e) => {
    targetX = e.clientX; targetY = e.clientY; frameX = targetX; frameY = targetY;
    isVis = true; cursorLead.style.opacity = '1'; cursorReticle.style.opacity = '1';
  });

  document.addEventListener('mouseover', (e) => {
    const isInput = e.target.closest('input, textarea, select, [contenteditable="true"]');
    if (isInput) {
      document.body.classList.add('cursor-hide');
      document.body.classList.remove('cursor-active-hover');
      return;
    } else {
      document.body.classList.remove('cursor-hide');
    }

    const clickable = e.target.closest('a, button, [role="button"], label, .inventory-card, .metric-card, .crm-filter-pill, .btn-primary, .btn-secondary');
    if (clickable) {
      document.body.classList.add('cursor-active-hover');
    }
  });

  document.addEventListener('mouseout', (e) => {
    const isInput = e.target.closest('input, textarea, select, [contenteditable="true"]');
    if (isInput) {
      document.body.classList.remove('cursor-hide');
    }

    const clickable = e.target.closest('a, button, [role="button"], label, .inventory-card, .metric-card, .crm-filter-pill, .btn-primary, .btn-secondary');
    if (clickable) {
      document.body.classList.remove('cursor-active-hover');
    }
  });
}

