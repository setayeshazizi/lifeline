/* =========================================================
   LIFELINE — main.js
   All interactive functionality for the platform.
   Organized by feature, in small readable functions.
   ========================================================= */

'use strict';

/* =========================================================
   1. SAMPLE DATA
   ========================================================= */

// Simplified ABO/Rh compatibility chart (educational demo only)
const COMPATIBILITY = {
  'A+':  { donateTo: ['A+', 'AB+'],                 receiveFrom: ['A+', 'A-', 'O+', 'O-'] },
  'A-':  { donateTo: ['A-', 'A+', 'AB-', 'AB+'],    receiveFrom: ['A-', 'O-'] },
  'B+':  { donateTo: ['B+', 'AB+'],                 receiveFrom: ['B+', 'B-', 'O+', 'O-'] },
  'B-':  { donateTo: ['B-', 'B+', 'AB-', 'AB+'],    receiveFrom: ['B-', 'O-'] },
  'AB+': { donateTo: ['AB+'],                       receiveFrom: ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'] },
  'AB-': { donateTo: ['AB-', 'AB+'],                receiveFrom: ['AB-', 'A-', 'B-', 'O-'] },
  'O+':  { donateTo: ['O+', 'A+', 'B+', 'AB+'],     receiveFrom: ['O+', 'O-'] },
  'O-':  { donateTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], receiveFrom: ['O-'] }
};

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Fictional blood requests used on the Find Blood page
const bloodRequests = [
  { id: 'LL-1042', bloodType: 'O+',  units: 2, component: 'Whole Blood',     location: 'Herat',    hospital: 'Lifeline Medical Center',     urgency: 'Critical', postedMinutesAgo: 15,  distanceKm: 3.2  },
  { id: 'LL-1041', bloodType: 'A-',  units: 1, component: 'Red Blood Cells', location: 'Kabul',    hospital: 'City Care Hospital',          urgency: 'Critical', postedMinutesAgo: 32,  distanceKm: 8.5  },
  { id: 'LL-1039', bloodType: 'B+',  units: 3, component: 'Platelets',       location: 'Mazar-i-Sharif', hospital: 'Noor Blood Center',    urgency: 'Urgent',   postedMinutesAgo: 58,  distanceKm: 5.1  },
  { id: 'LL-1036', bloodType: 'O-',  units: 2, component: 'Whole Blood',     location: 'Herat',    hospital: 'Herat Regional Hospital',     urgency: 'Urgent',   postedMinutesAgo: 95,  distanceKm: 6.4  },
  { id: 'LL-1033', bloodType: 'AB+', units: 1, component: 'Plasma',          location: 'Kandahar', hospital: 'Hope General Hospital',       urgency: 'Normal',   postedMinutesAgo: 130, distanceKm: 12.7 },
  { id: 'LL-1030', bloodType: 'A+',  units: 4, component: 'Red Blood Cells', location: 'Herat',    hospital: 'Lifeline Medical Center',     urgency: 'Urgent',   postedMinutesAgo: 210, distanceKm: 2.8  },
  { id: 'LL-1027', bloodType: 'B-',  units: 1, component: 'Whole Blood',     location: 'Bamyan',   hospital: 'Bamyan Community Clinic',     urgency: 'Critical', postedMinutesAgo: 260, distanceKm: 21.3 },
  { id: 'LL-1024', bloodType: 'O+',  units: 2, component: 'Platelets',       location: 'Kabul',    hospital: 'Capital Blood Bank',          urgency: 'Normal',   postedMinutesAgo: 340, distanceKm: 9.9  },
  { id: 'LL-1021', bloodType: 'AB-', units: 1, component: 'Red Blood Cells', location: 'Herat',    hospital: 'Alumni Teaching Hospital',    urgency: 'Urgent',   postedMinutesAgo: 430, distanceKm: 4.6  },
  { id: 'LL-1018', bloodType: 'O-',  units: 3, component: 'Plasma',          location: 'Mazar-i-Sharif', hospital: 'City Care Hospital',  urgency: 'Critical', postedMinutesAgo: 520, distanceKm: 15.2 },
  { id: 'LL-1015', bloodType: 'A+',  units: 2, component: 'Whole Blood',     location: 'Kandahar', hospital: 'Desert Rose Hospital',        urgency: 'Normal',   postedMinutesAgo: 700, distanceKm: 18.8 },
  { id: 'LL-1012', bloodType: 'B+',  units: 1, component: 'Red Blood Cells', location: 'Herat',    hospital: 'Herat Regional Hospital',     urgency: 'Normal',   postedMinutesAgo: 900, distanceKm: 7.3  }
];

