# MyIrishTax Setup Guide

Complete guide to setting up authentication, database, and payment infrastructure for myIrishtax.com.

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Stripe account (for payments)
- OpenAI API key (optional, for AI assistant)

## 🚀 Quick Start

### 1. Install Dependencies

All required packages are already in `package.json`. Install them:

```bash
npm install
```

### 2. Set Up Database

Initialize Prisma and create the database:

```bash
# Generate Prisma client
npx prisma generate

# Create database tables
npx prisma db push

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

This will create a SQLite database file at `prisma/dev.db`.

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth - IMPORTANT: Generate a secure secret!
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"  # Generate with: openssl rand -base64 32

# Stripe (see Stripe setup section below)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_ID_PREMIUM="price_..."
STRIPE_PRICE_ID_PROFESSIONAL="price_..."

# OpenAI (optional - for AI assistant)
OPENAI_API_KEY="sk-..."
```

### 4. Set Up Stripe

#### Create Products and Prices

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Products** → **Add product**
3. Create two products:

**Premium Plan:**
- Name: "MyIrishTax Premium"
- Description: "Access to all calculators and PDF exports"
- Pricing: Recurring
  - Monthly: €9.99/month
  - Yearly: €79/year (recommended)
- Copy the Price ID (starts with `price_`) to `STRIPE_PRICE_ID_PREMIUM`

**Professional Plan:**
- Name: "MyIrishTax Professional"
- Description: "Premium plus AI assistant and advanced features"
- Pricing: Recurring
  - Monthly: €24.99/month
  - Yearly: €199/year (recommended)
- Copy the Price ID (starts with `price_`) to `STRIPE_PRICE_ID_PROFESSIONAL`

#### Get API Keys

1. Go to **Developers** → **API keys**
2. Copy **Publishable key** (starts with `pk_test_`) to `STRIPE_PUBLISHABLE_KEY`
3. Reveal and copy **Secret key** (starts with `sk_test_`) to `STRIPE_SECRET_KEY`

#### Set Up Webhooks

