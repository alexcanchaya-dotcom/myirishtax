import { buildExportSummary, calculateTaxResult, formatEuro } from './calculator.js';

const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach((item, index) => {
  const question = item.querySelector('.faq-question');
  const answer = item.querySelector('.faq-answer');
  const toggle = item.querySelector('.faq-toggle');

  if (!question || !answer) return;

  const answerId = answer.id || `faq-answer-${index + 1}`;
  answer.id = answerId;
  question.setAttribute('aria-controls', answerId);

  const isInitiallyActive = item.classList.contains('active');
  answer.hidden = !isInitiallyActive;

  question.addEventListener('click', () => {
    const isActive = item.classList.toggle('active');
    question.setAttribute('aria-expanded', isActive ? 'true' : 'false');
    answer.hidden = !isActive;
    if (toggle) toggle.textContent = isActive ? '–' : '+';
  });
});

const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
navLinks.forEach((link) => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

function toggleCookieBanner(show) {
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;
  if (show) {
    banner.classList.add('show');
  } else {
    banner.classList.remove('show');
  }
}

const consent = localStorage.getItem('mit-consent');
if (!consent) {
  setTimeout(() => toggleCookieBanner(true), 900);
}

document.getElementById('accept-cookies')?.addEventListener('click', () => {
  localStorage.setItem('mit-consent', 'accepted');
  toggleCookieBanner(false);
});

document.getElementById('reject-cookies')?.addEventListener('click', () => {
  localStorage.setItem('mit-consent', 'rejected');
  toggleCookieBanner(false);
});

const calculatorForm = document.getElementById('tax-calculator');
const resultsContainer = document.getElementById('results');
const scenarioNet = document.getElementById('scenario-net');
const baselineNet = document.getElementById('baseline-net');
const scenarioSavings = document.getElementById('scenario-savings');
const pensionSlider = document.getElementById('pension-rate');
const bonusSlider = document.getElementById('bonus-amount');
const pensionValue = document.getElementById('pension-value');
const bonusValue = document.getElementById('bonus-value');
const pdfButton = document.getElementById('download-pdf');
const csvButton = document.getElementById('download-csv');
const emailForm = document.getElementById('email-summary');
const reminderForm = document.getElementById('reminder-form');
const checklist = document.getElementById('credits-checklist');
const historyContainer = document.getElementById('history-bars');
const historyMeta = document.getElementById('history-meta');

let lastResult = null;
const HISTORY_KEY = 'mit-year-history';

calculatorForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!resultsContainer) return;
function formatEuro(amount) {
  return `€${amount.toFixed(2)}`;
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
}

async function loadTaxYearOptions() {
  if (!taxYearSelect) return;
  try {
    const { years } = await fetchJson('/api/tax/config');
    taxYearSelect.innerHTML = '';
    years.forEach((entry) => {
      const option = document.createElement('option');
      option.value = entry.year;
      option.textContent = entry.year;
      taxYearSelect.appendChild(option);
    });
    const latest = years.at(-1);
    if (latest) {
      taxYearSelect.value = latest.year;
      const config = await ensureTaxYearConfig(latest.year);
      applyDefaultCredits(config);
    }
  } catch (err) {
    console.error('Unable to load tax years', err);
  }
}

function calculateEstimate({ income, cutoff, credits, includeUSC, includePRSI, pensionRate = 0, bonus = 0 }) {
  const pensionDecimal = Math.max(0, pensionRate) / 100;
  const bonusAmount = Math.max(0, Number(bonus) || 0);
  const grossWithBonus = income + bonusAmount;
  const pensionContribution = grossWithBonus * pensionDecimal;
  const taxableIncome = Math.max(0, grossWithBonus - pensionContribution);

  const standardTax = Math.min(taxableIncome, cutoff) * 0.2;
  const higherTax = Math.max(0, taxableIncome - cutoff) * 0.4;
  const paye = Math.max(0, standardTax + higherTax - credits);
  const usc = includeUSC ? calculateUSC(taxableIncome) : 0;
  const prsi = includePRSI ? taxableIncome * 0.04 : 0;
  const totalDeductions = paye + usc + prsi + pensionContribution;
  const net = Math.max(0, grossWithBonus - totalDeductions);

  return { paye, usc, prsi, pensionContribution, totalDeductions, net, grossWithBonus };
}

function getInputs() {
  return {
    income: Number(calculatorForm?.income.value) || 0,
    cutoff: Number(calculatorForm?.cutoff.value) || 0,
    credits: Number(calculatorForm?.credits.value) || 0,
    includeUSC: calculatorForm?.usc.value === 'yes',
    includePRSI: calculatorForm?.prsi.value === 'yes'
  };
}

function renderResults(baseResult) {
  if (!resultsContainer) return;
  resultsContainer.innerHTML = `
    <div class="card">
      <h3>Summary</h3>
      <p><strong>Estimated net pay:</strong> ${formatEuro(baseResult.net)}</p>
      <p><strong>Total deductions:</strong> ${formatEuro(baseResult.totalDeductions)}</p>
    </div>
    <div class="card">
      <h3>Breakdown</h3>
      <ul class="features">
        <li>PAYE (est.): ${formatEuro(baseResult.paye)}</li>
        <li>USC (est.): ${formatEuro(baseResult.usc)}</li>
        <li>PRSI (est.): ${formatEuro(baseResult.prsi)}</li>
        <li>Pension contribution: ${formatEuro(baseResult.pensionContribution)}</li>
      </ul>
      <p class="meta">Approximation based on common bands. Actual liability depends on Revenue rules, thresholds, and your circumstances.</p>
    </div>
    <pre class="meta">PDF/export snapshot:\n${JSON.stringify(snapshot, null, 2)}</pre>
  `;
}