const URGENCY_ORDER = { Critical: 0, Urgent: 1, Normal: 2 };
const DONOR_STORAGE_KEY = 'lifelineDonors';
const THEME_STORAGE_KEY = 'lifelineTheme';
const AVAILABILITY_STORAGE_KEY = 'lifelineAvailability';
const EMERGENCY_STORAGE_KEY = 'lifelineEmergencyMode';

/* =========================================================
   2. SHARED HELPERS
   ========================================================= */

// Run code only when the matching element exists on the page
function onPage(elementId, callback) {
  const el = document.getElementById(elementId);
  if (el) callback(el);
}

// Convert "minutes ago" into a friendly relative time string
function formatTimeAgo(minutes) {
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

// Escape user text before inserting into HTML (prevents markup injection)
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/* =========================================================
   3. GLOBAL UI — navbar, back-to-top, scroll reveal
   ========================================================= */

function initNavbarScroll() {
  const navbar = document.querySelector('.navbar-lifeline');
  if (!navbar) return;

  const toggleClass = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 12);
  };

  window.addEventListener('scroll', toggleClass, { passive: true });
  toggleClass();
}

function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function initScrollReveal() {
  const items = document.querySelectorAll('.reveal');
  if (items.length === 0) return;

  // Show everything immediately if IntersectionObserver is unavailable
  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('revealed'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  items.forEach((el) => {
    // Optional stagger delay (ms) via data-delay
    if (el.dataset.delay) el.style.transitionDelay = `${el.dataset.delay}ms`;
    observer.observe(el);
  });
}

/* =========================================================
   4. HOME PAGE — animated statistics
   ========================================================= */

function animateCountUp(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || '';
  const duration = 1600;
  const startTime = performance.now();

  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    // ease-out curve for a natural counting feel
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(target * eased).toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

function initStatistics() {
  const numbers = document.querySelectorAll('.stat-number');
  if (numbers.length === 0) return;

  if (!('IntersectionObserver' in window)) {
    numbers.forEach(animateCountUp);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCountUp(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  numbers.forEach((el) => observer.observe(el));
}

/* =========================================================
   5. HOME PAGE — interactive blood type panel
   ========================================================= */

function buildBloodCards(containerId, onSelect) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = BLOOD_TYPES.map((type) => `
    <button type="button" class="blood-card" data-blood-type="${type}" aria-pressed="false">
      <svg class="blood-drop" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2.6c3.1 3.6 5.4 6.4 5.4 9.2a5.4 5.4 0 1 1-10.8 0c0-2.8 2.3-5.6 5.4-9.2z"/>
      </svg>
      <span class="blood-label">${type}</span>
      <span class="blood-hint">Universal ${type === 'O-' ? 'donor' : type === 'AB+' ? 'recipient' : 'type'}</span>
    </button>
  `).join('');

  container.querySelectorAll('.blood-card').forEach((card) => {
    card.addEventListener('click', () => {
      // Deselect siblings
      container.querySelectorAll('.blood-card').forEach((c) => {
        c.classList.remove('selected');
        c.setAttribute('aria-pressed', 'false');
      });
      card.classList.add('selected');
      card.setAttribute('aria-pressed', 'true');
      onSelect(card.dataset.bloodType);
    });
  });

  // Pre-select O+ as a friendly default
  const defaultCard = container.querySelector('[data-blood-type="O+"]') || container.querySelector('.blood-card');
  if (defaultCard) defaultCard.click();
}

function renderCompatibilityChips(containerId, types, redChips) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = types.map((type) =>
    `<span class="compat-chip ${redChips ? 'chip-red' : ''}">${type}</span>`
  ).join('');
}

function initHomeBloodTypes() {
  onPage('homeBloodGrid', () => {
    buildBloodCards('homeBloodGrid', (selectedType) => {
      const rules = COMPATIBILITY[selectedType];
      renderCompatibilityChips('panelDonateTo', rules.donateTo, true);
      renderCompatibilityChips('panelReceiveFrom', rules.receiveFrom, false);

      const donateLabel = document.getElementById('panelSelectedType');
      const receiveLabel = document.getElementById('panelReceiveType');
      if (donateLabel) donateLabel.textContent = selectedType;
      if (receiveLabel) receiveLabel.textContent = selectedType;
    });
  });
}

/* =========================================================
   6. FIND BLOOD — filtering, sorting, rendering, modal
   ========================================================= */

function getFilters() {
  return {
    bloodType: document.getElementById('filterBloodType')?.value || '',
    location: (document.getElementById('filterLocation')?.value || '').trim().toLowerCase(),
    urgency: document.getElementById('filterUrgency')?.value || '',
    component: document.getElementById('filterComponent')?.value || ''
  };
}

function filterRequests(requests, filters) {
  return requests.filter((req) => {
    const matchesType = !filters.bloodType || req.bloodType === filters.bloodType;
    const matchesLocation = !filters.location || req.location.toLowerCase().includes(filters.location);
    const matchesUrgency = !filters.urgency || req.urgency === filters.urgency;
    const matchesComponent = !filters.component || req.component === filters.component;
    return matchesType && matchesLocation && matchesUrgency && matchesComponent;
  });
}

function sortRequests(requests, sortBy) {
  const sorted = [...requests];
  switch (sortBy) {
    case 'urgent':
      return sorted.sort((a, b) => URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency] || a.postedMinutesAgo - b.postedMinutesAgo);
    case 'recent':
      return sorted.sort((a, b) => a.postedMinutesAgo - b.postedMinutesAgo);
    case 'nearest':
    default:
      return sorted.sort((a, b) => a.distanceKm - b.distanceKm);
  }
}

function createRequestCard(request) {
  const article = document.createElement('article');
  article.className = 'request-card' + (request.urgency === 'Critical' ? ' is-critical' : '');
  article.innerHTML = `
    <div class="req-top">
      <div class="req-blood">
        <span class="blood-badge">${request.bloodType}</span>
        <div>
          <div class="req-units">${request.units} Unit${request.units > 1 ? 's' : ''}</div>
          <div class="req-component">${request.component}</div>
        </div>
      </div>
      <span class="badge-urgency ${request.urgency.toLowerCase()}">${request.urgency}</span>
    </div>
    <ul class="req-meta">
      <li><i class="bi bi-hospital-fill" aria-hidden="true"></i><span><strong>${escapeHtml(request.hospital)}</strong></span></li>
      <li><i class="bi bi-geo-alt-fill" aria-hidden="true"></i><span>${escapeHtml(request.location)}</span></li>
      <li><i class="bi bi-clock-fill" aria-hidden="true"></i><span>Posted ${formatTimeAgo(request.postedMinutesAgo)}</span></li>
    </ul>
    <div class="req-foot">
      <span class="req-distance"><i class="bi bi-signpost-split-fill" aria-hidden="true"></i> ${request.distanceKm} km away</span>
      <button type="button" class="btn btn-dark btn-sm view-request-btn" data-request-id="${request.id}">
        View Request <i class="bi bi-arrow-right" aria-hidden="true"></i>
      </button>
    </div>
  `;
  return article;
}

function renderRequests(requests) {
  const grid = document.getElementById('requestsGrid');
  const emptyState = document.getElementById('emptyState');
  const resultsCount = document.getElementById('resultsCount');
  if (!grid) return;

  grid.innerHTML = '';

  if (requests.length === 0) {
    emptyState?.classList.remove('d-none');
  } else {
    emptyState?.classList.add('d-none');
    requests.forEach((req, index) => {
      const card = createRequestCard(req);
      card.style.animationDelay = `${index * 0.05}s`;
      grid.appendChild(card);
    });
  }

  if (resultsCount) {
    resultsCount.innerHTML = `Showing <span>${requests.length}</span> blood request${requests.length !== 1 ? 's' : ''}`;
  }
}

function refreshRequestList() {
  const filters = getFilters();
  const sortBy = document.getElementById('sortRequests')?.value || 'nearest';
  const filtered = filterRequests(bloodRequests, filters);
  const sorted = sortRequests(filtered, sortBy);
  renderRequests(sorted);
}

function clearAllFilters() {
  const typeEl = document.getElementById('filterBloodType');
  const locationEl = document.getElementById('filterLocation');
  const urgencyEl = document.getElementById('filterUrgency');
  const componentEl = document.getElementById('filterComponent');

  if (typeEl) typeEl.value = '';
  if (locationEl) locationEl.value = '';
  if (urgencyEl) urgencyEl.value = '';
  if (componentEl) componentEl.value = '';

  refreshRequestList();
}

function detailItem(label, value, extraClass = '') {
  return `
    <div class="modal-detail-item ${extraClass}">
      <div class="detail-label">${label}</div>
      <div class="detail-value">${value}</div>
    </div>
  `;
}

function showRequestDetails(requestId) {
  const request = bloodRequests.find((req) => req.id === requestId);
  const grid = document.getElementById('modalDetailGrid');
  if (!request || !grid) return;

  grid.innerHTML =
    detailItem('Request ID', request.id) +
    detailItem('Blood Type', `<span class="blood-value">${request.bloodType}</span>`) +
    detailItem('Required Amount', `${request.units} Unit${request.units > 1 ? 's' : ''}`) +
    detailItem('Blood Component', escapeHtml(request.component)) +
    detailItem('Urgency', `<span class="badge-urgency ${request.urgency.toLowerCase()}">${request.urgency}</span>`) +
    detailItem('Distance', `${request.distanceKm} km away`) +
    detailItem('Hospital / Blood Center', escapeHtml(request.hospital)) +
    detailItem('Time Posted', formatTimeAgo(request.postedMinutesAgo)) +
    detailItem('Location', escapeHtml(request.location), 'full');

  const modalEl = document.getElementById('requestModal');
  if (modalEl && window.bootstrap) {
    bootstrap.Modal.getOrCreateInstance(modalEl).show();
  }
}

function initFindBloodPage() {
  onPage('requestsGrid', () => {
    const form = document.getElementById('bloodSearchForm');
    const sortSelect = document.getElementById('sortRequests');
    const clearBtn = document.getElementById('clearFiltersBtn');
    const emptyClearBtn = document.getElementById('emptyClearBtn');
    const contactBtn = document.getElementById('modalContactBtn');

    // Initial render
    refreshRequestList();

    // Search form submit (no page reload)
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      refreshRequestList();
    });

    // Live filtering while typing
    document.getElementById('filterLocation')?.addEventListener('input', refreshRequestList);
    document.getElementById('filterBloodType')?.addEventListener('change', refreshRequestList);
    document.getElementById('filterUrgency')?.addEventListener('change', refreshRequestList);
    document.getElementById('filterComponent')?.addEventListener('change', refreshRequestList);

    // Sorting
    sortSelect?.addEventListener('change', refreshRequestList);

    // Clear filters buttons
    clearBtn?.addEventListener('click', clearAllFilters);
    emptyClearBtn?.addEventListener('click', clearAllFilters);

    // Card buttons (event delegation — cards are re-rendered dynamically)
    document.getElementById('requestsGrid')?.addEventListener('click', (e) => {
      const btn = e.target.closest('.view-request-btn');
      if (btn) showRequestDetails(btn.dataset.requestId);
    });

    // Demo "Contact" action inside the modal
    contactBtn?.addEventListener('click', () => {
      contactBtn.innerHTML = '<i class="bi bi-check-lg" aria-hidden="true"></i> Coordinator Notified (Demo)';
      contactBtn.disabled = true;
      setTimeout(() => {
        contactBtn.innerHTML = '<i class="bi bi-telephone-fill" aria-hidden="true"></i> Contact';
        contactBtn.disabled = false;
      }, 2500);
    });

    // Reset the contact button whenever the modal closes
    const modalEl = document.getElementById('requestModal');
    modalEl?.addEventListener('hidden.bs.modal', () => {
      if (contactBtn) {
        contactBtn.innerHTML = '<i class="bi bi-telephone-fill" aria-hidden="true"></i> Contact';
        contactBtn.disabled = false;
      }
    });
  });
}