1. Go to **Developers** → **Webhooks** → **Add endpoint**
2. Endpoint URL: `https://your-domain.com/api/stripe/webhook`
   - For local testing: Use [Stripe CLI](https://stripe.com/docs/stripe-cli) or [ngrok](https://ngrok.com/)
3. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copy the **Signing secret** (starts with `whsec_`) to `STRIPE_WEBHOOK_SECRET`

#### Local Webhook Testing

Install Stripe CLI and forward webhooks:

```bash
# Install Stripe CLI (macOS)
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

This will give you a webhook signing secret for local testing.

### 5. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000`

## 📊 Database Schema

The application uses the following tables:

- **User**: User accounts with subscription information
- **Account**: NextAuth provider accounts
- **Session**: User sessions
- **VerificationToken**: Email verification tokens
- **SavedCalculation**: Saved tax calculations (Premium/Professional only)

## 🔐 Authentication Flow

1. **Sign Up**: `/auth/signup` - Creates user account
2. **Login**: `/auth/login` - Authenticates user
3. **Session**: JWT-based sessions managed by NextAuth
4. **Protected Routes**: Use `getServerSession(authOptions)` to protect API routes

## 💳 Payment Flow

### Subscription Creation

1. User clicks "Upgrade" → Redirected to `/dashboard/subscription`
2. User selects plan → POST to `/api/stripe/checkout`
3. Creates Stripe Checkout session → Redirects to Stripe
4. User completes payment
5. Webhook receives `checkout.session.completed`
6. Database updated with subscription details

### Subscription Management

1. User clicks "Manage Subscription" → POST to `/api/stripe/portal`
2. Creates Stripe Customer Portal session
3. User can update payment method, cancel, etc.

## 🎨 Feature Gating

Use the `FeatureGate` component to lock features behind paywalls:

```tsx
import { FeatureGate } from '@/components/paywall/FeatureGate';

<FeatureGate feature="exportPDF">
  <button onClick={exportPDF}>Export PDF</button>
</FeatureGate>
```

Available features:
- `exportPDF` - Premium+
- `saveCalculations` - Premium+
- `redundancy` - Premium+
- `rental` - Premium+
- `contractor` - Premium+
- `aiAssistant` - Professional only
- `uploadCSV` - Professional only
- `fullReturn` - Professional only
- `allYears` - Premium+

## 🔧 Subscription Tiers

### FREE
- Basic PAYE calculator
- Current year only
- View results on screen

### PREMIUM (€9.99/month or €79/year)
- All tax years (2023-2026)
- Redundancy calculator
- Rental income calculator
- Contractor calculator
- PDF exports
- Save up to 10 calculations
- Email support

### PROFESSIONAL (€24.99/month or €199/year)
- Everything in Premium
- AI tax assistant
- CSV transaction imports
- Full tax return computation
- Unlimited saved calculations
- Priority support

## 🧪 Testing

### Test Accounts

Create a test user:

```bash
# Start the dev server
npm run dev

# Go to http://localhost:3000/auth/signup
# Create an account with any email/password
```

### Test Stripe Payments

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires authentication: `4000 0025 0000 3155`

Any future expiry date, any 3-digit CVC.

### Test Webhooks

With Stripe CLI running:

```bash
# Trigger test checkout completion
stripe trigger checkout.session.completed
```

## 🚀 Deployment

### Environment Variables

Set all environment variables in your hosting platform:

- **Vercel**: Project Settings → Environment Variables
- **Railway**: Project → Variables
- **Heroku**: Settings → Config Vars

### Database

For production, migrate from SQLite to PostgreSQL:

1. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Update `DATABASE_URL` in `.env`:
```
DATABASE_URL="postgresql://user:password@host:5432/dbname"
```

3. Run migrations:
```bash
npx prisma db push
```

### Stripe

1. Switch to live mode in Stripe Dashboard
2. Create production products and prices
3. Update environment variables with live keys (`pk_live_` and `sk_live_`)
4. Update webhook endpoint to production URL
5. Update `NEXTAUTH_URL` to production domain

### Security Checklist

- ✅ Generate strong `NEXTAUTH_SECRET` (32+ characters)
- ✅ Use environment variables for all secrets
- ✅ Enable Stripe webhook signature verification
- ✅ Use HTTPS in production
- ✅ Set up proper CORS policies
- ✅ Enable rate limiting on API routes
- ✅ Regular database backups

## 📱 AI Assistant Setup (Optional)

To enable the AI tax assistant (Professional tier only):

1. Get OpenAI API key from [platform.openai.com](https://platform.openai.com/api-keys)
2. Add to `.env`:
```env
OPENAI_API_KEY="sk-..."
```

3. The AI assistant is automatically available to Professional subscribers

## 🐛 Troubleshooting

### "Prisma Client not found"
```bash
npx prisma generate
```

### "Invalid Stripe webhook signature"
- Check `STRIPE_WEBHOOK_SECRET` matches webhook endpoint
- For local testing, use Stripe CLI forwarding

### "Database doesn't exist"
```bash
npx prisma db push
```

### "Session not found"
- Check `NEXTAUTH_SECRET` is set
- Clear browser cookies and re-login

## 📞 Support

- Documentation: `/docs`
- Issues: Create GitHub issue
- Email: support@myirishtax.com

## 🎯 Next Steps

1. ✅ Set up database and run migrations
2. ✅ Configure Stripe products and webhooks
3. ✅ Test signup and login flow
4. ✅ Test payment flow with test cards
5. ✅ Verify webhook events are received
6. 🚀 Deploy to production
7. 📈 Set up analytics (Google Analytics, Plausible, etc.)
8. 📧 Configure email service for transactional emails
9. 🎨 Customize branding and content
10. 📣 Launch marketing campaign

## 📊 Revenue Tracking

Monitor your revenue in:
- Stripe Dashboard → Payments
- Stripe Dashboard → Subscriptions
- Build custom analytics with Stripe API

Track key metrics:
- Monthly Recurring Revenue (MRR)
- Customer Lifetime Value (LTV)
- Churn rate
- Conversion rate (free → paid)

Good luck with your launch! 🚀
