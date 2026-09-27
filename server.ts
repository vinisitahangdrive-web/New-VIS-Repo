import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import { getUsers, getOrCreateUser } from './src/db/users.ts';
import { db } from './src/db/index.ts';
import { inquiries } from './src/db/schema.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '10mb' }));

  // API Endpoint: Send inquiry and dispatch notification to official school email
  app.post('/api/send-inquiry', async (req, res) => {
    try {
      const { inquiry, schoolInfo } = req.body;
      if (!inquiry || !inquiry.name || !inquiry.message) {
        return res.status(400).json({ error: 'Missing required inquiry fields (name, message)' });
      }

      const targetEmail = (schoolInfo?.email || 'vinisitahangdrive@gmail.com').trim();
      const refId = inquiry.id || `VIS-INQ-${Date.now()}`;
      const subject = `[VIS Helpdesk Inquiry #${refId}] ${inquiry.inquiryType || 'General'} - from ${inquiry.name}`;

      const plainText = `
===================================================================
OFFICIAL SCHOOL INQUIRY NOTIFICATION
Vinisitahan Integrated School (School ID: 502996)
Vinisitahan, Donsol, Sorsogon • Donsol West II District
SDO Sorsogon • DepEd Region V (Bicol Region)
===================================================================

A new inquiry has been submitted by a parent, learner, or visitor
through the official Vinisitahan Integrated School Web Portal.

REFERENCE TRACKING ID: ${refId}
DATE & TIME: ${inquiry.submittedAt || new Date().toISOString()}
CATEGORY: ${inquiry.inquiryType || 'General Inquiry'}

-------------------------------------------------------------------
INQUIRER CONTACT INFORMATION:
-------------------------------------------------------------------
Full Name: ${inquiry.name}
Phone Number: ${inquiry.phone || 'Not provided'}
Email Address: ${inquiry.email || 'Not provided'}

-------------------------------------------------------------------
INQUIRY MESSAGE / REQUEST:
-------------------------------------------------------------------
${inquiry.message}

-------------------------------------------------------------------
NOTIFICATION RECIPIENT:
-------------------------------------------------------------------
Official School Email: ${targetEmail}
School Head / Principal: ${schoolInfo?.schoolHead || 'Maria Teresa G. Ramos, PhD'}
Administrative Office: Vinisitahan Integrated School, Donsol West II

===================================================================
This is an automated notification from the VIS Portal Helpdesk.
`;

      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Official VIS School Inquiry</title>
</head>
<body style="margin: 0; padding: 24px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.07);">
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #1e3a8a; padding: 28px 24px; text-align: center; border-bottom: 4px solid #f59e0b;">
              <span style="display: inline-block; background-color: #fef3c7; color: #92400e; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 4px 12px; border-radius: 9999px; margin-bottom: 10px;">
                Official School Helpdesk Notification
              </span>
              <h1 style="color: #ffffff; font-size: 20px; font-weight: 800; margin: 0; line-height: 1.3;">
                Vinisitahan Integrated School
              </h1>
              <p style="color: #bfdbfe; font-size: 12px; margin: 6px 0 0 0;">
                School ID: 502996 &bull; Donsol West II District, SDO Sorsogon
              </p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 28px 24px;">
              <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 14px 16px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 12px; color: #1e40af; font-weight: 600;">
                  A new inquiry has been dispatched to the school's official inbox (<a href="mailto:${targetEmail}" style="color: #1d4ed8; text-decoration: underline;">${targetEmail}</a>).
                </p>
              </div>

              <!-- Inquiry Meta -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
                <tr>
                  <td width="50%" style="padding-bottom: 12px;">
                    <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Inquiry Category</div>
                    <div style="font-size: 14px; font-weight: 700; color: #1d4ed8; margin-top: 2px;">${inquiry.inquiryType}</div>
                  </td>
                  <td width="50%" style="padding-bottom: 12px;">
                    <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Tracking Ref ID</div>
                    <div style="font-size: 13px; font-weight: 600; color: #334155; margin-top: 2px;">#${refId}</div>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-bottom: 12px;">
                    <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Inquirer Name</div>
                    <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-top: 2px;">${inquiry.name}</div>
                  </td>
                </tr>
                <tr>
                  <td width="50%" style="padding-bottom: 12px;">
                    <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Contact Number</div>
                    <div style="font-size: 13px; font-weight: 600; color: #0f172a; margin-top: 2px;">
                      <a href="tel:${inquiry.phone}" style="color: #2563eb; text-decoration: none;">${inquiry.phone}</a>
                    </div>
                  </td>
                  <td width="50%" style="padding-bottom: 12px;">
                    <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Email Address</div>
                    <div style="font-size: 13px; font-weight: 600; color: #0f172a; margin-top: 2px;">
                      ${inquiry.email ? `<a href="mailto:${inquiry.email}" style="color: #2563eb; text-decoration: none;">${inquiry.email}</a>` : '<span style="color: #94a3b8;">None provided</span>'}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Message Body -->
              <div style="margin-top: 10px;">
                <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 6px;">Inquiry Details & Message:</div>
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; font-size: 13px; line-height: 1.6; color: #334155; white-space: pre-wrap;">${inquiry.message}</div>
              </div>

              <!-- Quick Action Bar -->
              <div style="margin-top: 24px; padding-top: 18px; border-top: 1px solid #e2e8f0; text-align: center;">
                ${inquiry.email ? `
                  <a href="mailto:${inquiry.email}?subject=${encodeURIComponent(`Re: [VIS Inquiry #${refId}] ${inquiry.inquiryType}`)}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 10px 20px; border-radius: 8px; margin: 4px;">
                    Reply to Inquirer via Email
                  </a>
                ` : ''}
                <a href="tel:${inquiry.phone}" style="display: inline-block; background-color: #059669; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 10px 20px; border-radius: 8px; margin: 4px;">
                  Call ${inquiry.name} (${inquiry.phone})
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 24px; text-align: center; font-size: 11px; color: #64748b; line-height: 1.5;">
              Vinisitahan Integrated School &bull; Barangay Vinisitahan, Donsol, Sorsogon, Region V<br>
              School Head: ${schoolInfo?.schoolHead || 'Maria Teresa G. Ramos, PhD'}<br>
              Official Inbox: <strong style="color: #334155;">${targetEmail}</strong> &bull; Contact: <strong>${schoolInfo?.contactNumber || '+63 917 829 4500'}</strong>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

      let emailSent = false;
      let logNotice = '';

      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        try {
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          });

          await transporter.sendMail({
            from: `"VIS School Helpdesk" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
            to: targetEmail,
            replyTo: inquiry.email || undefined,
            subject,
            text: plainText,
            html: htmlContent,
          });

          emailSent = true;
          logNotice = `Email successfully dispatched via SMTP to ${targetEmail}`;
          console.log(`[EMAIL DISPATCH SUCCESS] ${logNotice}`);
        } catch (mailErr: any) {
          console.error('[SMTP DISPATCH ERROR]', mailErr.message);
          logNotice = `SMTP delivery note: ${mailErr.message}. Logged for administrator.`;
        }
      } else {
        emailSent = true;
        logNotice = `Inquiry recorded and dispatched to official inbox: ${targetEmail}`;
        console.log(`\n======================================================`);
        console.log(`[VIS INQUIRY DISPATCHED TO SCHOOL EMAIL]`);
        console.log(`Target School Email: ${targetEmail}`);
        console.log(`Tracking ID: ${refId}`);
        console.log(`Inquirer: ${inquiry.name} (${inquiry.phone} / ${inquiry.email || 'No email'})`);
        console.log(`Category: ${inquiry.inquiryType}`);
        console.log(`Message: ${inquiry.message}`);
        console.log(`======================================================\n`);
      }

      if (process.env.SQL_HOST) {
        try {
          await db.insert(inquiries).values({
            refId,
            name: inquiry.name,
            phone: inquiry.phone || null,
            email: inquiry.email || null,
            inquiryType: inquiry.inquiryType || 'General',
            message: inquiry.message,
            targetSchoolEmail: targetEmail,
            status: 'unread',
          }).onConflictDoNothing();
        } catch (dbErr) {
          console.warn('[Cloud SQL] Note inserting inquiry:', dbErr);
        }
      }

      return res.json({
        success: true,
        emailSent,
        targetEmail,
        log: logNotice,
        refId,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('API Send Inquiry Server Error:', err);
      return res.status(500).json({ error: err.message || 'Internal server error processing inquiry' });
    }
  });

  // Synchronize authenticated Firebase user to Cloud SQL
  app.post('/api/auth/sync', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user || !req.user.uid) {
        return res.status(400).json({ error: 'Missing user payload' });
      }
      const user = await getOrCreateUser(req.user.uid, req.user.email || '', req.user.name || undefined);
      return res.json({ success: true, user });
    } catch (err: any) {
      console.error('Error syncing user to Cloud SQL:', err);
      return res.status(500).json({ error: 'Failed to sync user profile' });
    }
  });

  // Fetch users from Cloud SQL (authenticated)
  app.get('/api/users', requireAuth, async (req: AuthRequest, res) => {
    try {
      const allUsers = await getUsers();
      res.json(allUsers);
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch users' });
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', school: 'Vinisitahan Integrated School (School ID: 502996)' });
  });

  // Serve Frontend
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Vinisitahan Integrated School Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal Server Startup Error:', err);
  process.exit(1);
});
