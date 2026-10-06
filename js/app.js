/* ==========================================================
   LipatDorm — Complete JavaScript Application
   nav.js + animations.js + map.js + route-test.js + marketplace.js
   ========================================================== */

'use strict';

/* ================================================================
   SECTION DATA — All 21 sections metadata
   ================================================================ */
const SECTIONS = [
  { id: 's01-hero',          label: 'Hero',            lightDots: false },
  { id: 's02-problem',       label: 'The Problem',     lightDots: true  },
  { id: 's03-solution',      label: 'Solution',        lightDots: false },
  { id: 's04-rides',         label: 'Right-Sized Rides', lightDots: true },
  { id: 's05-booking',       label: 'Smart Booking',   lightDots: false },
  { id: 's06-map',           label: 'Map & Routes',    lightDots: true  },
  { id: 's07-route-test',    label: 'Route Test',      lightDots: true  },
  { id: 's08-pricing',       label: 'Pricing',         lightDots: true  },
  { id: 's09-cargo-sharing', label: 'Cargo-Sharing',   lightDots: false },
  { id: 's10-split-cost',    label: 'Split Cost',      lightDots: true  },
  { id: 's11-pass-it-on',    label: 'Pass-It-On',      lightDots: false },
  { id: 's12-marketplace',   label: 'Marketplace',     lightDots: true  },
  { id: 's13-swap-donate',   label: 'Swap & Donate',   lightDots: false },
  { id: 's14-local-reuse',   label: 'Dorm Reuse',      lightDots: true  },
  { id: 's15-smart-matching',label: 'Smart Matching',  lightDots: false },
  { id: 's16-tracking',      label: 'Live Tracking',   lightDots: true  },
  { id: 's17-safety',        label: 'Safety & Trust',  lightDots: false },
  { id: 's18-journey',       label: 'Moving Journey',  lightDots: true  },
  { id: 's19-sdg-impact',    label: 'SDG 12 Impact',   lightDots: false },
  { id: 's20-app-preview',   label: 'App Preview',     lightDots: false },
  { id: 's21-final-cta',     label: 'Get Started',     lightDots: false },
];

/* ================================================================
   MAP STATE — Zamboanga City, Philippines
   ================================================================ */
const MAP_CONFIG = {
  center:    [6.9214, 122.0790],   // Zamboanga City
  zoom:      14,
  // Standard OSM tiles to avoid API key errors
  tiles:     'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  tileAttr:  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
};

const ROUTE_COORDS = {
  pickup: { lat: 6.9175, lon: 122.0669, name: 'WMSU Campus Area' },
  dest:   { lat: 6.9044, lon: 122.0735, name: 'KCC Mall de Zamboanga' },
};

const OSRM_URL = `https://router.project-osrm.org/route/v1/driving/${ROUTE_COORDS.pickup.lon},${ROUTE_COORDS.pickup.lat};${ROUTE_COORDS.dest.lon},${ROUTE_COORDS.dest.lat}?overview=full&geometries=geojson`;

const TRIP_STATUSES = [
  'READY',
  'ROUTE CALCULATED',
  'DRIVER ASSIGNED',
  'DRIVER EN ROUTE',
  'ARRIVED AT PICKUP',
  'CARGO LOADED',
  'IN TRANSIT',
  'ARRIVED',
];

/* ================================================================
   APP STATE
   ================================================================ */
const state = {
  currentSection: 0,
  mapsInitialized: { s06: false, s07: false, s16: false },
  routeTestRunning: false,
  routeTestComplete: false,
  carouselIndex: 2, // center the 3rd phone (index 2)
  sdgAnimated: false,
  maps: {},
  driverMarker: null,
  routeLayer: null,
  driverTimer: null,
  prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
};

/* ================================================================
   1. DOM READY ENTRY POINT
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initScrollObserver();
  initTopBar();
  initScrollProgress();
  initCargoChips();
  initMarketplace();
  initCarousel();
  initJourney();
  generateParticles();
  initCTAButtons();
  checkInitialSection();
});

/* ================================================================
   2. NAVIGATION — Dot Nav + Section Counter
   ================================================================ */
