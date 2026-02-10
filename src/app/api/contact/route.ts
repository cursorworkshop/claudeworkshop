import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Contact form submission interface
interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  inquiryType: string;
}

// Vercel Forms Integration with Email Notifications
// Form submissions will appear in your Vercel dashboard under "Forms"
// AND send email notifications to the team
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message, inquiryType }: ContactFormData =
      body;

    // Validate required fields
    if (!name || !email || !subject || !message || !inquiryType) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Log the submission for Vercel Forms
    // Vercel Forms will automatically capture form submissions
    // when deployed to Vercel - no additional setup needed!
    // eslint-disable-next-line no-console
    console.log('Contact form submission:', {
      name,
      email,
      subject,
      message,
      inquiryType,
      timestamp: new Date().toISOString(),
    });

    // Send email notification to the team
    await sendEmailNotification({
      name,
      email,
      subject,
      message,
      inquiryType,
    });

    return NextResponse.json(
      { message: 'Message sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

// Email notification function using Resend
async function sendEmailNotification(data: ContactFormData): Promise<void> {
  // Only send emails when Resend API key is configured
  if (!process.env.RESEND_API_KEY) {
    // eslint-disable-next-line no-console
    console.log('Resend API key not configured, skipping email notification');
    return;
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Helper function to escape HTML and preserve line breaks
    const escapeHtml = (text: string): string => {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    // Convert plain text to HTML with preserved line breaks
    const formatMessage = (text: string): string => {
      const escaped = escapeHtml(text);
      return escaped.replace(/\r\n/g, '<br>').replace(/\n/g, '<br>');
    };

    // Email content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 0;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #14b8a6 0%, #3b82f6 50%, #ec4899 100%); padding: 30px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
              New Contact Form Submission
            </h1>
          </div>
          
          <!-- Contact Details -->
          <div style="padding: 30px 20px; background-color: #f8f9fa; border-bottom: 1px solid #e9ecef;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">
              Contact Details
            </h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 120px;"><strong>Name:</strong></td>
                <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">${escapeHtml(data.name)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;"><strong>Email:</strong></td>
                <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">
                  <a href="mailto:${escapeHtml(data.email)}" style="color: #3b82f6; text-decoration: none;">${escapeHtml(data.email)}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;"><strong>Inquiry Type:</strong></td>
                <td style="padding: 8px 0; color: #1f2937; font-size: 14px; text-transform: capitalize;">${escapeHtml(data.inquiryType)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;"><strong>Subject:</strong></td>
                <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">${escapeHtml(data.subject)}</td>
              </tr>
            </table>
          </div>
          
          <!-- Message -->
          <div style="padding: 30px 20px; background-color: #ffffff;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">
              Message
            </h2>
            <div style="background-color: #f9fafb; padding: 20px; border-left: 4px solid #3b82f6; border-radius: 4px; line-height: 1.8; color: #1f2937; font-size: 15px; white-space: pre-wrap; word-wrap: break-word;">
              ${formatMessage(data.message)}
            </div>
          </div>
          
          <!-- Footer -->
          <div style="padding: 20px; background-color: #f8f9fa; border-top: 1px solid #e9ecef; font-size: 12px; color: #6b7280;">
            <p style="margin: 0 0 8px 0;"><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
            <p style="margin: 0;"><strong>From:</strong> Claude Workshop Contact Form</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email using Resend
    // Use your verified domain - onboarding@resend.dev only works for the account owner
    const result = await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ||
        'Claude Workshop <info@claudeworkshop.com>',
      to: [
        'vasilis@vasilistsolis.com',
        'contact@rogyr.com',
        'info@claudeworkshop.com',
      ],
      subject: `New Contact Form: ${data.subject}`,
      html: htmlContent,
      replyTo: data.email, // Allow direct reply to the person who submitted
    });

    // eslint-disable-next-line no-console
    console.log('Email notification sent successfully via Resend:', result);
  } catch (error) {
    console.error('Failed to send email notification:', error);
    // Don't throw error - we don't want email failures to break the form
  }
}