/* =========================================================
   7. DONATE PAGE — validation, availability toggle, storage
   ========================================================= */

function setFieldValidity(input, isValid) {
  input.classList.toggle('is-invalid', !isValid);
  return isValid;
}

function validateDonorForm() {
  let formIsValid = true;

  const name = document.getElementById('donorName');
  const bloodType = document.getElementById('donorBloodType');
  const age = document.getElementById('donorAge');
  const city = document.getElementById('donorCity');
  const email = document.getElementById('donorEmail');
  const phone = document.getElementById('donorPhone');
  const lastDonation = document.getElementById('donorLastDonation');
  const consent = document.getElementById('donorConsent');
  const consentError = document.getElementById('consentError');

  // Full name: at least 3 characters, letters/spaces only
  if (name) {
    const valid = name.value.trim().length >= 3 && /^[\p{L} .'-]+$/u.test(name.value.trim());
    formIsValid = setFieldValidity(name, valid) && formIsValid;
  }

  // Blood type: must pick one
  if (bloodType) {
    formIsValid = setFieldValidity(bloodType, bloodType.value !== '') && formIsValid;
  }

  // Age: 18–65 for this demo
  if (age) {
    const ageValue = parseInt(age.value, 10);
    const valid = Number.isInteger(ageValue) && ageValue >= 18 && ageValue <= 65;
    formIsValid = setFieldValidity(age, valid) && formIsValid;
  }

  // City: required
  if (city) {
    formIsValid = setFieldValidity(city, city.value.trim().length >= 2) && formIsValid;
  }

  // Email: standard pattern
  if (email) {
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim());
    formIsValid = setFieldValidity(email, valid) && formIsValid;
  }

  // Phone: 7–15 digits, allowing +, spaces and dashes
  if (phone) {
    const digits = phone.value.replace(/[\s+\-()]/g, '');
    const valid = /^\d{7,15}$/.test(digits);
    formIsValid = setFieldValidity(phone, valid) && formIsValid;
  }

  // Last donation: required, not in the future
  if (lastDonation) {
    const selected = new Date(lastDonation.value);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const valid = lastDonation.value !== '' && selected <= today;
    formIsValid = setFieldValidity(lastDonation, valid) && formIsValid;
  }

  // Consent checkbox
  if (consent && consentError) {
    const valid = consent.checked;
    consentError.classList.toggle('d-none', valid);
    formIsValid = valid && formIsValid;
  }

  return formIsValid;
}

