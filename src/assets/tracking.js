const PLAUSIBLE_CONFIG = {
  id: 'plausible-script',
  src: 'https://plausible.io/js/plausible.js',
  attrs: {
    'data-domain': 'myirishtax.com',
    'data-api': 'https://plausible.io/api/event'
  }
};

const GA4_MEASUREMENT_ID = 'G-MIT1234567';
const GA4_CONFIG = {
  id: 'ga4-script',
  src: `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`
};

const WEB_VITALS_SRC = 'https://unpkg.com/web-vitals@3/dist/web-vitals.iife.js';
const queuedEvents = [];

function injectScript({ id, src, attrs = {} }) {
  if (document.getElementById(id)) return;
  const script = document.createElement('script');
  script.id = id;
  script.src = src;
  script.async = true;
  Object.entries(attrs).forEach(([key, value]) => script.setAttribute(key, value));
  document.head.appendChild(script);
}

function primePlausible() {
  if (!window.plausible) {
    window.plausible = function () {
      (window.plausible.q = window.plausible.q || []).push(arguments);
    };
  }
  injectScript(PLAUSIBLE_CONFIG);
}

function primeGA(consentGranted) {
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('consent', 'default', {
    ad_storage: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted'
  });

  if (consentGranted) {
    gtag('consent', 'update', {
      ad_storage: 'granted',
      analytics_storage: 'granted'
    });
  }

  gtag('config', GA4_MEASUREMENT_ID, {
    anonymize_ip: true,
    transport_type: 'beacon'
  });

  injectScript(GA4_CONFIG);
}

function dispatchEvent(name, properties = {}) {
  const payload = { ...properties };
  queuedEvents.push({ name, payload });
  flushEvents();
}

function flushEvents() {
  const hasTrackers = typeof window.gtag === 'function' || typeof window.plausible === 'function';
  if (!hasTrackers) return;

  while (queuedEvents.length) {
    const { name, payload } = queuedEvents.shift();
    if (window.plausible) {
      window.plausible(name, { props: payload });
    }
    if (typeof window.gtag === 'function') {
      window.gtag('event', name, payload);
    }
  }
}

async function loadWebVitals() {
  if (window.webVitals) return window.webVitals;

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = WEB_VITALS_SRC;
    script.async = true;
    script.onload = () => (window.webVitals ? resolve(window.webVitals) : reject(new Error('Web Vitals unavailable')));
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export function trackEvent(name, properties = {}) {
  dispatchEvent(name, properties);
}

export async function startWebVitals() {
  try {
    const webVitals = await loadWebVitals();
    const handler = (metric) =>
      dispatchEvent('web_vital', {
        id: metric.id,
        name: metric.name,
        value: Number(metric.value.toFixed(3)),
        rating: metric.rating
      });

    webVitals.onCLS(handler);
    webVitals.onFID(handler);
    webVitals.onLCP(handler);
    webVitals.onFCP(handler);
    webVitals.onINP?.(handler);
    webVitals.onTTFB?.(handler);
  } catch (error) {
    console.warn('Web Vitals failed to initialise', error);
  }
}

export function bootstrapTracking() {
  primePlausible();
  primeGA(true);
  flushEvents();
  startWebVitals();
}
