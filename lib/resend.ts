import { Resend } from "resend";

export interface LeadData {
  name: string;
  email: string;
  phone: string;
  moveIn?: string;
  suiteType?: string;
  budget?: string;
  message?: string;
  source: string;
  transcript?: string;
}

export async function sendLeadEmail(lead: LeadData) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: #0A0A0A; padding: 32px; text-align: center; }
    .header h1 { color: #E85B3A; font-size: 28px; margin: 0; letter-spacing: 4px; }
    .header p { color: #9A9A9A; margin: 8px 0 0; font-size: 14px; }
    .body { padding: 32px; }
    .badge { display: inline-block; background: #E85B3A; color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-bottom: 24px; }
    .field { margin-bottom: 16px; border-bottom: 1px solid #f0f0f0; padding-bottom: 16px; }
    .field:last-child { border-bottom: none; }
    .label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999; margin-bottom: 4px; }
    .value { font-size: 16px; color: #111; font-weight: 500; }
    .footer { background: #f9f9f9; padding: 20px 32px; text-align: center; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>PARKER</h1>
      <p>Yonge + Eglinton — New Lead Inquiry</p>
    </div>
    <div class="body">
      <span class="badge">Source: ${lead.source}</span>

      <div class="field">
        <div class="label">Name</div>
        <div class="value">${lead.name}</div>
      </div>
      <div class="field">
        <div class="label">Email</div>
        <div class="value"><a href="mailto:${lead.email}" style="color:#E85B3A;">${lead.email}</a></div>
      </div>
      <div class="field">
        <div class="label">Phone</div>
        <div class="value"><a href="tel:${lead.phone}" style="color:#E85B3A;">${lead.phone}</a></div>
      </div>
      ${lead.moveIn ? `
      <div class="field">
        <div class="label">Move-in Date</div>
        <div class="value">${lead.moveIn}</div>
      </div>` : ""}
      ${lead.suiteType ? `
      <div class="field">
        <div class="label">Suite Type</div>
        <div class="value">${lead.suiteType}</div>
      </div>` : ""}
      ${lead.budget ? `
      <div class="field">
        <div class="label">Budget</div>
        <div class="value">${lead.budget}</div>
      </div>` : ""}
      ${lead.message ? `
      <div class="field">
        <div class="label">Message</div>
        <div class="value">${lead.message}</div>
      </div>` : ""}
    </div>
    <div class="footer">
      Parker at Yonge + Eglinton &nbsp;|&nbsp; Team Nagpal &nbsp;|&nbsp; 200 Redpath Avenue, Toronto
    </div>
  </div>
</body>
</html>
  `;

  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
    to: "garima@teamnagpal.ca",
    subject: `New Parker Lead: ${lead.name}`,
    html,
  });
}
