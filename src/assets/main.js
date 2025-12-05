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

function formatEuro(amount) {
  return `€${amount.toFixed(2)}`;
}

function calculateUSC(income) {
  const bands = [
    { limit: 12012, rate: 0.005 },
    { limit: 25460, rate: 0.02 },
    { limit: 55216, rate: 0.045 }
  ];
  let remaining = income;
  let usc = 0;
  for (const band of bands) {
    const taxable = Math.min(remaining, band.limit - (bands[bands.indexOf(band) - 1]?.limit || 0));
    if (taxable > 0) {
      usc += taxable * band.rate;
      remaining -= taxable;
    }
  }
  if (remaining > 0) usc += remaining * 0.08;
  return usc;
}

calculatorForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!resultsContainer) return;

  const income = Number(calculatorForm.income.value) || 0;
  const cutoff = Number(calculatorForm.cutoff.value) || 0;
  const credits = Number(calculatorForm.credits.value) || 0;
  const includeUSC = calculatorForm.usc.value === 'yes';
  const includePRSI = calculatorForm.prsi.value === 'yes';

  const standardTax = Math.min(income, cutoff) * 0.2;
  const higherTax = Math.max(0, income - cutoff) * 0.4;
  let paye = Math.max(0, standardTax + higherTax - credits);
  const usc = includeUSC ? calculateUSC(income) : 0;
  const prsi = includePRSI ? income * 0.04 : 0;
  const totalDeductions = paye + usc + prsi;
  const net = Math.max(0, income - totalDeductions);

  resultsContainer.innerHTML = `
    <div class="card">
      <h3>Summary</h3>
      <p><strong>Estimated net pay:</strong> ${formatEuro(net)}</p>
      <p><strong>Total deductions:</strong> ${formatEuro(totalDeductions)}</p>
    </div>
    <div class="card">
      <h3>Breakdown</h3>
      <ul class="features">
        <li>PAYE (est.): ${formatEuro(paye)}</li>
        <li>USC (est.): ${formatEuro(usc)}</li>
        <li>PRSI (est.): ${formatEuro(prsi)}</li>
      </ul>
      <p class="meta">Approximation based on common bands. Actual liability depends on Revenue rules, thresholds, and your circumstances.</p>
    </div>
  `;
});

const tabGroups = document.querySelectorAll('[data-tabs]');
tabGroups.forEach((group) => {
  const buttons = group.querySelectorAll('[role="tab"]');
  const panels = group.querySelectorAll('[role="tabpanel"]');

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('aria-controls');
      buttons.forEach((btn) => btn.setAttribute('aria-selected', btn === button ? 'true' : 'false'));
      panels.forEach((panel) => panel.setAttribute('aria-hidden', panel.id === targetId ? 'false' : 'true'));
    });
  });
});

const accordions = document.querySelectorAll('[data-accordion]');
accordions.forEach((accordion) => {
  accordion.querySelectorAll('.accordion-item').forEach((item, index) => {
    const toggle = item.querySelector('[data-accordion-toggle]');
    const body = item.querySelector('.accordion-body');
    if (!toggle || !body) return;

    const bodyId = body.id || `accordion-body-${index + 1}`;
    body.id = bodyId;
    toggle.setAttribute('aria-controls', bodyId);

    const isActive = item.classList.contains('active');
    body.hidden = !isActive;
    toggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');

    toggle.addEventListener('click', () => {
      const nowActive = item.classList.toggle('active');
      body.hidden = !nowActive;
      toggle.setAttribute('aria-expanded', nowActive ? 'true' : 'false');
      const icon = toggle.querySelector('span[aria-hidden="true"]');
      if (icon) icon.textContent = nowActive ? '–' : '+';
    });
  });
});