function initNav() {
  const dotNav = document.getElementById('dot-nav');
  const counterCurrent = document.getElementById('counter-current');

  SECTIONS.forEach((sec, i) => {
    const item = document.createElement('div');
    item.className = 'dot-nav-item';
    item.setAttribute('data-index', i);
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', `Go to section: ${sec.label}`);
    item.tabIndex = 0;

    const tooltip = document.createElement('span');
    tooltip.className = 'dot-tooltip';
    tooltip.textContent = `${String(i + 1).padStart(2, '0')} ${sec.label}`;
    item.appendChild(tooltip);

    item.addEventListener('click', () => scrollToSection(i));
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') scrollToSection(i);
    });

    dotNav.appendChild(item);
  });
}

function scrollToSection(index) {
  const targetId = SECTIONS[index].id;
  const el = document.getElementById(targetId);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function updateNav(index) {
  if (index === state.currentSection) return;
  state.currentSection = index;

  // Update dots
  const dots = document.querySelectorAll('.dot-nav-item');
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
    // Light sections get dark dots
    if (SECTIONS[index].lightDots) {
      dot.classList.add('dark-mode');
    } else {
      dot.classList.remove('dark-mode');
    }
  });

  // Update counter
  updateCounter(index);

  // Update section counter text color
  const counter = document.getElementById('section-counter');
  if (SECTIONS[index].lightDots) {
    counter.classList.add('dark-text');
  } else {
    counter.classList.remove('dark-text');
  }
}

function updateCounter(index) {
  const current = document.getElementById('counter-current');
  if (!current) return;

  if (state.prefersReducedMotion) {
    current.textContent = String(index + 1).padStart(2, '0');
    return;
  }

  // Flip animation
  current.classList.add('counter-flip-out');
  setTimeout(() => {
    current.textContent = String(index + 1).padStart(2, '0');
    current.classList.remove('counter-flip-out');
    current.classList.add('counter-flip-in');
    setTimeout(() => current.classList.remove('counter-flip-in'), 200);
  }, 100);
}

/* ================================================================
   3. INTERSECTION OBSERVER — Section Detection
   ================================================================ */
function initScrollObserver() {
  const scrollContainer = document.getElementById('scroll-container');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
        const sectionId = entry.target.id;
        const index = SECTIONS.findIndex((s) => s.id === sectionId);

        if (index !== -1) {
          updateNav(index);
          triggerSectionActions(sectionId, index);
          revealElements(entry.target);
        }
      }
    });
  }, {
    root: scrollContainer,
    threshold: 0.5,
  });

  SECTIONS.forEach((sec) => {
    const el = document.getElementById(sec.id);
    if (el) observer.observe(el);
  });
}

function triggerSectionActions(sectionId, index) {
  switch (sectionId) {
    case 's06-map':
      if (!state.mapsInitialized.s06) initMapS06();
      break;
    case 's07-route-test':
      if (!state.mapsInitialized.s07) initMapS07();
      break;
    case 's16-tracking':
      if (!state.mapsInitialized.s16) initMapS16();
      break;
    case 's19-sdg-impact':
      if (!state.sdgAnimated) animateSDGCounters();
      break;
  }
}

/* ================================================================
   4. SCROLL-REVEAL ANIMATIONS
   ================================================================ */
function revealElements(section) {
  if (state.prefersReducedMotion) return;

  const revealEls = section.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  revealEls.forEach((el) => {
    setTimeout(() => el.classList.add('revealed'), 80);
  });
}

function checkInitialSection() {
  // Trigger actions for the first visible section on load
  revealElements(document.getElementById('s01-hero'));
  updateNav(0);
}

/* ================================================================
   5. TOP BAR — Scrolled state
   ================================================================ */
function initTopBar() {
  const scrollContainer = document.getElementById('scroll-container');
  const topBar = document.getElementById('top-bar');

  scrollContainer.addEventListener('scroll', () => {
    if (scrollContainer.scrollTop > 50) {
      topBar.classList.add('scrolled');
    } else {
      topBar.classList.remove('scrolled');
    }
  }, { passive: true });
}

/* ================================================================
   6. SCROLL PROGRESS BAR
   ================================================================ */