function loadDonors() {
  try {
    return JSON.parse(localStorage.getItem(DONOR_STORAGE_KEY)) || [];
  } catch (err) {
    console.warn('Could not read saved donors:', err);
    return [];
  }
}

function saveDonor(donor) {
  const donors = loadDonors();
  donors.push(donor);
  localStorage.setItem(DONOR_STORAGE_KEY, JSON.stringify(donors));
}

function resetDonorForm() {
  const form = document.getElementById('donorForm');
  if (!form) return;

  form.reset();
  form.querySelectorAll('.is-invalid').forEach((el) => el.classList.remove('is-invalid'));
  document.getElementById('consentError')?.classList.add('d-none');

  // Restore defaults after reset()
  const availability = document.getElementById('donorAvailability');
  if (availability) availability.checked = true;
  updateAvailabilityUI(true);
}

function updateAvailabilityUI(isAvailable) {
  const box = document.getElementById('availabilityBox');
  const title = document.getElementById('availabilityTitle');
  const sub = document.getElementById('availabilitySub');
  if (!box || !title || !sub) return;

  box.classList.toggle('active', isAvailable);
  title.textContent = isAvailable
    ? 'Available for emergency requests'
    : 'Not currently available';
  sub.textContent = isAvailable
    ? 'You are visible to compatible emergency requests.'
    : 'You are currently unavailable and hidden from matching.';
}

