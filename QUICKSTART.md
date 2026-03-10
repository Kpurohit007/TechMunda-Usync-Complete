# USYNC INVESTOR AGENT v2 — QUICK START
## n8n Cloud + VAPI (Free) + Gmail
## Trial call → +917976701222 first, then all investors

---

## WHAT YOU HAVE
- `usync-agent-v2.jsx`       → The React dashboard
- `usync-n8n-workflow.json`  → Import into n8n in 1 click
- This guide

---

## STEP 1: VAPI.AI (Free AI Calling — 10 mins)

1. Go to https://vapi.ai → Sign up FREE
2. You get **$10 free credits** (~50 calls, ~3 min each)
3. Go to **Phone Numbers** → Buy a number (or use web call for testing)
   - Copy the **Phone Number ID**
4. Go to **API Keys** → Copy your API key
5. Paste into the n8n workflow (Step 3)

Voice recommendation: Use "Neha" or "Rachel" for Indian English calls.

---

## STEP 2: N8N CLOUD SETUP (5 mins)

1. Go to https://n8n.io → Sign up FREE
   - Free plan: 5 active workflows, unlimited executions
2. Click **"+ New workflow"** → **"Import from file"**
3. Upload `usync-n8n-workflow.json`
4. You'll see 4 webhooks appear:
   ```
   POST /usync-send-email    → Gmail node
   POST /usync-ai-call       → VAPI HTTP node  
   POST /usync-followup      → Gmail node
   POST /usync-status        → Status check
   ```
5. Click each webhook node → copy the **Production URL**
   Example: `https://YOUR-NAME.app.n8n.cloud/webhook/usync-send-email`

---

## STEP 3: CONNECT GMAIL IN N8N (3 mins)

1. Click the **"Gmail: Send Investor Email"** node
2. Under Credentials → click **"Create New"**
3. Click **"Connect with Google"**
4. Sign in with **techmunda21@gmail.com**
5. Allow Gmail permissions
6. Click Save → do same for "Gmail: Send Follow-up" node

---

## STEP 4: ADD VAPI API KEY (2 mins)

In the **"VAPI: Start AI Call"** HTTP Request node:
1. Click the Headers section
2. Find: `Authorization: Bearer YOUR_VAPI_API_KEY_HERE`
3. Replace with your actual key: `Authorization: Bearer va-xxxxxxxxxxxx`
4. Find: `"phoneNumberId": "YOUR_VAPI_PHONE_NUMBER_ID"`
5. Replace with your VAPI phone number ID

---

## STEP 5: UPDATE DASHBOARD CONFIG (2 mins)

In `usync-agent-v2.jsx`, update the CONFIG at the top:

```js
const CONFIG = {
  N8N_WEBHOOK_EMAIL:    "https://YOUR-NAME.app.n8n.cloud/webhook/usync-send-email",
  N8N_WEBHOOK_CALL:     "https://YOUR-NAME.app.n8n.cloud/webhook/usync-ai-call",
  N8N_WEBHOOK_FOLLOWUP: "https://YOUR-NAME.app.n8n.cloud/webhook/usync-followup",
  N8N_WEBHOOK_STATUS:   "https://YOUR-NAME.app.n8n.cloud/webhook/usync-status",
  TRIAL_PHONE:          "+917976701222",   // ✓ Your number — already set
  CALENDLY:             "https://calendly.com/techmunda21/YOUR-LINK",
  FROM_EMAIL:           "techmunda21@gmail.com",  // ✓ Already set
};
```

---

## STEP 6: ACTIVATE WORKFLOWS IN N8N

1. Go to each workflow in n8n
2. Toggle the **Active** switch (top right) to ON
3. Webhooks are now live ✓

---

## HOW THE TRIAL CALL WORKS

```
You click "🧪 TRIAL CALL FIRST"
        ↓
Dashboard → POST to n8n /usync-ai-call
        ↓
n8n → POST to VAPI API with phone: +917976701222
        ↓
VAPI calls YOUR number (+917976701222)
        ↓
You pick up → AI introduces itself as Usync assistant
        ↓
AI reads the full Usync pitch (with your metrics)
        ↓
You hear exactly what investors will hear
        ↓
If good → toggle off TRIAL MODE → click CALL ALL INVESTORS
        ↓
AI calls all 15 investors, 15 seconds apart
        ↓
Dashboard tracks: Calling → Picked Up → Call Done
```

---

## VAPI CALL SCRIPT (what AI says)

```
"Hi, this is an AI assistant calling on behalf of the Usync team.

I'm reaching out because we believe Usync aligns strongly 
with your investment thesis.

Usync is building India's largest Gen Z builder community 
— where execution is the culture, not just the pitch.

In just 6 weeks, we've grown to 1,240 community members, 
with 18% week-over-week growth and 24% weekly active users.

We're opening a small pre-seed round between $100K and $500K 
to fuel our Build with Bharat campus movement.

Would you be open to a 15-minute call with our founder? 
I can share our deck immediately after this call.

Thank you for your time."
```

---

## FREE PLAN LIMITS

| Service | Free Tier |
|---|---|
| VAPI | $10 credits (~50 calls) |
| n8n Cloud | 5 workflows, unlimited runs |
| Gmail | 500 emails/day |

You have 15 investors → all free.

---

## TROUBLESHOOTING

**n8n webhook not responding?**
→ Make sure workflow is set to ACTIVE in n8n

**VAPI call not connecting?**
→ Check API key is correct, phone number has +91 country code

**Gmail not sending?**
→ Re-authenticate Gmail credential in n8n, check spam folder

**Dashboard shows "N8N OFFLINE"?**
→ Click CONNECT button, or check webhook URLs are correct

---

Build with Bharat 🔥
usync.build | techmunda21@gmail.com