function initScrollProgress() {
  const scrollContainer = document.getElementById('scroll-container');
  const progress = document.getElementById('scroll-progress');

  scrollContainer.addEventListener('scroll', () => {
    const max = scrollContainer.scrollHeight - scrollContainer.clientHeight;
    const pct = max > 0 ? (scrollContainer.scrollTop / max) * 100 : 0;
    progress.style.width = `${pct}%`;
  }, { passive: true });
}

/* ================================================================
   7. LEAFLET MAP — Section 06: Map & Route Coordination
   ================================================================ */
function createCustomIcon(type) {
  const configs = {
    pickup: { bg: '#e88a2e', label: 'P' },
    dest:   { bg: '#2d8a4e', label: 'D' },
    driver: { bg: '#1a5c38', label: 'M' },
  };
  const c = configs[type];

  return L.divIcon({
    html: `<div class="custom-marker-${type}" style="background:${c.bg}; font-family: var(--font-mono); font-weight: 700; font-size: 0.75rem;" title="${c.label}">${c.label}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    className: '',
  });
}

function initMapS06() {
  state.mapsInitialized.s06 = true;

  const map = L.map('map-s06', {
    center: MAP_CONFIG.center,
    zoom: MAP_CONFIG.zoom,
    zoomControl: true,
    scrollWheelZoom: false,
    dragging: true,
  });

  L.tileLayer(MAP_CONFIG.tiles, {
    attribution: MAP_CONFIG.tileAttr,
    maxZoom: 19,
  }).addTo(map);

  // Add markers
  L.marker([ROUTE_COORDS.pickup.lat, ROUTE_COORDS.pickup.lon], { icon: createCustomIcon('pickup') })
    .addTo(map)
    .bindPopup(`<b>Pickup:</b> ${ROUTE_COORDS.pickup.name}`, { closeButton: false });

  L.marker([ROUTE_COORDS.dest.lat, ROUTE_COORDS.dest.lon], { icon: createCustomIcon('dest') })
    .addTo(map)
    .bindPopup(`<b>Destination:</b> ${ROUTE_COORDS.dest.name}`, { closeButton: false });

  L.marker([ROUTE_COORDS.pickup.lat + 0.003, ROUTE_COORDS.pickup.lon + 0.002], { icon: createCustomIcon('driver') })
    .addTo(map)
    .bindPopup('<b>Driver:</b> Juan D. · Multicab', { closeButton: false });

  // Draw sample straight-line route (decorative for §06)
  L.polyline([
    [ROUTE_COORDS.pickup.lat, ROUTE_COORDS.pickup.lon],
    [ROUTE_COORDS.pickup.lat - 0.005, ROUTE_COORDS.pickup.lon + 0.003],
    [ROUTE_COORDS.dest.lat, ROUTE_COORDS.dest.lon],
  ], {
    // REF-B-02: thick, green polyline
    color: '#2d8a4e',
    weight: 6,
    opacity: 0.85,
    lineJoin: 'round',
    lineCap: 'round',
    dashArray: '12, 6',
  }).addTo(map);

  state.maps.s06 = map;

  // Fix tiles on snap-scroll (required!)
  setTimeout(() => map.invalidateSize(), 300);
}

/* ================================================================
   8. LEAFLET MAP — Section 07: Route Test
   ================================================================ */
function initMapS07() {
  state.mapsInitialized.s07 = true;

  const map = L.map('map-s07', {
    center: [
      (ROUTE_COORDS.pickup.lat + ROUTE_COORDS.dest.lat) / 2,
      (ROUTE_COORDS.pickup.lon + ROUTE_COORDS.dest.lon) / 2,
    ],
    zoom: 14,
    zoomControl: true,
    scrollWheelZoom: false,
    dragging: true,
  });

  L.tileLayer(MAP_CONFIG.tiles, {
    attribution: MAP_CONFIG.tileAttr,
    maxZoom: 19,
  }).addTo(map);

  state.maps.s07 = map;

  setTimeout(() => map.invalidateSize(), 300);
}

/* ================================================================
   9. ROUTE TEST — Section 07 Logic
   ================================================================ */
function initRouteTestButton() {
  const btn = document.getElementById('btn-test-route');
  if (btn) {
    btn.addEventListener('click', runRouteTest);
  }
}

async function runRouteTest() {
  if (state.routeTestRunning) return;
  state.routeTestRunning = true;

  const btn = document.getElementById('btn-test-route');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Running Test...';
  }

  // Ensure map is init
  if (!state.mapsInitialized.s07) initMapS07();

  const map = state.maps.s07;

  // Clear previous layers
  if (state.routeLayer) {
    map.removeLayer(state.routeLayer);
    state.routeLayer = null;
  }
  if (state.driverMarker) {
    map.removeLayer(state.driverMarker);
    state.driverMarker = null;
  }

  // Reset steps
  resetTestSteps();
  setStatus('READY', 'ready');

  await delay(600);

  // Step 1: Display pickup marker
  setStepDone(0);
  setStepActive(1);
  const pickupMarker = L.marker(
    [ROUTE_COORDS.pickup.lat, ROUTE_COORDS.pickup.lon],
    { icon: createCustomIcon('pickup') }
  ).addTo(map).bindPopup(`<b>${ROUTE_COORDS.pickup.name}</b>`);
  await delay(700);

  // Step 2: Display destination marker
  setStepDone(1);
  setStepActive(2);
  const destMarker = L.marker(
    [ROUTE_COORDS.dest.lat, ROUTE_COORDS.dest.lon],
    { icon: createCustomIcon('dest') }
  ).addTo(map).bindPopup(`<b>${ROUTE_COORDS.dest.name}</b>`);
  await delay(700);

  // Step 3: Calculate route
  setStepDone(2);
  setStepActive(3);
  setStatus('ROUTE CALCULATED', 'active');

  let routeCoords = null;
  let distanceKm = 0;
  let durationMin = 0;
  let usedFallback = false;

  try {
    const resp = await fetch(OSRM_URL, { signal: AbortSignal.timeout(8000) });
    if (!resp.ok) throw new Error(`OSRM HTTP ${resp.status}`);

    const data = await resp.json();
    if (!data.routes || !data.routes[0]) throw new Error('No routes returned');

    const route = data.routes[0];
    routeCoords = route.geometry.coordinates.map(([lon, lat]) => [lat, lon]);
    distanceKm = (route.distance / 1000).toFixed(1);
    durationMin = Math.round(route.duration / 60);

  } catch (err) {
    console.warn('OSRM fallback:', err.message);
    usedFallback = true;

    // Fallback: straight-line + midpoint
    routeCoords = [
      [ROUTE_COORDS.pickup.lat, ROUTE_COORDS.pickup.lon],
      [(ROUTE_COORDS.pickup.lat + ROUTE_COORDS.dest.lat) / 2 + 0.003,
       (ROUTE_COORDS.pickup.lon + ROUTE_COORDS.dest.lon) / 2 - 0.002],
      [ROUTE_COORDS.dest.lat, ROUTE_COORDS.dest.lon],
    ];
    distanceKm = haversineKm(
      ROUTE_COORDS.pickup.lat, ROUTE_COORDS.pickup.lon,
      ROUTE_COORDS.dest.lat,   ROUTE_COORDS.dest.lon
    ).toFixed(1);
    durationMin = Math.round(distanceKm / 20 * 60); // rough 20km/h city speed

    showFallbackBanner();
  }

  await delay(500);

  // Step 4: Draw route — REF-B-02
  setStepDone(3);
  setStepActive(4);
  state.routeLayer = L.polyline(routeCoords, {
    color: '#2d8a4e',
    weight: 6,
    opacity: 0.9,
    lineJoin: 'round',
    lineCap: 'round',
    dashArray: usedFallback ? '10, 8' : null,
  }).addTo(map);

  map.fitBounds(state.routeLayer.getBounds(), { padding: [40, 40] });
  await delay(700);

  // Step 5: Populate route info card — REF-B-03
  setStepDone(4);
  setStepActive(5);
  updateRouteInfoCard(distanceKm, durationMin);
  await delay(500);

  // Step 6: Show ETA
  setStepDone(5);
  setStepActive(6);
  await delay(500);

  // Step 7: Add driver marker
  setStepDone(6);
  setStepActive(7);
  setStatus('DRIVER ASSIGNED', 'active');
  state.driverMarker = L.marker(routeCoords[0], { icon: createCustomIcon('driver') })
    .addTo(map)
    .bindPopup('<b>Driver:</b> Juan D. · Multicab · ⭐ 4.9', { closeButton: false });
  await delay(800);

  // Step 8: Animate driver
  setStepDone(7);
  setStepActive(8);
  setStatus('DRIVER EN ROUTE', 'active');
  await animateDriver(routeCoords, durationMin);

  // Complete
  setStepDone(8);
  setStatus('ARRIVED', 'active');
  updateTripStatusBadge('ARRIVED', 'active');

  if (btn) {
    btn.disabled = false;
    btn.textContent = '↺ Run Again';
  }

  state.routeTestRunning = false;
  state.routeTestComplete = true;
}

async function animateDriver(coords, durationMin) {
  const statusCheckpoints = {
    0.15: 'ARRIVED AT PICKUP',
    0.30: 'CARGO LOADED',
    0.45: 'IN TRANSIT',
    0.85: 'IN TRANSIT',
  };

  const steps = state.prefersReducedMotion ? 5 : Math.min(coords.length, 80);
  const stepInterval = state.prefersReducedMotion ? 50 : Math.max(80, (durationMin * 1000) / steps);

  for (let i = 0; i < steps; i++) {
    const progress = i / steps;
    const coordIdx = Math.floor(progress * (coords.length - 1));
    const pos = coords[coordIdx];

    if (state.driverMarker) {
      state.driverMarker.setLatLng(pos);
    }

    // Status transitions
    for (const [threshold, status] of Object.entries(statusCheckpoints)) {
      if (progress >= parseFloat(threshold) && progress < parseFloat(threshold) + (1 / steps)) {
        setStatus(status, 'active');
      }
    }

    await delay(stepInterval);
  }

  // Move to final position
  if (state.driverMarker) {
    state.driverMarker.setLatLng(coords[coords.length - 1]);
  }
}

function updateRouteInfoCard(distKm, durMin) {
  const distEl = document.getElementById('ric-distance');
  const etaEl  = document.getElementById('ric-eta');
  const fareEl = document.getElementById('ric-fare');

  if (distEl) distEl.textContent = `${distKm} km`;
  if (etaEl)  etaEl.textContent  = `~${durMin} min`;

  // Simple fare estimate: ₱50 base + ₱8/km
  const fare = Math.round(50 + parseFloat(distKm) * 8);
  if (fareEl) fareEl.textContent = `₱${fare}`;
}

function setStatus(statusText, type = 'ready') {
  const badge = document.getElementById('trip-status-badge');
  if (!badge) return;

  badge.textContent = '';

  const dot = document.createElement('span');
  dot.className = 'status-dot';
  badge.appendChild(dot);
  badge.appendChild(document.createTextNode(statusText));

  badge.className = `trip-status-badge ${type}`;

  // Also update the route info card status
  const cardStatus = document.getElementById('ric-status');
  if (cardStatus) cardStatus.textContent = statusText;
}

function setStepDone(index) {
  const steps = document.querySelectorAll('.test-seq-step');
  if (steps[index]) {
    steps[index].classList.remove('active');
    steps[index].classList.add('done');
    const icon = steps[index].querySelector('.step-icon');
    if (icon) icon.textContent = '✓';
  }
}

function setStepActive(index) {
  const steps = document.querySelectorAll('.test-seq-step');
  if (steps[index]) {
    steps[index].classList.add('active');
  }
}

function resetTestSteps() {
  const steps = document.querySelectorAll('.test-seq-step');
  steps.forEach((step) => {
    step.classList.remove('done', 'active');
    const icon = step.querySelector('.step-icon');
    if (icon) icon.textContent = '';
  });
  hideFallbackBanner();
}

function showFallbackBanner() {
  const banner = document.getElementById('fallback-banner');
  if (banner) banner.classList.add('visible');
}

function hideFallbackBanner() {
  const banner = document.getElementById('fallback-banner');
  if (banner) banner.classList.remove('visible');
}

function updateTripStatusBadge(text, type) {
  setStatus(text, type);
}

/* ================================================================
   10. LEAFLET MAP — Section 16: Live Tracking
   ================================================================ */
function initMapS16() {
  state.mapsInitialized.s16 = true;

  const map = L.map('map-s16', {
    center: [
      (ROUTE_COORDS.pickup.lat + ROUTE_COORDS.dest.lat) / 2,
      (ROUTE_COORDS.pickup.lon + ROUTE_COORDS.dest.lon) / 2,
    ],
    zoom: 14,
    zoomControl: false,
    scrollWheelZoom: false,
    dragging: false,
    keyboard: false,
  });

  L.tileLayer(MAP_CONFIG.tiles, {
    attribution: MAP_CONFIG.tileAttr,
    maxZoom: 19,
  }).addTo(map);

  // Static decorative route
  L.polyline([
    [ROUTE_COORDS.pickup.lat, ROUTE_COORDS.pickup.lon],
    [6.912, 122.071],
    [ROUTE_COORDS.dest.lat, ROUTE_COORDS.dest.lon],
  ], {
    color: '#2d8a4e',
    weight: 5,
    opacity: 0.8,
    lineJoin: 'round',
  }).addTo(map);

  L.marker([ROUTE_COORDS.pickup.lat, ROUTE_COORDS.pickup.lon], { icon: createCustomIcon('pickup') }).addTo(map);
  L.marker([ROUTE_COORDS.dest.lat, ROUTE_COORDS.dest.lon], { icon: createCustomIcon('dest') }).addTo(map);

  // Driver midway
  L.marker([6.912, 122.071], { icon: createCustomIcon('driver') })
    .addTo(map)
    .bindPopup('<b>Driver</b> En Route', { closeButton: false })
    .openPopup();

  state.maps.s16 = map;
  setTimeout(() => map.invalidateSize(), 300);
}

/* ================================================================
   11. SDG COUNTERS — Section 19
   ================================================================ */
const SDG_TARGETS = {
  'sdg-shared-trips':   { end: 1240, suffix: '+' },
  'sdg-items-reused':   { end: 870,  suffix: '+' },
  'sdg-trips-consol':   { end: 420,  suffix: '+' },
  'sdg-fuel-saved':     { end: 340,  suffix: ' L' },
  'sdg-co2-reduction':  { end: 0.8,  suffix: ' t', decimals: 1 },
  'sdg-waste-diverted': { end: 1.2,  suffix: ' t', decimals: 1 },
};

function animateSDGCounters() {
  state.sdgAnimated = true;

  if (state.prefersReducedMotion) {
    // Just set final values
    Object.entries(SDG_TARGETS).forEach(([id, cfg]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = (cfg.decimals ? cfg.end.toFixed(cfg.decimals) : cfg.end) + cfg.suffix;
    });
    return;
  }

  Object.entries(SDG_TARGETS).forEach(([id, cfg], idx) => {
    const el = document.getElementById(id);
    if (!el) return;

    const startDelay = idx * 120;
    const duration = 1800;
    const start = Date.now() + startDelay;
    const dec = cfg.decimals || 0;

    setTimeout(() => {
      function tick() {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out quart
        const eased = 1 - Math.pow(1 - progress, 4);
        const current = cfg.end * eased;

        el.textContent = current.toFixed(dec) + cfg.suffix;

        if (progress < 1) {
          requestAnimationFrame(tick);
        }
      }
      requestAnimationFrame(tick);
    }, startDelay);
  });
}

/* ================================================================
   12. MARKETPLACE FILTER — Section 12
   ================================================================ */
const MARKETPLACE_DATA = [
  { id: 'mi-1', name: 'Study Table',     category: 'furniture',  price: 350,   free: false, emoji: '🪑', condition: 'Good condition' },
  { id: 'mi-2', name: 'Electric Fan',    category: 'appliances', price: 0,     free: true,  emoji: '💨', condition: 'Good condition' },
  { id: 'mi-3', name: 'Plastic Drawers', category: 'storage',    price: 150,   free: false, emoji: '🗄️', condition: 'Fair condition' },
  { id: 'mi-4', name: 'Study Chair',     category: 'furniture',  price: 200,   free: false, emoji: '🪑', condition: 'Good condition' },
  { id: 'mi-5', name: 'Rice Cooker',     category: 'appliances', price: 0,     free: true,  emoji: '🍚', condition: 'Good condition' },
  { id: 'mi-6', name: 'Bookshelf',       category: 'furniture',  price: 400,   free: false, emoji: '📚', condition: 'Good condition' },
  { id: 'mi-7', name: 'Study Lamp',      category: 'appliances', price: 80,    free: false, emoji: '💡', condition: 'Fair condition' },
  { id: 'mi-8', name: 'Notebook Bundle', category: 'study',      price: 0,     free: true,  emoji: '📓', condition: 'Barely used' },
];

let activeFilter = 'all';
let showFreeOnly = false;
let searchQuery = '';

function initMarketplace() {
  // Filter chips
  document.querySelectorAll('.filter-chip[data-filter]').forEach((chip) => {
    chip.addEventListener('click', () => {
      if (chip.dataset.filter === 'free') {
        showFreeOnly = !showFreeOnly;
        chip.classList.toggle('active', showFreeOnly);
      } else {
        activeFilter = chip.dataset.filter;
        document.querySelectorAll('.filter-chip[data-filter]:not([data-filter="free"])').forEach((c) => {
          c.classList.toggle('active', c.dataset.filter === activeFilter);
        });
      }
      filterMarketplace();
    });
  });

  // Search
  const searchInput = document.getElementById('marketplace-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase();
      filterMarketplace();
    });
  }
}

function filterMarketplace() {
  const items = document.querySelectorAll('.marketplace-item');
  items.forEach((item) => {
    const cat   = item.dataset.category;
    const isFree = item.dataset.free === 'true';
    const name  = item.dataset.name?.toLowerCase() || '';

    const matchesFilter = activeFilter === 'all' || cat === activeFilter;
    const matchesFree   = !showFreeOnly || isFree;
    const matchesSearch = !searchQuery || name.includes(searchQuery);

    item.classList.toggle('hidden', !(matchesFilter && matchesFree && matchesSearch));
  });
}

/* ================================================================
   13. CAROUSEL — Section 20: App Preview
   ================================================================ */
function initCarousel() {
  const phones = document.querySelectorAll('.phone-frame');
  if (!phones.length) return;

  updateCarousel(phones);

  document.getElementById('carousel-prev')?.addEventListener('click', () => {
    state.carouselIndex = Math.max(0, state.carouselIndex - 1);
    updateCarousel(phones);
  });

  document.getElementById('carousel-next')?.addEventListener('click', () => {
    state.carouselIndex = Math.min(phones.length - 1, state.carouselIndex + 1);
    updateCarousel(phones);
  });

  phones.forEach((phone, i) => {
    phone.addEventListener('click', () => {
      state.carouselIndex = i;
      updateCarousel(phones);
    });
  });
}

function updateCarousel(phones) {
  phones.forEach((phone, i) => {
    phone.classList.toggle('active', i === state.carouselIndex);
  });
}

/* ================================================================
   14. JOURNEY TIMELINE — Section 18
   ================================================================ */
function initJourney() {
  const steps = document.querySelectorAll('.journey-step');
  if (!steps.length) return;

  // Mark first 3 as completed, 4th as active (demo state)
  steps.forEach((step, i) => {
    if (i < 3) step.classList.add('completed');
    else if (i === 3) step.classList.add('active');
  });
}

/* ================================================================
   15. CTA BUTTONS — Smooth scroll to sections
   ================================================================ */
function initCTAButtons() {
  document.querySelectorAll('[data-scroll-to]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.scrollTo;
      const idx = SECTIONS.findIndex((s) => s.id === targetId);
      if (idx !== -1) scrollToSection(idx);
    });
  });

  // Also wire up route test button
  initRouteTestButton();
}

/* ================================================================
   16. SECTION 05 — Cargo Chips (Smart Booking)
   ================================================================ */
function initCargoChips() {
  document.querySelectorAll('.cargo-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.cargo-chip').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });
}

/* ================================================================
   17. CTA PARTICLES — Section 21
   ================================================================ */
function generateParticles() {
  const bg = document.querySelector('.cta-bg');
  if (!bg || state.prefersReducedMotion) return;

  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'cta-particle';
    const size = Math.random() * 60 + 20;
    const left = Math.random() * 100;
    const delay = Math.random() * 12;
    const dur   = Math.random() * 10 + 15;

    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${left}%;
      bottom: -${size}px;
      animation-delay: ${delay}s;
      animation-duration: ${dur}s;
    `;
    bg.appendChild(p);
  }
}

/* ================================================================
   18. UTILITIES
   ================================================================ */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
