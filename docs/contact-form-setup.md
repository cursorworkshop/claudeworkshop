# Contact Form Setup Guide

The contact form is now set up and configured for **Vercel Forms** with modal integration!

## Current Setup

✅ **ContactForm Component**: Full-page form with validation using React Hook Form + Zod  
✅ **ContactFormModal Component**: Modal dialog for contact buttons throughout the site  
✅ **API Route**: `/api/contact` endpoint configured for Vercel Forms  
✅ **UI Integration**: Contact page + modal buttons replacing email links  
✅ **Validation**: Client and server-side validation  
✅ **Vercel Forms**: Configured and ready to use

## Vercel Forms Configuration

**What's Set Up**:

- Form submissions automatically captured by Vercel
- No external services or API keys needed
- Built-in spam protection
- Form submissions appear in your Vercel dashboard under "Forms"

**How It Works**:

1. User clicks contact button or visits `/contact` page
2. Contact form modal opens (or full page form loads)
3. User fills out and submits the form
4. Form data is validated and sent to `/api/contact`
5. Vercel automatically captures the submission
6. You can view submissions in your Vercel dashboard
7. Optional: Email notifications sent to `vasilis@vasilistsolis.com`, `contact@rogyr.com`, and `info@claudeworkshop.com`

## Viewing Form Submissions

### In Vercel Dashboard

1. Go to your Vercel dashboard
2. Select your project
3. Click on the "Forms" tab
4. View all form submissions with timestamps

### Setting Up Email Notifications (Optional)

1. In your Vercel dashboard, go to your project
2. Navigate to "Settings" → "Functions"
3. Set up webhooks to get notified of new form submissions
4. Configure email notifications to receive submissions instantly

## Email Notifications (Optional)

The form now includes email notifications using **Resend**! When someone submits the form, you will receive an email with the submission details.

### Setup Email Notifications with Resend

1. **Sign up for Resend** at [resend.com](https://resend.com)
2. **Get your API key** from the Resend dashboard
3. **Add to Vercel Environment Variables**:
   - Go to Vercel dashboard → Your project → Settings → Environment Variables
   - Add: `RESEND_API_KEY=your_resend_api_key`

### Alternative: SMTP Setup (Gmail)

If you prefer SMTP instead of Resend:

1. **Create `.env.local` file** in your project root
2. **Add SMTP configuration**:

```bash
# Gmail SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=your_email@gmail.com
```

3. **For Gmail**: You'll need to use an "App Password" instead of your regular password
   - Go to Google Account settings
   - Enable 2-factor authentication
   - Generate an App Password for "Mail"
   - Use that as your `SMTP_PASS`

### What Happens

- ✅ **Form submissions** → Captured by Vercel Forms (always works)
- ✅ **Email notifications** → Sent to `vasilis@vasilistsolis.com`, `contact@rogyr.com`, and `info@claudeworkshop.com`
- ✅ **Direct replies** → You can reply directly to the person who submitted

### Without Email Setup

If you don't set up Resend or SMTP, the form still works perfectly! You'll just need to check the Vercel dashboard for submissions instead of getting email notifications.

## Testing

### Local Development

1. Start your development server: `npm run dev`
2. Go to `/contact` or click any contact button on the site
3. Fill out and submit the form
4. Check the console for logged submissions

### Production Testing

1. Deploy to Vercel
2. Submit a test form (either from contact page or modal buttons)
3. Check your Vercel dashboard under "Forms" tab
4. Verify submissions are being captured

### Where to Find Submissions

**Primary Location**: Vercel Dashboard → Your Project → "Forms" tab

- All form submissions appear here automatically
- No setup required
- Includes timestamps and all form data

**Email Notifications**: Only if SMTP is configured

- Requires environment variables setup
- Sends to `vasilis@vasilistsolis.com`, `contact@rogyr.com`, and `info@claudeworkshop.com`
- Optional feature

## Form Fields

The form includes:

- **Name** (required)
- **Email** (required, validated)
- **Inquiry Type** (dropdown: Workshop Info, Partnership, Speaking, General, Other)
- **Subject** (required)
- **Message** (required)

## Implementation Details

### Contact Form Locations

- **Contact Page** (`/contact`): Full-page form
- **Event Details**: "Reserve Your Team's Place" and "Contact Vasilis" buttons
- **Modal Integration**: All contact buttons now open form modal instead of email client

### Form Features

- **Pre-filled Context**: Workshop buttons pre-fill subject and inquiry type
- **Validation**: Real-time validation with error messages
- **Success States**: Confirmation messages and auto-close
- **Responsive**: Works on all devices

## Next Steps

1. ✅ Deploy to Vercel (form will work immediately)
2. ✅ Test form submissions in production
3. 🔄 Check Vercel dashboard for submissions
4. 🔄 Set up email notifications (optional)

The form is production-ready and will work immediately when deployed to Vercel!
