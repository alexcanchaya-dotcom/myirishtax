const pendingScripts = [
  {
    id: 'analytics-placeholder',
    src: 'https://example.invalid/analytics.js',
    description: 'Deferred analytics loader',
    optional: true
  }
];

function injectScript({ id, src }) {
  if (document.getElementById(id)) return;
  const script = document.createElement('script');
  script.id = id;
  script.src = src;
  script.async = true;
  script.dataset.consent = 'required';
  document.head.appendChild(script);
}

export function bootstrapTracking() {
  pendingScripts.forEach((entry) => injectScript(entry));
}
