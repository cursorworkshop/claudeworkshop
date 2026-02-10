# Stripe Payment Setup Guide

## Overview

The reservation system is now integrated with Stripe for processing €500 reservation fees for the Claude Code Engineering Offsite.

## Setup Instructions

### 1. Create a Stripe Account

1. Go to [https://stripe.com](https://stripe.com)
2. Create an account or log in
3. Navigate to the Dashboard

### 2. Get Your API Keys

1. In the Stripe Dashboard, go to **Developers** > **API Keys**
2. Copy your:
   - **Publishable key** (starts with `pk_test_` for test mode)
   - **Secret key** (starts with `sk_test_` for test mode)

### 3. Set Environment Variables

Create a `.env.local` file in your project root with:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

**Important:**

- Never commit your secret key to version control
- Use test keys during development
- Switch to live keys for production

### 4. Test the Integration

1. Start the development server: `npm run dev`
2. Go to `/reserve`
3. Click "Reserve Now - €500"
4. The system will show an error message if keys aren't configured
5. With proper keys, it will create a payment intent

## Features Implemented

### Reserve Page (`/reserve`)

- Hero section with event details
- €500 reservation fee display
- Stripe payment integration
- Trust & security section
- Mobile-responsive design

### Payment Flow

- Stripe payment intent creation
- Secure payment processing
- Error handling for missing configuration
- User-friendly error messages

### Navigation

- Added "Reserve" link to main navigation
- Prominent "Reserve Spot" button in header
- Mobile menu integration

## Current Status

✅ **Completed:**

- Reserve page UI/UX
- Stripe API integration
- Payment intent creation
- Error handling
- Build system compatibility

⚠️ **Next Steps:**

1. Configure Stripe account and add API keys
2. Test payment flow with real Stripe keys
3. Set up webhooks for payment confirmation
4. Add success/failure redirect pages
5. Implement email confirmations

## Payment Flow Architecture

```
User clicks "Reserve Now"
    ↓
Frontend calls /api/create-payment-intent
    ↓
Server creates Stripe PaymentIntent
    ↓
Frontend redirects to Stripe Checkout
    ↓
User completes payment
    ↓
Stripe processes payment
    ↓
(Future: Webhook confirms payment)
    ↓
(Future: Send confirmation email)
```

## Files Created/Modified

### New Files:

- `/src/app/reserve/page.tsx` - Main reservation page
- `/src/app/reserve/layout.tsx` - Page metadata
- `/src/components/StripePayment.tsx` - Payment component
- `/src/app/api/create-payment-intent/route.ts` - Stripe API endpoint

### Modified Files:

- `/src/lib/config.ts` - Added Reserve navigation
- `/src/components/Header.tsx` - Added Reserve button
- `.eslintrc.json` - Disabled problematic import rules

## Security Notes

- Environment variables are properly secured
- No API keys in client-side code
- Payment processing happens server-side
- Stripe handles sensitive payment data
- PCI compliance through Stripe

## Support

For any issues with the Stripe integration:

1. Check the console for error messages
2. Verify environment variables are set
3. Test with Stripe's test card numbers
4. Review Stripe Dashboard for transaction logs
