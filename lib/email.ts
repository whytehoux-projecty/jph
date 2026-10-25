import { Resend } from 'resend';

// Initialize Resend if API key is provided
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * Whether email can actually be sent. Features that depend on reaching the
 * customer (sign-in codes, password reset) check this first.
 */
export function emailConfigured(): boolean {
  return resend !== null;
}

export async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
  if (!resend) {
    // Email isn't configured. Never log the recipient or body: messages carry
    // credentials and personal data.
    console.warn(`[email] RESEND_API_KEY is not set; "${subject}" was not sent.`);
    return { success: true, mock: true };
  }

  try {
    const data = await resend.emails.send({
      from: 'JPHeritage Bank <noreply@jpheritage.com>', // MUST change to verified domain before production
      to: [to],
      subject,
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error('Email sending failed');
  }
}
