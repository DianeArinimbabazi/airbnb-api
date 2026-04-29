const BRAND_COLOR = "#FF5A5F";

function baseLayout(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Airbnb</title>
</head>
<body style="margin:0;padding:0;background:#f7f7f7;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f7;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:${BRAND_COLOR};padding:32px 40px;">
              <span style="font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">airbnb</span>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #eeeeee;background:#fafafa;">
              <p style="margin:0;font-size:12px;color:#999999;text-align:center;">
                © ${new Date().getFullYear()} Airbnb, Inc. · All rights reserved
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

function button(text: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;background:${BRAND_COLOR};color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;margin-top:24px;">${text}</a>`;
}

export function welcomeEmail(name: string, role: string): string {
  const roleContent =
    role === "HOST"
      ? `<p style="color:#555555;font-size:16px;line-height:1.6;margin:16px 0 0;">You're registered as a <strong>Host</strong>. Start earning by creating your first listing.</p>
         ${button("Create Your First Listing", `${process.env["APP_URL"] || "http://localhost:3000"}/listings/new`)}`
      : `<p style="color:#555555;font-size:16px;line-height:1.6;margin:16px 0 0;">You're all set as a <strong>Guest</strong>. Discover unique homes around the world.</p>
         ${button("Explore Listings", `${process.env["APP_URL"] || "http://localhost:3000"}/listings`)}`;

  return baseLayout(`
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#222222;">Welcome, ${name}! 🎉</h1>
    <p style="color:#555555;font-size:16px;line-height:1.6;margin:0;">Your account has been created successfully.</p>
    ${roleContent}
  `);
}

export function bookingConfirmationEmail(
  guestName: string,
  listingTitle: string,
  location: string,
  checkIn: string,
  checkOut: string,
  totalPrice: number
): string {
  return baseLayout(`
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#222222;">Booking Confirmed ✓</h1>
    <p style="color:#555555;font-size:16px;line-height:1.6;margin:0 0 24px;">Great news, ${guestName}! Your reservation is confirmed.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;border-radius:8px;padding:24px;border:1px solid #eeeeee;">
      <tr><td style="padding-bottom:12px;">
        <p style="margin:0;font-size:13px;color:#999999;text-transform:uppercase;">Property</p>
        <p style="margin:4px 0 0;font-size:17px;font-weight:700;color:#222222;">${listingTitle}</p>
      </td></tr>
      <tr><td style="padding-bottom:12px;">
        <p style="margin:0;font-size:13px;color:#999999;text-transform:uppercase;">Location</p>
        <p style="margin:4px 0 0;font-size:16px;color:#333333;">📍 ${location}</p>
      </td></tr>
      <tr><td style="padding-bottom:12px;">
        <p style="margin:0;font-size:13px;color:#999999;text-transform:uppercase;">Check-in</p>
        <p style="margin:4px 0 0;font-size:16px;color:#333333;">📅 ${checkIn}</p>
      </td></tr>
      <tr><td style="padding-bottom:12px;">
        <p style="margin:0;font-size:13px;color:#999999;text-transform:uppercase;">Check-out</p>
        <p style="margin:4px 0 0;font-size:16px;color:#333333;">📅 ${checkOut}</p>
      </td></tr>
      <tr><td>
        <p style="margin:0;font-size:13px;color:#999999;text-transform:uppercase;">Total Price</p>
        <p style="margin:4px 0 0;font-size:22px;font-weight:800;color:${BRAND_COLOR};">$${totalPrice.toFixed(2)}</p>
      </td></tr>
    </table>
    <p style="color:#777777;font-size:13px;line-height:1.6;margin:24px 0 0;">
      <strong>Cancellation Policy:</strong> Free cancellation up to 48 hours before check-in.
    </p>
  `);
}

export function bookingCancellationEmail(
  guestName: string,
  listingTitle: string,
  checkIn: string,
  checkOut: string
): string {
  return baseLayout(`
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#222222;">Booking Cancelled</h1>
    <p style="color:#555555;font-size:16px;line-height:1.6;margin:0 0 24px;">Hi ${guestName}, your reservation has been cancelled.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff5f5;border-radius:8px;padding:24px;border:1px solid #ffdede;">
      <tr><td style="padding-bottom:12px;">
        <p style="margin:0;font-size:13px;color:#999999;text-transform:uppercase;">Cancelled Listing</p>
        <p style="margin:4px 0 0;font-size:17px;font-weight:700;color:#222222;">${listingTitle}</p>
      </td></tr>
      <tr><td style="padding-bottom:12px;">
        <p style="margin:0;font-size:13px;color:#999999;text-transform:uppercase;">Check-in</p>
        <p style="margin:4px 0 0;font-size:16px;color:#333333;">${checkIn}</p>
      </td></tr>
      <tr><td>
        <p style="margin:0;font-size:13px;color:#999999;text-transform:uppercase;">Check-out</p>
        <p style="margin:4px 0 0;font-size:16px;color:#333333;">${checkOut}</p>
      </td></tr>
    </table>
    <p style="color:#555555;font-size:16px;line-height:1.6;margin:24px 0 0;">We hope to host you again soon!</p>
    ${button("Find Another Listing", `${process.env["APP_URL"] || "http://localhost:3000"}/listings`)}
  `);
}

export function passwordResetEmail(name: string, resetLink: string): string {
  return baseLayout(`
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#222222;">Reset Your Password</h1>
    <p style="color:#555555;font-size:16px;line-height:1.6;margin:0;">Hi ${name}, we received a request to reset your password.</p>
    <p style="color:#555555;font-size:16px;line-height:1.6;margin:16px 0 0;">This link expires in <strong>1 hour</strong>.</p>
    ${button("Reset Password", resetLink)}
    <p style="color:#999999;font-size:13px;line-height:1.6;margin:32px 0 0;padding-top:24px;border-top:1px solid #eeeeee;">
      If you did not request this, ignore this email.
    </p>
  `);
}