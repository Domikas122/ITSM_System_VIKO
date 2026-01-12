import nodemailer from "nodemailer";

// Email configuration - supports Gmail, Outlook, custom SMTP, or dev mode
let transporter: nodemailer.Transporter | null = null;

export function initializeEmailService() {
  // If no email config, email service is disabled
  if (!process.env.EMAIL_SERVICE) {
    console.log("📧 Email service disabled (EMAIL_SERVICE not set)");
    return;
  }

  // Support different email providers
  if (process.env.EMAIL_SERVICE === "gmail") {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // Gmail app password (not regular password)
      },
    });
  } else if (process.env.EMAIL_SERVICE === "outlook") {
    transporter = nodemailer.createTransport({
      service: "outlook",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  } else if (process.env.EMAIL_SERVICE === "custom") {
    // Custom SMTP server
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  } else if (process.env.EMAIL_SERVICE === "dev") {
    // Development mode - logs to console instead of sending
    transporter = {
      sendMail: async (mailOptions: any) => {
        console.log("📧 [DEV MODE] Would send email:");
        console.log(`   To: ${mailOptions.to}`);
        console.log(`   Subject: ${mailOptions.subject}`);
        return { messageId: "dev-mode-" + Date.now() };
      },
    } as any;
  }

  if (transporter) {
    console.log(`✅ Email service initialized (${process.env.EMAIL_SERVICE})`);
  }
}

export async function sendNewIncidentNotification(
  recipientEmail: string,
  incidentId: string,
  title: string,
  category: string,
  severity: string,
  reportedBy: string,
  appUrl: string = "https://incident-pilot.fly.dev"
) {
  if (!transporter) {
    console.log("📧 Email service not configured, skipping notification");
    return;
  }

  const incidentUrl = `${appUrl}/incidents/${incidentId}`;
  const severityColor: Record<string, string> = {
    Kritinis: "#dc2626",
    Aukštas: "#ea580c",
    Vidutinis: "#eab308",
    Žemas: "#16a34a",
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px; }
          .header { background: #1f2937; color: white; padding: 20px; border-radius: 8px 8px 0 0; margin: -20px -20px 20px -20px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .incident-box { background: white; border-left: 4px solid ${severityColor[severity] || "#666"}; padding: 15px; margin: 15px 0; border-radius: 4px; }
          .label { font-weight: bold; color: #666; font-size: 12px; text-transform: uppercase; margin-top: 10px; }
          .value { font-size: 16px; color: #333; margin: 5px 0 10px 0; }
          .severity-badge { display: inline-block; background: ${severityColor[severity] || "#666"}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px; }
          .footer { text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 Naujas Incidentas</h1>
          </div>
          
          <div class="incident-box">
            <div style="display: flex; justify-content: space-between; align-items: start;">
              <div>
                <div class="label">Pavadinimas</div>
                <div class="value">${title}</div>
                
                <div class="label">Kategorija</div>
                <div class="value">${category}</div>
                
                <div class="label">Sunkumas</div>
                <div class="value">
                  <span class="severity-badge">${severity}</span>
                </div>
              </div>
            </div>
            
            <div class="label">Pranešė</div>
            <div class="value">${reportedBy}</div>
            
            <a href="${incidentUrl}" class="button">Peržiūrėti Incidentą</a>
          </div>
          
          <div class="footer">
            <p>Šis incidentas reikalauja jūsų dėmesio. Kuo greičiau jį peržiūrėsite, tuo geriau.</p>
            <p><small>ŽYBIS Incident Pilot System</small></p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER || "noreply@incident-pilot.dev",
      to: recipientEmail,
      subject: `🚨 Naujas Incidentas: ${title}`,
      html: htmlContent,
    });
    console.log(`✅ Email sent to ${recipientEmail}`);
  } catch (error) {
    console.error("❌ Failed to send email:", error);
  }
}

export async function sendIncidentAssignedNotification(
  recipientEmail: string,
  incidentId: string,
  title: string,
  assignedBy: string,
  appUrl: string = "https://incident-pilot.fly.dev"
) {
  if (!transporter) {
    console.log("📧 Email service not configured, skipping notification");
    return;
  }

  const incidentUrl = `${appUrl}/incidents/${incidentId}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px; }
          .header { background: #1f2937; color: white; padding: 20px; border-radius: 8px 8px 0 0; margin: -20px -20px 20px -20px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .incident-box { background: white; border-left: 4px solid #2563eb; padding: 15px; margin: 15px 0; border-radius: 4px; }
          .label { font-weight: bold; color: #666; font-size: 12px; text-transform: uppercase; margin-top: 10px; }
          .value { font-size: 16px; color: #333; margin: 5px 0 10px 0; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px; }
          .footer { text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Incidentas Jums Priskirtas</h1>
          </div>
          
          <div class="incident-box">
            <div class="label">Pavadinimas</div>
            <div class="value">${title}</div>
            
            <div class="label">Priskirta</div>
            <div class="value">${assignedBy}</div>
            
            <a href="${incidentUrl}" class="button">Atidaryti Incidentą</a>
          </div>
          
          <div class="footer">
            <p>Jums priskirtas naujas incidentas, kurio reikalingas jūsų sprendimas.</p>
            <p><small>ŽYBIS Incident Pilot System</small></p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER || "noreply@incident-pilot.dev",
      to: recipientEmail,
      subject: `📋 Incidentas Jums Priskirtas: ${title}`,
      html: htmlContent,
    });
    console.log(`✅ Email sent to ${recipientEmail}`);
  } catch (error) {
    console.error("❌ Failed to send email:", error);
  }
}
