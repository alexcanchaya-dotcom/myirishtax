import nodemailer from 'nodemailer';

const smtpHost = process.env.SMTP_HOST || 'smtp.example.com';
const smtpPort = Number(process.env.SMTP_PORT) || 587;
const smtpUser = process.env.SMTP_USER || 'username';
const smtpPass = process.env.SMTP_PASS || 'password';

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: { user: smtpUser, pass: smtpPass }
});

export async function sendEmail({ to, subject, html, replyTo }) {
  if (!to) throw new Error('Destination email missing');
  return transporter.sendMail({
    from: process.env.FROM_EMAIL || 'no-reply@myirishtax.com',
    to,
    replyTo,
    subject,
    html
  });
}
