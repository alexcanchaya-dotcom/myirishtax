import express from 'express';
import multer from 'multer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendEmail } from '../email/emailClient.js';
import {
  startOnboarding,
  uploadDocument,
  scheduleReminder,
  createUpsellIntent
} from '../automations/workflows.js';
import { listAvailableTaxYears, loadTaxYearConfig } from './config/taxYearRepository.js';
import { runTaxPipeline } from './tax/calculationPipeline.js';

dotenv.config();

const app = express();
const upload = multer({ dest: 'uploads/' });
const PORT = process.env.PORT || 3000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;
const requestCounts = new Map();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'no-referrer-when-downgrade',
    'Permissions-Policy': 'geolocation=()',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; form-action 'self';"
  });
  next();
});

function rateLimit(req, res, next) {
  const now = Date.now();
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const entry = requestCounts.get(ip) || { count: 0, start: now };
  if (now - entry.start > RATE_LIMIT_WINDOW_MS) {
    requestCounts.set(ip, { count: 1, start: now });
    return next();
  }
  if (entry.count >= RATE_LIMIT_MAX) return res.status(429).json({ error: 'Slow down and try again shortly.' });
  entry.count += 1;
  requestCounts.set(ip, entry);
  return next();
}

app.use(rateLimit);

function hasBotField(req) {
  return typeof req.body?.website === 'string' && req.body.website.trim().length > 0;
}

// Health/SSL check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', ssl: process.env.ENABLE_SSL === 'true' });
});

app.post('/api/contact', async (req, res) => {
  const { name, email, phone, service, message, consent } = req.body;
  if (hasBotField(req)) return res.status(400).json({ error: 'Bot submission detected' });
  if (!name || !email || !message || !consent) return res.status(400).json({ error: 'Missing required fields' });

  const subject = `New enquiry: ${service || 'General'}`;
  const html = `<p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phone || 'n/a'}</p>
    <p><strong>Service:</strong> ${service || 'n/a'}</p>
    <p><strong>Message:</strong><br/>${message}</p>`;
  try {
    await sendEmail({ to: process.env.SUPPORT_EMAIL, replyTo: email, subject, html });
    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Contact error', err);
    res.status(500).json({ error: 'Unable to send message' });
  }
});

app.post('/api/summary', async (req, res) => {
  const { email, summary, consent } = req.body;
  if (hasBotField(req)) return res.status(400).json({ error: 'Bot submission detected' });
  if (!email || !consent || !summary) return res.status(400).json({ error: 'Missing email, consent, or summary' });
  try {
    await sendEmail({
      to: email,
      subject: 'Your My Irish Tax calculator summary',
      html: `<p>Here is your requested summary:</p><p>${summary}</p><p>You can unsubscribe anytime by replying STOP.</p>`
    });
    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Summary email error', err);
    res.status(500).json({ error: 'Unable to send summary' });
  }
});

app.post('/api/onboarding', async (req, res) => {
  const { email, filingType } = req.body;
  if (hasBotField(req)) return res.status(400).json({ error: 'Bot submission detected' });
  if (!email) return res.status(400).json({ error: 'Email is required' });
  try {
    const onboarding = await startOnboarding({ email, filingType });
    await scheduleReminder({ email, type: 'onboarding', delayHours: 24 });
    res.json({ status: 'ok', onboarding });
  } catch (err) {
    console.error('Onboarding error', err);
    res.status(500).json({ error: 'Unable to start onboarding' });
  }
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file attached' });
  if (hasBotField(req)) return res.status(400).json({ error: 'Bot submission detected' });
  try {
    const { storedAt } = await uploadDocument({
      filename: req.file.originalname,
      path: req.file.path,
      mimetype: req.file.mimetype
    });
    res.json({ status: 'ok', storedAt });
  } catch (err) {
    console.error('Upload error', err);
    res.status(500).json({ error: 'Unable to upload file' });
  }
});

app.post('/api/reminders', async (req, res) => {
  const { email, type, delayHours } = req.body;
  if (hasBotField(req)) return res.status(400).json({ error: 'Bot submission detected' });
  if (!email || !type) return res.status(400).json({ error: 'Missing email or type' });
  try {
    await scheduleReminder({ email, type, delayHours });
    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Reminder error', err);
    res.status(500).json({ error: 'Unable to schedule reminder' });
  }
});

app.post('/api/upsell', async (req, res) => {
  const { email, service } = req.body;
  if (hasBotField(req)) return res.status(400).json({ error: 'Bot submission detected' });
  if (!email || !service) return res.status(400).json({ error: 'Missing email or service' });
  try {
    const result = await createUpsellIntent({ email, service });
    res.json({ status: 'ok', result });
  } catch (err) {
    console.error('Upsell error', err);
    res.status(500).json({ error: 'Unable to queue upsell' });
  }
});

app.get('/api/tax/config', async (_req, res) => {
  try {
    const years = await listAvailableTaxYears();
    res.json({ years });
  } catch (err) {
    res.status(500).json({ error: 'Unable to load tax configs', detail: err.message });
  }
});

app.get('/api/tax/config/:year', async (req, res) => {
  try {
    const config = await loadTaxYearConfig(req.params.year);
    res.json({
      metadata: config.metadata,
      income_tax: config.income_tax,
      usc: config.usc,
      prsi: config.prsi,
      bik: config.bik
    });
  } catch (err) {
    res.status(404).json({ error: `Config not found for ${req.params.year}`, detail: err.message });
  }
});

app.post('/api/tax/calculate', async (req, res) => {
  try {
    const result = await runTaxPipeline(req.body);
    res.json({ status: 'ok', result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Serve static files when running locally
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.resolve(__dirname, '../../public')));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
