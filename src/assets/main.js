import { calculateTaxResult, formatEuro } from './calculator.js';

const DEFAULT_CUTOFF = 42000;
const DEFAULT_CREDITS = 3500;
const HISTORY_KEY = 'mit-year-history';
const CONSENT_KEY = 'mit-consent';

function setupFaq() {
  document.querySelectorAll('.faq-item').forEach((item, index) => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    const toggle = item.querySelector('.faq-toggle');
    if (!question || !answer) return;

    const answerId = answer.id || `faq-answer-${index + 1}`;
    answer.id = answerId;
    question.setAttribute('aria-controls', answerId);
    question.setAttribute('tabindex', '0');

    const syncState = (isActive) => {
      question.setAttribute('aria-expanded', isActive ? 'true' : 'false');
      answer.hidden = !isActive;
      if (toggle) toggle.textContent = isActive ? '–' : '+';
    };

    syncState(item.classList.contains('active'));

    const toggleItem = () => {
      const isActive = item.classList.toggle('active');
      syncState(isActive);
    };

    question.addEventListener('click', toggleItem);
    question.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleItem();
      }
    });
  });
}

function setupSmoothScroll() {
  document.querySelectorAll('.nav-links a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    });
  });
}

function toggleCookieBanner(show) {
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;
  banner.classList.toggle('show', Boolean(show));
}

async function loadTracking(consent) {
  if (consent !== 'accepted') return;
  try {
    const module = await import('./tracking.js');
    module.bootstrapTracking();
  } catch (error) {
    console.warn('Optional tracking failed to load', error);
  }
}

function setupConsent() {
  const acceptButton = document.getElementById('accept-cookies');
  const rejectButton = document.getElementById('reject-cookies');
  const consent = localStorage.getItem(CONSENT_KEY);

  if (!consent) {
    setTimeout(() => toggleCookieBanner(true), 600);
  } else {
    loadTracking(consent);
  }

  acceptButton?.addEventListener('click', () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    toggleCookieBanner(false);
    loadTracking('accepted');
  });

  rejectButton?.addEventListener('click', () => {
    localStorage.setItem(CONSENT_KEY, 'rejected');
    toggleCookieBanner(false);
  });
}

function getCalculatorInputs() {
  const primaryIncome = Number(document.getElementById('income')?.value) || 0;
  const secondaryIncome = Number(document.getElementById('secondary-income')?.value) || 0;
  const credits = Number(document.getElementById('credits')?.value) || DEFAULT_CREDITS;
  const includeUSC = document.getElementById('usc')?.value !== 'no';
  const includePRSI = document.getElementById('prsi')?.value !== 'no';

  return {
    income: Math.max(primaryIncome + secondaryIncome, 0),
    cutoff: DEFAULT_CUTOFF,
    credits: Math.max(credits, 0),
    includeUSC,
    includePRSI
  };
}

function renderResults(result) {
  const resultsContainer = document.getElementById('results');
  if (!resultsContainer) return;

  resultsContainer.innerHTML = `
    <div class="card" role="status" aria-live="polite">
      <h3>Summary</h3>
      <p><strong>Estimated net pay:</strong> ${formatEuro(result.net)}</p>
      <p><strong>Total deductions:</strong> ${formatEuro(result.totalDeductions)}</p>
    </div>
    <div class="card">
      <h3>Breakdown</h3>
      <ul class="features">
        <li>PAYE (est.): ${formatEuro(result.paye)}</li>
        <li>USC (est.): ${formatEuro(result.usc)}</li>
        <li>PRSI (est.): ${formatEuro(result.prsi)}</li>
      </ul>
      <p class="meta">Approximation based on common bands. Confirm against Revenue thresholds.</p>
    </div>
  `;
}

function renderScenario(baseResult, scenarioResult) {
  const scenarioNet = document.getElementById('scenario-net');
  const baselineNet = document.getElementById('baseline-net');
  const scenarioSavings = document.getElementById('scenario-savings');

  if (!scenarioNet || !baselineNet || !scenarioSavings) return;
  baselineNet.textContent = formatEuro(baseResult.net);
  scenarioNet.textContent = formatEuro(scenarioResult.net);
  const delta = scenarioResult.net - baseResult.net;
  scenarioSavings.textContent = `${delta >= 0 ? 'Up' : 'Down'} ${formatEuro(Math.abs(delta))} vs. baseline`;
}

function updateSliders() {
  const pensionSlider = document.getElementById('pension-rate');
  const bonusSlider = document.getElementById('bonus-amount');
  const pensionValue = document.getElementById('pension-value');
  const bonusValue = document.getElementById('bonus-value');

  if (pensionValue && pensionSlider) pensionValue.textContent = `${pensionSlider.value}%`;
  if (bonusValue && bonusSlider) bonusValue.textContent = `€${Number(bonusSlider.value).toLocaleString()}`;
}