function initAvailabilityToggle() {
  const toggle = document.getElementById('donorAvailability');
  if (!toggle) return;

  // Restore the donor's previous availability preference
  const saved = localStorage.getItem(AVAILABILITY_STORAGE_KEY);
  toggle.checked = saved === null ? true : saved === '1';
  updateAvailabilityUI(toggle.checked);

  toggle.addEventListener('change', () => {
    updateAvailabilityUI(toggle.checked);
    localStorage.setItem(AVAILABILITY_STORAGE_KEY, toggle.checked ? '1' : '0');
  });
}

function initDonorForm() {
  onPage('donorForm', () => {
    initAvailabilityToggle();

    // Remove the error state as soon as the user fixes a field
    document.getElementById('donorForm').addEventListener('input', (e) => {
      if (e.target.classList.contains('is-invalid')) {
        e.target.classList.remove('is-invalid');
      }
      if (e.target.id === 'donorConsent') {
        document.getElementById('consentError')?.classList.add('d-none');
      }
    });

    document.getElementById('donorForm').addEventListener('submit', (e) => {
      e.preventDefault();

      if (!validateDonorForm()) {
        // Bring the first invalid field into view
        const firstInvalid = document.querySelector('#donorForm .is-invalid, #consentError:not(.d-none)');
        firstInvalid?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      // Build the donor record
      const donor = {
        id: `DON-${Date.now()}`,
        fullName: document.getElementById('donorName').value.trim(),
        bloodType: document.getElementById('donorBloodType').value,
        age: parseInt(document.getElementById('donorAge').value, 10),
        city: document.getElementById('donorCity').value.trim(),
        email: document.getElementById('donorEmail').value.trim(),
        phone: document.getElementById('donorPhone').value.trim(),
        lastDonation: document.getElementById('donorLastDonation').value,
        available: document.getElementById('donorAvailability').checked,
        registeredAt: new Date().toISOString()
      };

      saveDonor(donor);
      resetDonorForm();
      renderImpactDashboard(donor);

      const modalEl = document.getElementById('donorSuccessModal');
      if (modalEl && window.bootstrap) {
        bootstrap.Modal.getOrCreateInstance(modalEl).show();
      }
    });
  });
}

/* =========================================================
   8. ABOUT PAGE — compatibility calculator
   ========================================================= */

function renderCompatTypes(containerId, types) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = types.map((type, index) =>
    `<span class="compat-type" style="animation-delay: ${index * 55}ms">${type}</span>`
  ).join('');
}

