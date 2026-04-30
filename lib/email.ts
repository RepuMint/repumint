import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY!);
  return _resend;
}

// ─── Review request email ─────────────────────────────────────────────────────

export async function sendReviewRequestEmail({
  to,
  businessName,
  logoUrl,
  requestUrl,
  subject,
  customMessage,
}: {
  to: string;
  businessName: string;
  logoUrl?: string | null;
  requestUrl: string;
  subject?: string | null;
  customMessage?: string | null;
}) {
  const resend = getResend();
  const emailSubject = subject ?? `How was your experience at ${businessName}?`;
  const body = customMessage ?? `Thanks for visiting ${businessName}! We'd love to hear how your experience was.`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F4F6FA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F6FA;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;background:#FFFFFF;border-radius:16px;overflow:hidden;border:1px solid rgba(11,27,62,0.08);">
        <!-- Header -->
        <tr><td style="padding:32px 36px 24px;border-bottom:1px solid rgba(11,27,62,0.06);">
          ${logoUrl
            ? `<img src="${logoUrl}" alt="${businessName}" style="height:40px;width:auto;max-width:180px;object-fit:contain;">`
            : `<p style="margin:0;font-size:20px;font-weight:700;color:#0B1B3E;">${businessName}</p>`
          }
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:32px 36px;">
          <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#0B1B3E;letter-spacing:-0.5px;">${emailSubject}</h1>
          <p style="margin:0 0 28px;font-size:15px;color:#4A5568;line-height:1.65;">${body}</p>
          <a href="${requestUrl}" style="display:inline-block;background:#A8FF3E;color:#080f22;font-size:15px;font-weight:700;padding:14px 28px;border-radius:10px;text-decoration:none;">
            Share your feedback →
          </a>
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:20px 36px;border-top:1px solid rgba(11,27,62,0.06);">
          <p style="margin:0;font-size:12px;color:#8892A4;">
            You received this because you recently visited ${businessName}.<br>
            <span style="color:#C4CAD4;">Powered by RepuMint</span>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const result = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "noreply@repumint.com",
    to,
    subject: emailSubject,
    html,
  });

  return result;
}

// ─── Owner notification email ─────────────────────────────────────────────────

export async function sendOwnerNotification({
  ownerEmail,
  businessName,
  contactName,
  contactPhone,
  contactEmail,
  rating,
  feedbackBody,
  feedbackId,
  appUrl,
}: {
  ownerEmail: string;
  businessName: string;
  contactName?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  rating?: number | null;
  feedbackBody?: string | null;
  feedbackId: string;
  appUrl: string;
}) {
  const resend = getResend();
  const stars = rating ? "★".repeat(rating) + "☆".repeat(5 - rating) : null;
  const feedbackUrl = `${appUrl}/feedback`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#F4F6FA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F6FA;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;background:#FFFFFF;border-radius:16px;overflow:hidden;border:1px solid rgba(11,27,62,0.08);">
        <!-- Alert header -->
        <tr><td style="padding:24px 32px;background:rgba(245,158,11,0.08);border-bottom:1px solid rgba(245,158,11,0.2);">
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#F59E0B;">Private feedback received</p>
          <p style="margin:0;font-size:18px;font-weight:700;color:#0B1B3E;">${businessName}</p>
        </td></tr>
        <!-- Content -->
        <tr><td style="padding:28px 32px;">
          ${stars ? `<p style="margin:0 0 16px;font-size:20px;color:#F59E0B;">${stars}</p>` : ""}
          ${feedbackBody ? `
          <div style="padding:16px;background:#F4F6FA;border-radius:8px;border-left:3px solid #F59E0B;margin-bottom:20px;">
            <p style="margin:0;font-size:14px;color:#4A5568;line-height:1.7;">"${feedbackBody}"</p>
          </div>` : ""}
          <table style="width:100%;margin-bottom:24px;">
            ${contactName ? `<tr><td style="font-size:12px;color:#8892A4;padding:4px 0;width:80px;">Name</td><td style="font-size:13px;color:#0B1B3E;font-weight:600;">${contactName}</td></tr>` : ""}
            ${contactPhone ? `<tr><td style="font-size:12px;color:#8892A4;padding:4px 0;">Phone</td><td style="font-size:13px;color:#0B1B3E;"><a href="tel:${contactPhone}" style="color:#45A29E;">${contactPhone}</a></td></tr>` : ""}
            ${contactEmail ? `<tr><td style="font-size:12px;color:#8892A4;padding:4px 0;">Email</td><td style="font-size:13px;color:#0B1B3E;"><a href="mailto:${contactEmail}" style="color:#45A29E;">${contactEmail}</a></td></tr>` : ""}
          </table>
          <a href="${feedbackUrl}" style="display:inline-block;background:#A8FF3E;color:#080f22;font-size:14px;font-weight:700;padding:12px 24px;border-radius:8px;text-decoration:none;">
            View in RepuMint →
          </a>
        </td></tr>
        <tr><td style="padding:16px 32px;border-top:1px solid rgba(11,27,62,0.06);">
          <p style="margin:0;font-size:12px;color:#8892A4;">
            This feedback was kept private — it did not appear on Google, Yelp, or any public platform.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "noreply@repumint.com",
    to: ownerEmail,
    subject: `New private feedback — ${businessName}`,
    html,
  });
}
