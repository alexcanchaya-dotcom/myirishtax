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
const taxYearSelect = document.getElementById('tax-year');
const creditsInput = document.getElementById('credits');
const secondaryIncomeInput = document.getElementById('secondary-income');

const taxYearCache = new Map();

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

async function ensureTaxYearConfig(year) {
  if (taxYearCache.has(year)) return taxYearCache.get(year);
  const data = await fetchJson(`/api/tax/config/${year}`);
  taxYearCache.set(year, data);
  return data;
}

function applyDefaultCredits(config) {
  if (!creditsInput || !config?.income_tax?.credits) return;
  const defaultCredits = (config.income_tax.credits.personal || 0) + (config.income_tax.credits.paye || 0);
  creditsInput.value = defaultCredits;
}

function renderWarnings(warnings = []) {
  if (!warnings.length) return '';
  const items = warnings.map((warning) => `<li>${warning}</li>`).join('');
  return `<div class="card warning"><h3>Guardrails</h3><ul class="features">${items}</ul></div>`;
}

function renderBreakdown(liabilities = []) {
  return liabilities
    .filter((item) => item.type !== 'bik')
    .map(
      (item) => `<li>${item.type.toUpperCase()}: ${formatEuro(item.liability || 0)}</li>`
    )
    .join('');
}

calculatorForm?.addEventListener('change', async (e) => {
  if (e.target === taxYearSelect && taxYearSelect.value) {
    try {
      const config = await ensureTaxYearConfig(taxYearSelect.value);
      applyDefaultCredits(config);
    } catch (err) {
      console.error('Unable to load selected year', err);
    }
  }
});

calculatorForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!resultsContainer || !taxYearSelect) return;

  const taxYear = taxYearSelect.value;
  const income = Number(calculatorForm.income.value) || 0;
  const secondaryIncome = Number(secondaryIncomeInput?.value) || 0;
  const creditsValue = creditsInput?.value ?? '';
  const credits = creditsValue === '' ? null : Number(creditsValue);
  const includeUSC = calculatorForm.usc.value === 'yes';
  const includePRSI = calculatorForm.prsi.value === 'yes';
  const week1Month1Basis = calculatorForm['week1-month1']?.checked || false;

  try {
    const payload = {
      taxYear,
      employments: [income, secondaryIncome],
      taxCredits: Number.isFinite(credits) ? credits : null,
      includeUSC,
      includePRSI,
      week1Month1Basis
    };

    const { result } = await fetchJson('/api/tax/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const warningBlock = renderWarnings(result.warnings);
    resultsContainer.innerHTML = `
      <div class="card">
        <h3>Summary (${result.configMeta.year})</h3>
        <p><strong>Estimated net pay:</strong> ${formatEuro(result.summary.netIncome)}</p>
        <p><strong>Total deductions:</strong> ${formatEuro(result.summary.totalLiability)}</p>
      </div>
      <div class="card">
        <h3>Breakdown</h3>
        <ul class="features">${renderBreakdown(result.liabilities)}</ul>
        <p class="meta">Runtime config driven by Revenue-style thresholds. Use as guidance only.</p>
      </div>
      ${warningBlock}
    `;
  } catch (err) {
    resultsContainer.innerHTML = `<div class="card warning"><h3>Calculation error</h3><p>${err.message}</p></div>`;
  }
});

loadTaxYearOptions();