function calculateCompatibility(selectedType) {
  const rules = COMPATIBILITY[selectedType];
  if (!rules) return;

  renderCompatTypes('compatDonateTo', rules.donateTo);
  renderCompatTypes('compatReceiveFrom', rules.receiveFrom);

  const label = document.getElementById('compatSelectedLabel');
  if (label) {
    label.innerHTML = `Type <strong>${escapeHtml(selectedType)}</strong> — can donate to ${rules.donateTo.length} group${rules.donateTo.length !== 1 ? 's' : ''}, receive from ${rules.receiveFrom.length}`;
  }
}

function initCompatibilityCalculator() {
  onPage('compatBloodSelect', (select) => {
    calculateCompatibility(select.value);
    select.addEventListener('change', () => calculateCompatibility(select.value));
  });
}

/* =========================================================
   9. THEME — dark / light toggle (saved in localStorage)
   ========================================================= */

function applyTheme(mode) {
  // data-bs-theme lets Bootstrap 5.3 darken its own components
  document.documentElement.setAttribute('data-theme', mode);
  document.documentElement.setAttribute('data-bs-theme', mode);
}

function updateThemeIcon(button, mode) {
  const icon = button.querySelector('i');
  if (icon) icon.className = mode === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-fill';
  button.setAttribute('aria-label', mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
}

function initThemeToggle() {
  const toggles = document.querySelectorAll('.theme-toggle');
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialMode = saved || (prefersDark ? 'dark' : 'light');

  applyTheme(initialMode);
  toggles.forEach((btn) => updateThemeIcon(btn, initialMode));

  toggles.forEach((btn) => {
    btn.addEventListener('click', () => {
      const nextMode = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(nextMode);
      localStorage.setItem(THEME_STORAGE_KEY, nextMode);
      document.querySelectorAll('.theme-toggle').forEach((b) => updateThemeIcon(b, nextMode));
    });
  });
}

/* =========================================================
   10. SIGNATURE — heartbeat pulse page transition
   ========================================================= */

function initPulseTransition() {
  const overlay = document.getElementById('pulseOverlay');
  if (!overlay) return;

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-pulse-link]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#')) return;

    // Respect reduced motion: navigate instantly
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    e.preventDefault();
    overlay.classList.add('show');
    setTimeout(() => { window.location.href = href; }, 520);
  });
}

