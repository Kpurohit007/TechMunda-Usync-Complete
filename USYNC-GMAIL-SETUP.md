# USYNC — Gmail API Backend Setup
## For real email sending from techmunda21@gmail.com

---

## OPTION A: Run locally (free, 5 min setup)

### 1. Create project folder
```bash
mkdir usync-mailer && cd usync-mailer
npm init -y
npm install express nodemailer googleapis cors dotenv
```

### 2. Create `.env` file
```
GMAIL_CLIENT_ID=your_client_id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your_client_secret
GMAIL_REFRESH_TOKEN=your_refresh_token
PORT=3001
```

### 3. Create `server.js`
```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');

const app = express();
app.use(cors());
app.use(express.json());

const OAuth2 = google.auth.OAuth2;

async function createTransporter() {
  const oauth2Client = new OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
  );
  oauth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
  const { token } = await oauth2Client.getAccessToken();
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: 'techmunda21@gmail.com',
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      accessToken: token,
    },
  });
}

// SEND EMAIL ENDPOINT
app.post('/send', async (req, res) => {
  const { to, subject, body, invId } = req.body;
  try {
    const transporter = await createTransporter();
    // Inject open-tracking pixel
    const trackingPixel = `<img src="https://your-server.com/track/open/${invId}" width="1" height="1" style="display:none"/>`;
    await transporter.sendMail({
      from: '"Usync Founder" <techmunda21@gmail.com>',
      to,
      subject,
      text: body,
      html: body.replace(/\n/g,'<br>') + trackingPixel,
    });
    res.json({ success: true });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// OPEN TRACKING ENDPOINT
const opened = {};
app.get('/track/open/:invId', (req, res) => {
  const { invId } = req.params;
  opened[invId] = new Date().toISOString();
  console.log(`📬 OPENED: ${invId} at ${opened[invId]}`);
  // Return 1x1 transparent pixel
  const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7','base64');
  res.set('Content-Type','image/gif');
  res.send(pixel);
});

// GET OPEN STATUS
app.get('/opens', (req, res) => res.json(opened));

app.listen(process.env.PORT, () => {
  console.log(`🚀 Usync mailer running on port ${process.env.PORT}`);
});
```

### 4. Run it
```bash
node server.js
```

---

## OPTION B: Deploy free on Railway (always-on, 10 min)

1. Push code to GitHub
2. Go to railway.app → New Project → Deploy from GitHub
3. Add environment variables from your `.env`
4. Get your URL (e.g. `https://usync-mailer.railway.app`)
5. Update the tracking pixel URL in server.js

---

## CONNECTING THE DASHBOARD

In the dashboard React app, update the `doSend` function:

```javascript
const doSend = async () => {
  setSending(true);
  const res = await fetch('http://localhost:3001/send', {  // or Railway URL
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      to: inv.email, 
      subject, 
      body,
      invId: inv.id 
    })
  });
  const data = await res.json();
  if(data.success) {
    setSending(false); setDone(true);
    onSend(inv.id, isFollowUp);
  }
};
```

---

## AUTO FOLLOW-UP (3-day rule)

Add this cron to `server.js`:

```javascript
const cron = require('node-cron');
// Runs every day at 9am IST
cron.schedule('30 3 * * *', async () => {
  // Fetch investors who haven't replied in 3 days
  // Send follow-up emails
  console.log('Checking follow-ups...');
});
```

```bash
npm install node-cron
```

---

## CALENDLY INTEGRATION

Replace the calendly link in each email with:
`https://calendly.com/usync/investor-chat`

In Calendly settings → Notifications → add webhook to log when meetings are booked.

---

## GMAIL RATE LIMITS

- Free Gmail: 500 emails/day (more than enough for 15 investors)
- Google Workspace: 2,000 emails/day
- Add 2-3 second delay between batch sends (already done in dashboard)

---

*Built for Usync pre-seed raise | techmunda21@gmail.com*