function displayHistory(records = []) {
  const historyContainer = document.getElementById('history-bars');
  const historyMeta = document.getElementById('history-meta');
  if (!historyContainer || !historyMeta) return;

  if (records.length < 2) {
    historyContainer.innerHTML = '<p class="meta">Run two calculations to see your change over time.</p>';
    historyMeta.textContent = '';
    return;
  }

  const [prev, current] = records.slice(-2);
  const maxNet = Math.max(prev.net, current.net, 1);
  historyContainer.innerHTML = `
    <div class="bar" aria-label="Previous year net" style="width:${(prev.net / maxNet) * 100}%">
      <span>Prev: ${formatEuro(prev.net)}</span>
    </div>
    <div class="bar active" aria-label="Current year net" style="width:${(current.net / maxNet) * 100}%">
      <span>Current: ${formatEuro(current.net)}</span>
    </div>
  `;

  const yearOverYear = current.net - prev.net;
  historyMeta.textContent = `${yearOverYear >= 0 ? 'Increase' : 'Decrease'} of ${formatEuro(Math.abs(yearOverYear))} based on your saved drafts.`;
}

function saveHistory(result) {
  const records = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  records.push({ net: result.net, timestamp: Date.now() });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(records.slice(-4)));
  displayHistory(records.slice(-4));
}

function exportData(result, format) {
  const rows = [
    ['Net pay', formatEuro(result.net)],
    ['Total deductions', formatEuro(result.totalDeductions)],
    ['PAYE', formatEuro(result.paye)],
    ['USC', formatEuro(result.usc)],
    ['PRSI', formatEuro(result.prsi)]
  ];

  if (format === 'csv') {
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'my-irish-tax-estimate.csv';
    link.click();
    URL.revokeObjectURL(url);
  } else {
    const pdfContent = rows.map((r) => `${r[0]}: ${r[1]}`).join('\n');
    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'my-irish-tax-estimate.pdf';
    link.click();
    URL.revokeObjectURL(url);
  }
}

function setupExports(lastResultRef) {
  document.getElementById('download-pdf')?.addEventListener('click', () => {
    if (lastResultRef.value) exportData(lastResultRef.value, 'pdf');
  });
  document.getElementById('download-csv')?.addEventListener('click', () => {
    if (lastResultRef.value) exportData(lastResultRef.value, 'csv');
  });
}

function setupEmailForm(lastResultRef) {
  const form = document.getElementById('email-summary');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const status = form.querySelector('.form-status');
    if (!lastResultRef.value) {
      status.textContent = 'Calculate your estimate before sending a summary.';
      return;
    }

    const honeypot = form.querySelector('[name="website"]');
    if (honeypot?.value) return;

    const payload = {
      email: form.email.value,
      summary: `Net pay: ${formatEuro(lastResultRef.value.net)} | Total deductions: ${formatEuro(lastResultRef.value.totalDeductions)}`,
      consent: form.consent.checked,
      website: honeypot?.value || ''
    };

    try {
      const response = await fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Unable to send summary');
      form.reset();
      status.textContent = 'Summary emailed securely.';
    } catch (error) {
      status.textContent = 'Email failed. Please try again.';
      console.error(error);
    }
  });
}

function setupReminderForm() {
  const form = document.getElementById('reminder-form');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const status = form.querySelector('.form-status');
    const honeypot = form.querySelector('[name="website"]');
    if (honeypot?.value) return;

    const payload = {
      email: form.email.value,
      type: form.elements.type.value,
      consent: form.consent.checked,
      website: honeypot?.value || ''
    };

    try {
      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Unable to schedule reminder');
      form.reset();
      status.textContent = 'Reminder saved with GDPR consent noted.';
    } catch (error) {
      status.textContent = 'Could not save reminder.';
      console.error(error);
    }
  });
}

function lazyLoadHistory() {
  const section = document.getElementById('year-over-year');
  if (!section) return;

  const observer = new IntersectionObserver(
    () => {
      const records = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      displayHistory(records);
      observer.disconnect();
    },
    { threshold: 0.2 }
  );

  observer.observe(section);
}

function setupCalculator() {
  const form = document.getElementById('tax-calculator');
  if (!form) return;
  const lastResultRef = { value: null };

  const recalculate = () => {
    const inputs = getCalculatorInputs();
    const baseResult = calculateTaxResult(inputs);
    lastResultRef.value = baseResult;
    renderResults(baseResult);

    const pensionRate = Number(document.getElementById('pension-rate')?.value) || 0;
    const bonusAmount = Number(document.getElementById('bonus-amount')?.value) || 0;
    const scenarioResult = calculateTaxResult({
      ...inputs,
      income: inputs.income + bonusAmount,
      credits: Math.max(inputs.credits - (inputs.income + bonusAmount) * (pensionRate / 100), 0)
    });
    renderScenario(baseResult, scenarioResult);
    saveHistory(baseResult);
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    recalculate();
  });

  document.getElementById('pension-rate')?.addEventListener('input', () => {
    updateSliders();
    if (lastResultRef.value) recalculate();
  });
  document.getElementById('bonus-amount')?.addEventListener('input', () => {
    updateSliders();
    if (lastResultRef.value) recalculate();
  });

  setupExports(lastResultRef);
  setupEmailForm(lastResultRef);
  setupReminderForm();
  updateSliders();
  lazyLoadHistory();
}

function enhanceForms() {
  document.querySelectorAll('form').forEach((form) => {
    form.addEventListener('invalid', (event) => {
      const target = event.target;
      if (target instanceof HTMLElement) {
        target.setAttribute('aria-invalid', 'true');
      }
    }, true);
  });
}

setupFaq();
setupSmoothScroll();
setupConsent();
setupCalculator();
enhanceForms();