/* =========================================================
   11. FIND BLOOD — Emergency Mode
   ========================================================= */

function initEmergencyMode() {
  onPage('emergencyToggle', () => {
    const toggle = document.getElementById('emergencyToggle');
    const wrap = document.getElementById('emergencyToggleWrap');
    const banner = document.getElementById('emergencyBanner');
    const countEl = document.getElementById('emergencyCriticalCount');
    const grid = document.getElementById('requestsGrid');
    const sortSelect = document.getElementById('sortRequests');

    const criticalCount = bloodRequests.filter((req) => req.urgency === 'Critical').length;

    function setEmergencyMode(isOn, persist) {
      toggle.checked = isOn;
      wrap.classList.toggle('on', isOn);
      grid.classList.toggle('emergency-mode-on', isOn);
      banner.classList.toggle('d-none', !isOn);

      if (isOn && countEl) countEl.textContent = criticalCount;
      if (isOn && sortSelect) sortSelect.value = 'urgent'; // auto-sort by urgency
      if (persist) localStorage.setItem(EMERGENCY_STORAGE_KEY, isOn ? '1' : '0');

      refreshRequestList();
    }

    toggle.addEventListener('change', () => setEmergencyMode(toggle.checked, true));

    // Restore the visitor's previous Emergency Mode preference
    if (localStorage.getItem(EMERGENCY_STORAGE_KEY) === '1') {
      setEmergencyMode(true, false);
    }
  });
}

/* =========================================================
   12. DONATE PAGE — multi-step wizard + impact dashboard
   ========================================================= */

