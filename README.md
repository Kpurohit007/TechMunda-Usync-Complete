# TECHMUNDA BY USYNC — Complete File Package

**Founder:** Keshav Purohit  
**Co-Founder:** Dhananjay Pathak  
**Contact:** techmunda21@gmail.com | +917976701222 | techmunda.in

---

## FILES IN THIS PACKAGE

### LATEST (USE THESE)
| File | What it is |
|------|-----------|
| `techmunda-agent-v4.jsx` | **Main dashboard** — PDF/XLSX/CSV import, AI calling, Gmail outreach, lead scoring, results |
| `techmunda-server.js` | **Offline Node.js server** — SQLite DB, Gmail SMTP, VAPI AI calls, REST API |

### CALLING AGENTS
| File | What it is |
|------|-----------|
| `usync-calling-agent.jsx` | Usync standalone AI calling UI |

### INVESTOR AGENTS (Usync fundraising)
| File | What it is |
|------|-----------|
| `usync-agent-v3.jsx` | Investor CRM v3 — manual/paste/CSV add contacts |
| `usync-agent-v2.jsx` | Investor CRM v2 — n8n + VAPI integrated |
| `usync-investor-agent.jsx` | Investor CRM v1 — email + call scripts |
| `usync-investor-dashboard.jsx` | Investor pipeline dashboard |
| `usync-dashboard.jsx` | Full dashboard with Gmail backend |

### BACKEND
| File | What it is |
|------|-----------|
| `server.js` | Original Node.js backend (Gmail OAuth2 + tracking) |
| `usync-n8n-workflow.json` | Import into n8n Cloud for email + VAPI automation |

### DOCS
| File | What it is |
|------|-----------|
| `QUICKSTART.md` | 6-step setup guide for n8n + VAPI |
| `SETUP.md` | Full backend setup instructions |
| `USYNC-GMAIL-SETUP.md` | Gmail OAuth2 setup guide |

---

## QUICK START — TECHMUNDA SERVER

```bash
# 1. Install dependencies
npm install express cors multer xlsx pdf-parse nodemailer node-cron better-sqlite3 dotenv

# 2. Create .env file
echo "GMAIL_USER=techmunda21@gmail.com" >> .env
echo "GMAIL_PASS=Techmunda@21" >> .env
echo "VAPI_KEY=193c15ac-6159-4229-868a-9e130d096d5d.ai" >> .env
echo "PORT=3001" >> .env

# 3. Run server
node techmunda-server.js

# 4. Open dashboard at http://localhost:3001
```

---

## TECHMUNDA SERVICES COVERED
1. Web Development & Design
2. Mobile App Development
3. AI & Automation Solutions
4. Digital Marketing & SEO
5. Cloud Infrastructure & DevOps
6. Business Process Automation
7. IT Consulting & Strategy
8. E-Commerce Solutions
9. SaaS Product Development
10. Data Analytics & BI Dashboards
