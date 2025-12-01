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

dotenv.config();

const app = express();
const upload = multer({ dest: 'uploads/' });
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health/SSL check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', ssl: process.env.ENABLE_SSL === 'true' });
});

app.post('/api/contact', async (req, res) => {
  const { name, email, phone, service, message, consent } = req.body;
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

app.post('/api/onboarding', async (req, res) => {
  const { email, filingType } = req.body;
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
  if (!email || !service) return res.status(400).json({ error: 'Missing email or service' });
  try {
    const result = await createUpsellIntent({ email, service });
    res.json({ status: 'ok', result });
  } catch (err) {
    console.error('Upsell error', err);
    res.status(500).json({ error: 'Unable to queue upsell' });
  }
});

// Serve static files when running locally
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.resolve(__dirname, '../../public')));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