function renderScenario(baseResult, scenarioResult) {
  if (!scenarioNet || !baselineNet || !scenarioSavings) return;
  baselineNet.textContent = formatEuro(baseResult.net);
  scenarioNet.textContent = formatEuro(scenarioResult.net);
  const delta = scenarioResult.net - baseResult.net;
  scenarioSavings.textContent = `${delta >= 0 ? 'Up' : 'Down'} ${formatEuro(Math.abs(delta))} vs. baseline`;
}

function displayHistory(records = []) {
  if (!historyContainer || !historyMeta) return;
  if (records.length === 0) {
    historyContainer.innerHTML = '<p class="meta">Run a calculation to start your saved draft history.</p>';
    historyMeta.textContent = '';
    return;
  }

  const lastTwo = records.slice(-2);
  if (lastTwo.length < 2) {
    historyContainer.innerHTML = '<p class="meta">Run another calculation to see year-over-year changes.</p>';
    historyMeta.textContent = '';
    return;
  }

  const [prev, current] = lastTwo;
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

function updateHistory(baseResult) {
  if (!historyContainer || !historyMeta) return;
  const record = { net: baseResult.net, income: getInputs().income, timestamp: Date.now() };
  const existing = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  existing.push(record);
  const trimmed = existing.slice(-4);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  displayHistory(trimmed);
}

function renderStoredHistory() {
  const existing = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  displayHistory(existing);
}

function syncChecklist() {
  if (!checklist) return;
  const stored = JSON.parse(localStorage.getItem('mit-credits-checklist') || '{}');
  checklist.querySelectorAll('input[type="checkbox"]').forEach((box) => {
    const key = box.id;
    box.checked = Boolean(stored[key]);
    box.addEventListener('change', () => {
      stored[key] = box.checked;
      localStorage.setItem('mit-credits-checklist', JSON.stringify(stored));
    });
  });
}

function exportData(format) {
  if (!lastResult) {
    alert('Run the calculator first to export results.');
    return;
  }

  const rows = [
    ['Gross (incl. bonus)', formatEuro(lastResult.grossWithBonus)],
    ['Net pay', formatEuro(lastResult.net)],
    ['PAYE', formatEuro(lastResult.paye)],
    ['USC', formatEuro(lastResult.usc)],
    ['PRSI', formatEuro(lastResult.prsi)],
    ['Pension contribution', formatEuro(lastResult.pensionContribution)],
    ['Total deductions', formatEuro(lastResult.totalDeductions)]
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

function attachExports() {
  pdfButton?.addEventListener('click', () => exportData('pdf'));
  csvButton?.addEventListener('click', () => exportData('csv'));
}

function attachEmailSummary() {
  if (!emailForm) return;
  emailForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!lastResult) {
      alert('Calculate your estimate before sending a summary.');
      return;
    }
    const email = emailForm.email.value;
    const consent = emailForm.consent.checked;
    if (!consent) {
      alert('Consent is required before emailing your summary.');
      return;
    }
    const summary = `Net pay: ${formatEuro(lastResult.net)} | Total deductions: ${formatEuro(lastResult.totalDeductions)} | Pension: ${formatEuro(lastResult.pensionContribution)}`;
    try {
      const response = await fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, summary, consent })
      });
      if (!response.ok) throw new Error('Unable to send summary');
      emailForm.reset();
      emailForm.querySelector('.form-status').textContent = 'Summary emailed securely.';
    } catch (err) {
      emailForm.querySelector('.form-status').textContent = 'Email failed. Please try again.';
      console.error(err);
    }
  });
}

function attachReminderForm() {
  if (!reminderForm) return;
  reminderForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = reminderForm.email.value;
    const type = reminderForm.elements.type.value;
    const consent = reminderForm.consent.checked;
    if (!consent) {
      alert('Consent is required before scheduling reminders.');
      return;
    }
    try {
      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type })
      });
      if (!response.ok) throw new Error('Unable to schedule reminder');
      reminderForm.reset();
      reminderForm.querySelector('.form-status').textContent = 'Reminder saved with GDPR consent noted.';
    } catch (err) {
      reminderForm.querySelector('.form-status').textContent = 'Could not save reminder.';
      console.error(err);
    }
  });
}

function updateSliderLabels() {
  if (pensionValue && pensionSlider) {
    pensionValue.textContent = `${pensionSlider.value}%`;
  }
  if (bonusValue && bonusSlider) {
    bonusValue.textContent = `€${Number(bonusSlider.value).toLocaleString()}`;
  }
}

function runScenario(baseResult) {
  if (!pensionSlider || !bonusSlider) return;
  const scenario = calculateEstimate({
    ...getInputs(),
    pensionRate: Number(pensionSlider.value),
    bonus: Number(bonusSlider.value)
  });
  renderScenario(baseResult, scenario);
}

calculatorForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const inputs = getInputs();
  const baseResult = calculateEstimate({ ...inputs });
  lastResult = { ...baseResult, ...inputs };
  renderResults(baseResult);
  runScenario(baseResult);
  updateHistory(baseResult);
});

pensionSlider?.addEventListener('input', () => {
  updateSliderLabels();
  if (lastResult) runScenario(lastResult);
});
bonusSlider?.addEventListener('input', () => {
  updateSliderLabels();
  if (lastResult) runScenario(lastResult);
});

attachExports();
attachEmailSummary();
attachReminderForm();
syncChecklist();
updateSliderLabels();
renderStoredHistory();
