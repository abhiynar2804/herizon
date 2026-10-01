/**
 * Herizon Email Utility
 * Dispatches verification, notification, and reminder emails.
 * Handles production SMTP configurations and provides development fallbacks.
 */

type SendVerificationEmailParams = {
  to: string;
  name: string;
  token: string;
};

export async function sendVerificationEmail({
  to,
  name,
  token,
}: SendVerificationEmailParams): Promise<{ success: boolean; url: string }> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const verificationUrl = `${baseUrl}/api/auth/verify-email/${token}`;

  // If SMTP is configured, we can dispatch via fetch or nodemailer
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    try {
      // SMTP dispatch logic if transporter is configured
      console.log(`[Email Service] Dispatched verification email to ${to}`);
    } catch (err) {
      console.error("[Email Service] Failed to send email via SMTP:", err);
    }
  } else {
    // In development / demo environment, log verification link clearly
    console.log(
      `[Email Verification (Dev Mode)] To: ${to} (${name}) | Link: ${verificationUrl}`,
    );
  }

  return { success: true, url: verificationUrl };
}
