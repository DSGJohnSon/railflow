import { Resend } from "resend";

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "Railflow <delivered@resend.dev>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not set");
  }
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendInvitationEmail({
  to,
  inviterName,
  organizationName,
  token,
}: {
  to: string;
  inviterName: string;
  organizationName: string;
  token: string;
}) {
  const invitationUrl = `${APP_URL}/invitations/${token}`;

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Invitation Railflow</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f0;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #e8e8e4;">
              <span style="font-size:22px;font-weight:800;color:#1a1a1a;letter-spacing:-0.5px;">Railflow</span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;">
              <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#1a1a1a;">
                Vous avez été invité(e) !
              </h1>
              <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6;">
                <strong>${inviterName}</strong> vous invite à rejoindre l'organisation
                <strong>${organizationName}</strong> sur Railflow.
              </p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <a href="${invitationUrl}"
                       style="display:inline-block;padding:13px 28px;background:#1a1a1a;color:#fff;text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;">
                      Rejoindre l'organisation
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0;font-size:13px;color:#999;line-height:1.5;">
                Ce lien est à usage unique. Si vous ne vous attendiez pas à recevoir cette invitation, ignorez cet email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;background:#f9f9f7;border-top:1px solid #e8e8e4;">
              <p style="margin:0;font-size:12px;color:#aaa;">
                Railflow — Gestion de projets ferroviaires
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const { error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: `${inviterName} vous invite à rejoindre ${organizationName} sur Railflow`,
    html,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
}