// Validate only the fields that belong to the given wizard step
function validateWizardStep(step) {
  let stepIsValid = true;

  if (step === 1) {
    const name = document.getElementById('donorName');
    if (name) {
      const valid = name.value.trim().length >= 3 && /^[\p{L} .'-]+$/u.test(name.value.trim());
      stepIsValid = setFieldValidity(name, valid) && stepIsValid;
    }
    const age = document.getElementById('donorAge');
    if (age) {
      const ageValue = parseInt(age.value, 10);
      stepIsValid = setFieldValidity(age, Number.isInteger(ageValue) && ageValue >= 18 && ageValue <= 65) && stepIsValid;
    }
    const city = document.getElementById('donorCity');
    if (city) stepIsValid = setFieldValidity(city, city.value.trim().length >= 2) && stepIsValid;
    const email = document.getElementById('donorEmail');
    if (email) stepIsValid = setFieldValidity(email, /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) && stepIsValid;
    const phone = document.getElementById('donorPhone');
    if (phone) {
      const digits = phone.value.replace(/[\s+\-()]/g, '');
      stepIsValid = setFieldValidity(phone, /^\d{7,15}$/.test(digits)) && stepIsValid;
    }
  }

  if (step === 2) {
    const bloodType = document.getElementById('donorBloodType');
    if (bloodType) stepIsValid = setFieldValidity(bloodType, bloodType.value !== '') && stepIsValid;
    const lastDonation = document.getElementById('donorLastDonation');
    if (lastDonation) {
      const selected = new Date(lastDonation.value);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      stepIsValid = setFieldValidity(lastDonation, lastDonation.value !== '' && selected <= today) && stepIsValid;
    }
  }

  if (step === 4) {
    const consent = document.getElementById('donorConsent');
    const consentError = document.getElementById('consentError');
    if (consent && consentError) {
      consentError.classList.toggle('d-none', consent.checked);
      stepIsValid = consent.checked && stepIsValid;
    }
  }

  if (!stepIsValid) {
    const firstInvalid = document.querySelector('.wizard-step.active .is-invalid');
    firstInvalid?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return stepIsValid;
}

function initDonorWizard() {
  onPage('donorForm', () => {
    const form = document.getElementById('donorForm');
    const steps = [...form.querySelectorAll('.wizard-step')];
    const indicators = [...form.querySelectorAll('.wizard-step-indicator')];
    const connector = form.querySelector('.wizard-connector');
    const backBtn = document.getElementById('wizardBackBtn');
    const nextBtn = document.getElementById('wizardNextBtn');
    const submitBtn = document.getElementById('donorSubmitBtn');
    if (steps.length === 0 || !nextBtn || !backBtn || !submitBtn) return;

    const total = steps.length;
    let current = 1;

    function showStep(stepNumber) {
      current = stepNumber;
      steps.forEach((s) => s.classList.toggle('active', Number(s.dataset.step) === stepNumber));
      indicators.forEach((ind) => {
        const num = Number(ind.dataset.step);
        ind.classList.toggle('active', num === stepNumber);
        ind.classList.toggle('done', num < stepNumber);
        const dot = ind.querySelector('.indicator-dot');
        if (dot) dot.innerHTML = num < stepNumber ? '<i class="bi bi-check-lg" aria-hidden="true"></i>' : String(num).padStart(2, '0');
      });
      // Fill the connector line between indicators (12% → 88% of the bar)
      if (connector) connector.style.width = `${((stepNumber - 1) / (total - 1)) * 76}%`;

      backBtn.style.visibility = stepNumber === 1 ? 'hidden' : 'visible';
      nextBtn.classList.toggle('d-none', stepNumber === total);
      submitBtn.classList.toggle('d-none', stepNumber !== total);
    }

    nextBtn.addEventListener('click', () => {
      if (validateWizardStep(current) && current < total) showStep(current + 1);
    });

    backBtn.addEventListener('click', () => {
      if (current > 1) showStep(current - 1);
    });

    showStep(1);
  });
}

// "Your impact" panel — demo metrics only, no real activity is tracked
function renderImpactDashboard(donor) {
  const dash = document.getElementById('impactDashboard');
  if (!dash || !donor) return;

  const status = document.getElementById('impactStatus');
  if (status) {
    status.innerHTML = donor.available
      ? '<span class="status-dot" aria-hidden="true"></span>Active'
      : 'Paused';
  }
  const bloodType = document.getElementById('impactBloodType');
  if (bloodType) bloodType.textContent = donor.bloodType;

  dash.classList.remove('d-none');
}

function initImpactDashboard() {
  onPage('impactDashboard', () => {
    const donors = loadDonors();
    if (donors.length > 0) renderImpactDashboard(donors[donors.length - 1]);
  });
}

/* =========================================================
   13. FOOTER — demo Privacy / Terms modals (no extra pages)
   ========================================================= */

function initLegalModals() {
  const triggers = document.querySelectorAll('[data-legal]');
  if (triggers.length === 0) return;

  const modalsHtml = `
    <div class="modal fade" id="privacyModal" tabindex="-1" aria-labelledby="privacyModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title fs-5" id="privacyModalLabel"><i class="bi bi-shield-lock-fill" aria-hidden="true"></i> Privacy (Demo)</h2>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Lifeline is a student demo project. Donor registrations are stored only in your own browser via localStorage — nothing is sent to a server.</p>
            <p class="mb-0">All names, hospitals, requests and statistics on this site are fictional sample data. Never enter real medical or personal information.</p>
          </div>
        </div>
      </div>
    </div>
    <div class="modal fade" id="termsModal" tabindex="-1" aria-labelledby="termsModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title fs-5" id="termsModalLabel"><i class="bi bi-file-text-fill" aria-hidden="true"></i> Terms (Demo)</h2>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>This platform is a frontend demonstration for educational purposes only. It is not a medical service, does not arrange real donations, and provides no medical advice.</p>
            <p class="mb-0">Compatibility information is simplified for education — always follow qualified healthcare professionals and blood banks.</p>
          </div>
        </div>
      </div>
    </div>`;

  document.body.insertAdjacentHTML('beforeend', modalsHtml);

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const modalEl = document.getElementById(`${trigger.dataset.legal}Modal`);
      if (modalEl && window.bootstrap) {
        bootstrap.Modal.getOrCreateInstance(modalEl).show();
      }
    });
  });
}

/* =========================================================
   14. BOOT — run the right features for the current page
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initNavbarScroll();
  initBackToTop();
  initScrollReveal();

  initThemeToggle();
  initPulseTransition();
  initLegalModals();

  initStatistics();
  initHomeBloodTypes();
  initFindBloodPage();
  initEmergencyMode();
  initDonorForm();
  initDonorWizard();
  initImpactDashboard();
  initCompatibilityCalculator();
});
