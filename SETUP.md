# USYNC INVESTOR AGENT — SETUP GUIDE
## From zero to sending emails in 20 minutes

---

## WHAT YOU'RE GETTING
- Dashboard (React) → pipeline, investor CRM, email previews
- Backend (Node.js) → Gmail API, open tracking, auto follow-ups
- Sends from: techmunda21@gmail.com

---

## STEP 1: GET GOOGLE API CREDENTIALS (5 min)

1. Go to → https://console.cloud.google.com
2. Create a new project: "usync-investor-agent"
3. Go to "APIs & Services" → "Enable APIs"
4. Enable: **Gmail API**
5. Go to "OAuth consent screen":
   - Type: External
   - App name: Usync Investor Agent
   - Support email: techmunda21@gmail.com
   - Add scope: .../auth/gmail.send
6. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
   - Type: Web Application
   - Authorized redirect URIs: http://localhost:3001/auth/callback
7. Download the JSON — copy Client ID and Client Secret

---

## STEP 2: SETUP BACKEND (5 min)

```bash
# Create project folder
mkdir usync-agent && cd usync-agent

# Copy server.js here, then:
npm init -y
npm install express googleapis node-cron cors dotenv

# Create .env file:
echo 'GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
REDIRECT_URI=http://localhost:3001/auth/callback
FRONTEND_URL=http://localhost:3000
BASE_URL=http://localhost:3001
PORT=3001' > .env

# Start the server
node server.js
```

---

## STEP 3: CONNECT GMAIL (2 min)

1. Open the dashboard (React app)
2. Click **"⊕ CONNECT GMAIL"** button
3. Sign in with techmunda21@gmail.com
4. Allow the permissions
5. Window closes → you'll see "● techmunda21@gmail.com" in green

---

## STEP 4: SETUP REACT DASHBOARD (5 min)

```bash
# In a new terminal
npx create-react-app usync-dashboard
cd usync-dashboard
npm install

# Copy usync-dashboard.jsx to src/App.jsx
# Then:
npm start
```

---

## STEP 5: UPDATE YOUR INFO

In usync-dashboard.jsx, update these at the top:
```js
const BACKEND_URL = "http://localhost:3001";         // your server
const CALENDLY_LINK = "https://calendly.com/YOUR_LINK"; // your Calendly
const FROM_EMAIL = "techmunda21@gmail.com";          // ✓ already set
const FOUNDER_NAME = "Keshav Purohit";              // update this
```

---

## STEP 6: DEPLOY TO THE INTERNET (FREE)

**Backend → Railway.app (free)**
1. Push server.js to GitHub
2. Go to railway.app → New Project → Deploy from GitHub
3. Add environment variables (same as .env)
4. Get your public URL (e.g. https://usync-agent.railway.app)
5. Update GOOGLE_CLIENT_ID redirect URI in Google Console
6. Update BASE_URL in Railway env vars

**Dashboard → Vercel (free)**
1. Push React app to GitHub
2. vercel.com → Import project
3. Done — you get a URL like usync-dashboard.vercel.app

---

## HOW IT WORKS

```
You click "SEND ALL"
       ↓
Dashboard → POST /send-bulk → Gmail API
       ↓
Each email contains a 1x1 tracking pixel:
<img src="https://your-backend.com/track/open/INVESTOR_ID">
       ↓
When investor opens email → pixel loads → backend logs openedAt
       ↓
Dashboard polls /track/all every 30s → updates pipeline live
       ↓
3 days later → follow-up auto-queued → you click SEND or it auto-sends
       ↓
Investor replies → you log it manually → stage moves to "Replied"
       ↓
They book via Calendly link in email → "Call Scheduled"
```

---

## GMAIL SENDING LIMITS

| Account Type | Daily Limit |
|---|---|
| Free Gmail | 500 emails/day |
| Google Workspace | 2,000 emails/day |

You have 15 investors → well within free limits.

---

## QUESTIONS?
Email: techmunda21@gmail.com
Build with Bharat 🔥
