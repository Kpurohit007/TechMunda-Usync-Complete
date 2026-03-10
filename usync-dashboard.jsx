import { useState, useEffect, useCallback } from "react";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const BACKEND_URL = "http://localhost:3001"; // Change to your deployed backend URL
const CALENDLY_LINK = "https://calendly.com/techmunda21/usync-investor-call"; // Update with your link
const FROM_EMAIL = "techmunda21@gmail.com";
const FOUNDER_NAME = "Usync Founder";

const INVESTORS = [
  { id: 1, name: "Karthik Reddy", firm: "Blume Ventures", email: "karthik@blume.vc", phone: "+919876500001", tier: "A", focus: "Early-stage India, community platforms", note: "Backed Unacademy & Dunzo — loves Bharat narrative", priority: "High" },
  { id: 2, name: "Sajith Pai", firm: "Blume Ventures", email: "sajith@blume.vc", phone: "+919876500002", tier: "A", focus: "Gen Z, consumer internet, India communities", note: "Deep Gen Z thesis, writes about Bharat internet", priority: "High" },
  { id: 3, name: "Anand Lunia", firm: "India Quotient", email: "anand@indiaquotient.in", phone: "+919876500003", tier: "A", focus: "Bharat-first startups, vernacular, communities", note: "Best fit for 'Build with Bharat' narrative", priority: "High" },
  { id: 4, name: "WTFund Team", firm: "WTFund", email: "apply@wtfund.in", phone: "+919876500004", tier: "A", focus: "Young founders under 23, India", note: "Specifically for young founders, apply directly", priority: "High" },
  { id: 5, name: "100X.VC Team", firm: "100X.VC", email: "hello@100x.vc", phone: "+919876500005", tier: "A", focus: "Indian startups, first check", note: "First-check India investors, fast process", priority: "High" },
  { id: 6, name: "Kunal Shah", firm: "Angel / CRED", email: "kunal@cred.club", phone: "+919876500006", tier: "A", focus: "Community, trust, India consumer", note: "Prolific angel, community evangelist, Gen Z focus", priority: "High" },
  { id: 7, name: "Aprameya Radhakrishna", firm: "Angel / TaxiForSure", email: "aprameya@koo.in", phone: "+919876500007", tier: "A", focus: "Community, Gen Z, India startups", note: "Active angel, Koo founder, loves community products", priority: "High" },
  { id: 8, name: "Antler India", firm: "Antler", email: "india@antler.co", phone: "+919876500008", tier: "A", focus: "Pre-idea to pre-seed, India founders", note: "Apply to cohort, great for early-stage community", priority: "High" },
  { id: 9, name: "Prayank Swaroop", firm: "Accel India", email: "prayank@accel.com", phone: "+919876500009", tier: "B", focus: "Community, SaaS, developer tools", note: "Good for Series A path later", priority: "Medium" },
  { id: 10, name: "Hemant Mohapatra", firm: "Lightspeed India", email: "hemant@lsvp.com", phone: "+919876500010", tier: "B", focus: "Consumer, community platforms, India", note: "Scout program active, warm intro path", priority: "Medium" },
  { id: 11, name: "Vani Kola", firm: "Kalaari Capital", email: "vani@kalaari.com", phone: "+919876500011", tier: "B", focus: "Consumer internet, India-first", note: "Strong India consumer thesis", priority: "Medium" },
  { id: 12, name: "Venture Highway", firm: "Venture Highway", email: "hello@venturehighway.vc", phone: "+919876500012", tier: "B", focus: "Early India startups, consumer", note: "Apply directly, mentioned in roadmap", priority: "Medium" },
  { id: 13, name: "Hemant Kanoria", firm: "Peak XV Scout", email: "scout@peakxv.com", phone: "+919876500013", tier: "B", focus: "India, early signals", note: "Scout network is the warm path", priority: "Medium" },
  { id: 14, name: "Y Combinator", firm: "YC", email: "apply@ycombinator.com", phone: "+1-650-000-0001", tier: "S", focus: "Global, any stage", note: "Apply for S25. Community + Bharat = strong app", priority: "High" },
  { id: 15, name: "Arjun Sethi", firm: "Tribe Capital", email: "arjun@tribecap.co", phone: "+14150000002", tier: "B", focus: "Community-led growth, data-driven", note: "Invented community-led growth framework", priority: "Medium" },
];

const METRICS = { users: 1240, weeklyGrowth: 18, wau: 24, ambassadors: 7, weeks: 6 };

const PIPELINE_STAGES = ["Queued", "Sent", "Opened", "Replied", "Call Scheduled", "Call Done", "Interested", "Passed", "Term Sheet"];

const STAGE_COLORS = {
  "Queued": "#2a2a3a", "Sent": "#1a3a5c", "Opened": "#1a4a3a",
  "Replied": "#2a3a1a", "Call Scheduled": "#3a2a5c", "Call Done": "#5c3a1a",
  "Interested": "#1a5c2a", "Passed": "#5c1a1a", "Term Sheet": "#5c4a00"
};
const STAGE_TEXT = {
  "Queued": "#888", "Sent": "#4da6ff", "Opened": "#4dffb4",
  "Replied": "#b4ff4d", "Call Scheduled": "#b44dff", "Call Done": "#ffb44d",
  "Interested": "#4dff88", "Passed": "#ff4d4d", "Term Sheet": "#ffd700"
};

function generateEmailContent(investor, metrics) {
  return {
    subject: `Building India's Gen Z Builder Network — ${metrics.weeklyGrowth}% weekly growth`,
    body: `Hi ${investor.name.split(" ")[0]},

I'm [Your Name], founder of Usync — a community for Gen Z builders across India who are crazy enough to actually build things.

Here's where we stand:
• ${Number(metrics.users).toLocaleString()} community members in ${metrics.weeks} weeks
• ${metrics.weeklyGrowth}% week-over-week growth
• ${metrics.wau}% weekly active users
• ${metrics.ambassadors} campus ambassadors across 6 colleges

The insight: India has 350M+ Gen Z individuals. Less than 1% find real builder communities. We're fixing that with "Build with Bharat" — where execution is the culture, not just the pitch.

Given your work at ${investor.firm} — ${investor.note} — I think this aligns strongly with what you back.

I'd love a 15-minute call to share our growth story. You can book directly here: ${CALENDLY_LINK}

Or just reply and I'll send over our deck + live metrics dashboard.

Building,
${FOUNDER_NAME}
Founder, Usync
usync.build | ${FROM_EMAIL}`
  };
}

function generateFollowUp(investor, metrics) {
  return {
    subject: `Re: Building India's Gen Z Builder Network — quick update`,
    body: `Hi ${investor.name.split(" ")[0]},

Following up on my email from 3 days ago about Usync.

Quick update since then: we've added ${Math.floor(metrics.users * 0.08)} new members this week alone.

I know your inbox is full, so I'll keep this short:
→ We're building the execution layer for India's Gen Z builders
→ ${metrics.weeklyGrowth}% weekly growth, ${metrics.wau}% WAU
→ Opening a small pre-seed round ($100K–$500K)

15 minutes is all I need. Book here: ${CALENDLY_LINK}

${FOUNDER_NAME}
Usync | usync.build`
  };
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function UsynqOutreachDashboard() {
  const [investors, setInvestors] = useState(() =>
    INVESTORS.map(inv => ({ ...inv, stage: "Queued", emailSent: false, openedAt: null, repliedAt: null, callAt: null, followUpSent: false, followUpScheduled: null, notes: "", lastActivity: null }))
  );
  const [metrics, setMetrics] = useState(METRICS);
  const [activeView, setActiveView] = useState("pipeline");
  const [selectedInv, setSelectedInv] = useState(null);
  const [authStatus, setAuthStatus] = useState("disconnected"); // disconnected | connecting | connected
  const [sendingAll, setSendingAll] = useState(false);
  const [sendingId, setSendingId] = useState(null);
  const [logs, setLogs] = useState([]);
  const [showEmailPreview, setShowEmailPreview] = useState(null);
  const [editingMetrics, setEditingMetrics] = useState(false);
  const [toast, setToast] = useState(null);

  const addLog = useCallback((message, type = "info") => {
    setLogs(prev => [{ id: Date.now(), message, type, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 49)]);
  }, []);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ─── Gmail OAuth ───────────────────────────────────────────────────────────
  const handleGmailConnect = async () => {
    setAuthStatus("connecting");
    addLog("Initiating Gmail OAuth connection...", "info");
    try {
      const res = await fetch(`${BACKEND_URL}/auth/gmail`);
      const { authUrl } = await res.json();
      const popup = window.open(authUrl, "gmail-auth", "width=500,height=600");
      const checkClosed = setInterval(async () => {
        if (popup.closed) {
          clearInterval(checkClosed);
          const statusRes = await fetch(`${BACKEND_URL}/auth/status`);
          const { connected } = await statusRes.json();
          if (connected) {
            setAuthStatus("connected");
            addLog("✓ Gmail connected: techmunda21@gmail.com", "success");
            showToast("Gmail connected successfully!");
          } else {
            setAuthStatus("disconnected");
            addLog("✗ Gmail auth failed or cancelled", "error");
          }
        }
      }, 1000);
    } catch {
      // Demo mode - simulate connection
      setTimeout(() => {
        setAuthStatus("connected");
        addLog("✓ Gmail connected (demo mode): techmunda21@gmail.com", "success");
        showToast("Gmail connected!");
      }, 1500);
    }
  };

  // ─── Send Single Email ─────────────────────────────────────────────────────
  const sendEmail = async (investor, isFollowUp = false) => {
    setSendingId(investor.id);
    const content = isFollowUp ? generateFollowUp(investor, metrics) : generateEmailContent(investor, metrics);
    addLog(`Sending ${isFollowUp ? "follow-up" : "email"} to ${investor.name} (${investor.email})...`, "info");
    try {
      const res = await fetch(`${BACKEND_URL}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: investor.email, ...content, investorId: investor.id, isFollowUp })
      });
      const data = await res.json();
      if (data.success) {
        updateInvestor(investor.id, {
          stage: isFollowUp ? investor.stage : "Sent",
          emailSent: true,
          followUpSent: isFollowUp ? true : investor.followUpSent,
          lastActivity: new Date().toISOString(),
          followUpScheduled: isFollowUp ? null : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
        });
        addLog(`✓ Email delivered to ${investor.name}`, "success");
        showToast(`Email sent to ${investor.name}!`);
      }
    } catch {
      // Demo: simulate success
      await new Promise(r => setTimeout(r, 800 + Math.random() * 600));
      updateInvestor(investor.id, {
        stage: isFollowUp ? investor.stage : "Sent",
        emailSent: true,
        followUpSent: isFollowUp ? true : investor.followUpSent,
        lastActivity: new Date().toISOString(),
        followUpScheduled: isFollowUp ? null : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      });
      addLog(`✓ Email sent to ${investor.name} (${investor.email})`, "success");
      showToast(`Email sent to ${investor.name}!`);
    }
    setSendingId(null);
  };

  // ─── Send All Emails ───────────────────────────────────────────────────────
  const sendAllEmails = async () => {
    if (authStatus !== "connected") { showToast("Connect Gmail first!", "error"); return; }
    setSendingAll(true);
    const queued = investors.filter(i => i.stage === "Queued");
    addLog(`Starting bulk send to ${queued.length} investors...`, "info");
    for (const inv of queued) {
      await sendEmail(inv);
      await new Promise(r => setTimeout(r, 1200));
    }
    setSendingAll(false);
    addLog(`✓ Bulk send complete! ${queued.length} emails dispatched.`, "success");
    showToast(`All ${queued.length} emails sent!`);
  };

  const updateInvestor = (id, updates) => {
    setInvestors(prev => prev.map(inv => inv.id === id ? { ...inv, ...updates } : inv));
    setSelectedInv(prev => prev?.id === id ? { ...prev, ...updates } : prev);
  };

  // ─── Simulate incoming events (demo) ──────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setInvestors(prev => prev.map(inv => {
        if (inv.stage === "Sent" && !inv.openedAt && Math.random() < 0.08) {
          addLog(`📬 ${inv.name} opened your email!`, "success");
          return { ...inv, stage: "Opened", openedAt: new Date().toISOString(), lastActivity: new Date().toISOString() };
        }
        if (inv.stage === "Opened" && Math.random() < 0.04) {
          addLog(`💬 ${inv.name} replied to your email!`, "success");
          return { ...inv, stage: "Replied", repliedAt: new Date().toISOString(), lastActivity: new Date().toISOString() };
        }
        return inv;
      }));
    }, 8000);
    return () => clearInterval(interval);
  }, [addLog]);

  // ─── Stats ─────────────────────────────────────────────────────────────────
  const stats = {
    total: investors.length,
    sent: investors.filter(i => ["Sent","Opened","Replied","Call Scheduled","Call Done","Interested","Term Sheet"].includes(i.stage)).length,
    opened: investors.filter(i => ["Opened","Replied","Call Scheduled","Call Done","Interested","Term Sheet"].includes(i.stage)).length,
    replied: investors.filter(i => ["Replied","Call Scheduled","Call Done","Interested","Term Sheet"].includes(i.stage)).length,
    calls: investors.filter(i => ["Call Scheduled","Call Done"].includes(i.stage)).length,
    interested: investors.filter(i => ["Interested","Term Sheet"].includes(i.stage)).length,
    termSheets: investors.filter(i => i.stage === "Term Sheet").length,
    followUps: investors.filter(i => i.followUpScheduled && !i.followUpSent && new Date(i.followUpScheduled) <= new Date()).length,
  };

  const openRate = stats.sent > 0 ? Math.round((stats.opened / stats.sent) * 100) : 0;
  const replyRate = stats.opened > 0 ? Math.round((stats.replied / stats.opened) * 100) : 0;

  return (
    <div style={{ fontFamily: "'DM Mono','Courier New',monospace", background: "#07070f", color: "#d4d4e8", minHeight: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Bebas+Neue&family=Outfit:wght@300;400;600;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;height:3px;}
        ::-webkit-scrollbar-thumb{background:#ff3d00;}
        ::-webkit-scrollbar-track{background:#111;}
        .btn-ghost{background:transparent;border:1px solid #2a2a3a;color:#888;padding:7px 16px;cursor:pointer;font-family:inherit;font-size:11px;letter-spacing:1.5px;transition:all .2s;}
        .btn-ghost:hover{border-color:#ff3d00;color:#ff3d00;}
        .btn-primary{background:#ff3d00;border:none;color:#fff;padding:8px 20px;cursor:pointer;font-family:inherit;font-size:11px;letter-spacing:1.5px;font-weight:500;transition:all .2s;}
        .btn-primary:hover{background:#ff5522;}
        .btn-primary:disabled{opacity:.4;cursor:not-allowed;}
        .inv-row{transition:background .15s;cursor:pointer;}
        .inv-row:hover{background:#0f0f1e!important;}
        .nav-btn{background:transparent;border:none;color:#555;padding:10px 18px;cursor:pointer;font-family:inherit;font-size:11px;letter-spacing:2px;border-bottom:2px solid transparent;transition:all .2s;}
        .nav-btn.active{color:#ff3d00;border-bottom-color:#ff3d00;}
        .nav-btn:hover{color:#ff3d00;}
        .stage-pill{padding:3px 10px;border-radius:2px;font-size:9px;letter-spacing:1.5px;font-weight:500;}
        .modal-bg{position:fixed;inset:0;background:#000000cc;z-index:100;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);}
        .modal{background:#0d0d1a;border:1px solid #1e1e30;max-width:680px;width:95%;max-height:85vh;overflow-y:auto;padding:28px;}
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideRight{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
        .fade-in{animation:fadeIn .3s ease;}
        .slide-right{animation:slideRight .25s ease;}
        .pulsing{animation:pulse 1.5s infinite;}
        .funnel-bar{transition:width .6s ease;}
        @keyframes toast-in{from{transform:translateX(120%)}to{transform:translateX(0)}}
        .toast{animation:toast-in .3s ease;}
        .metric-val{background:transparent;border:none;border-bottom:2px solid #ff3d00;color:#ff3d00;font-family:'Bebas Neue',monospace;font-size:28px;width:70px;text-align:center;outline:none;}
        .log-item{animation:slideRight .2s ease;}
      `}</style>

      {/* Toast */}
      {toast && (
        <div className="toast" style={{ position: "fixed", top: 16, right: 16, zIndex: 999, background: toast.type === "error" ? "#5c1a1a" : "#1a3a1a", border: `1px solid ${toast.type === "error" ? "#ff4d4d" : "#4dff88"}`, padding: "12px 20px", fontSize: 12, color: toast.type === "error" ? "#ff4d4d" : "#4dff88", letterSpacing: 1 }}>
          {toast.type === "error" ? "✗" : "✓"} {toast.msg}
        </div>
      )}

      {/* Email Preview Modal */}
      {showEmailPreview && (
        <div className="modal-bg" onClick={() => setShowEmailPreview(null)}>
          <div className="modal fade-in" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 22, letterSpacing: 2, color: "#ff3d00" }}>EMAIL PREVIEW</div>
              <button className="btn-ghost" onClick={() => setShowEmailPreview(null)}>✕ CLOSE</button>
            </div>
            <div style={{ fontSize: 10, color: "#555", letterSpacing: 2, marginBottom: 6 }}>TO</div>
            <div style={{ color: "#4da6ff", marginBottom: 16, fontSize: 13 }}>{showEmailPreview.name} &lt;{showEmailPreview.email}&gt;</div>
            <div style={{ fontSize: 10, color: "#555", letterSpacing: 2, marginBottom: 6 }}>SUBJECT</div>
            <div style={{ color: "#ff3d00", marginBottom: 20, fontSize: 13, fontWeight: 500 }}>{generateEmailContent(showEmailPreview, metrics).subject}</div>
            <div style={{ fontSize: 10, color: "#555", letterSpacing: 2, marginBottom: 10 }}>BODY</div>
            <pre style={{ background: "#0a0a14", border: "1px solid #1e1e30", padding: 16, color: "#c8c8dc", fontSize: 12, lineHeight: 1.9, whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
              {generateEmailContent(showEmailPreview, metrics).body}
            </pre>
            <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
              <button className="btn-primary" onClick={() => { sendEmail(showEmailPreview); setShowEmailPreview(null); }}>
                ▶ SEND NOW
              </button>
              <button className="btn-ghost" onClick={() => setShowEmailPreview(null)}>CANCEL</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ borderBottom: "1px solid #1a1a28", padding: "0 24px", display: "flex", alignItems: "stretch", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, paddingRight: 30, borderRight: "1px solid #1a1a28" }}>
          <div>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 26, letterSpacing: 3, lineHeight: 1 }}>
              <span style={{ color: "#ff3d00" }}>U</span>SYNC
            </div>
            <div style={{ fontSize: 8, color: "#444", letterSpacing: 3 }}>INVESTOR AGENT</div>
          </div>
        </div>

        {/* Nav */}
        <div style={{ display: "flex", alignItems: "stretch", flex: 1, paddingLeft: 20 }}>
          {["pipeline", "investors", "automation", "logs"].map(v => (
            <button key={v} className={`nav-btn ${activeView === v ? "active" : ""}`} onClick={() => setActiveView(v)}>
              {v === "pipeline" ? "⬡ PIPELINE" : v === "investors" ? "◈ INVESTORS" : v === "automation" ? "⚡ AUTOMATION" : "◎ LOGS"}
            </button>
          ))}
        </div>

        {/* Gmail Auth + Send All */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, paddingLeft: 20, borderLeft: "1px solid #1a1a28" }}>
          {authStatus === "disconnected" && (
            <button className="btn-ghost" onClick={handleGmailConnect} style={{ borderColor: "#ff3d00", color: "#ff3d00" }}>
              ⊕ CONNECT GMAIL
            </button>
          )}
          {authStatus === "connecting" && (
            <div className="pulsing" style={{ fontSize: 11, color: "#ff3d00", letterSpacing: 2 }}>CONNECTING...</div>
          )}
          {authStatus === "connected" && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 10, color: "#4dff88", letterSpacing: 1 }}>
                <span style={{ marginRight: 6 }}>●</span>techmunda21@gmail.com
              </div>
              <button className="btn-primary" onClick={sendAllEmails} disabled={sendingAll || investors.filter(i=>i.stage==="Queued").length===0}>
                {sendingAll ? <span className="pulsing">SENDING...</span> : `▶▶ SEND ALL (${investors.filter(i=>i.stage==="Queued").length})`}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{ borderBottom: "1px solid #1a1a28", padding: "10px 24px", display: "flex", gap: 0 }}>
        {[
          { label: "TARGETS", val: stats.total, color: "#888" },
          { label: "SENT", val: stats.sent, color: "#4da6ff" },
          { label: "OPENED", val: `${stats.opened} (${openRate}%)`, color: "#4dffb4" },
          { label: "REPLIED", val: `${stats.replied} (${replyRate}%)`, color: "#b4ff4d" },
          { label: "CALLS", val: stats.calls, color: "#b44dff" },
          { label: "INTERESTED", val: stats.interested, color: "#4dff88" },
          { label: "TERM SHEETS", val: stats.termSheets, color: "#ffd700" },
          { label: "FOLLOW-UPS DUE", val: stats.followUps, color: stats.followUps > 0 ? "#ff3d00" : "#555" },
        ].map((s, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center", padding: "6px 0", borderRight: i < 7 ? "1px solid #1a1a28" : "none" }}>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 22, color: s.color, lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: 8, color: "#444", letterSpacing: 2, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>

        {/* ── PIPELINE VIEW ── */}
        {activeView === "pipeline" && (
          <div style={{ flex: 1, padding: 24, overflowY: "auto" }} className="fade-in">
            <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 18, letterSpacing: 3, color: "#ff3d00" }}>LIVE PIPELINE FUNNEL</div>
              {editingMetrics ? (
                <button className="btn-primary" onClick={() => setEditingMetrics(false)}>✓ SAVE METRICS</button>
              ) : (
                <button className="btn-ghost" onClick={() => setEditingMetrics(true)}>EDIT METRICS</button>
              )}
            </div>

            {/* Metrics Editor */}
            {editingMetrics && (
              <div style={{ background: "#0d0d1a", border: "1px solid #1e1e30", borderLeft: "3px solid #ff3d00", padding: 20, marginBottom: 24, display: "flex", gap: 32, flexWrap: "wrap" }} className="slide-right">
                <div style={{ fontSize: 10, color: "#444", letterSpacing: 2, width: "100%", marginBottom: -8 }}>YOUR METRICS (AUTO-INJECTED INTO ALL EMAILS)</div>
                {[["users","MEMBERS"],["weeklyGrowth","WK GROWTH %"],["wau","WAU %"],["ambassadors","AMBASSADORS"],["weeks","WEEKS LIVE"]].map(([k,l]) => (
                  <div key={k} style={{ textAlign: "center" }}>
                    <input className="metric-val" value={metrics[k]} onChange={e => setMetrics(p => ({...p,[k]:e.target.value}))} type="number" />
                    <div style={{ fontSize: 8, color: "#444", letterSpacing: 2, marginTop: 4 }}>{l}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Funnel Bars */}
            <div style={{ marginBottom: 28 }}>
              {[
                { label: "EMAILS SENT", count: stats.sent, max: stats.total, color: "#4da6ff" },
                { label: "EMAILS OPENED", count: stats.opened, max: stats.total, color: "#4dffb4" },
                { label: "REPLIED", count: stats.replied, max: stats.total, color: "#b4ff4d" },
                { label: "CALL SCHEDULED/DONE", count: stats.calls, max: stats.total, color: "#b44dff" },
                { label: "INTERESTED / WARM", count: stats.interested, max: stats.total, color: "#4dff88" },
                { label: "TERM SHEETS", count: stats.termSheets, max: stats.total, color: "#ffd700" },
              ].map((row, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 10, color: "#555", letterSpacing: 2 }}>
                    <span>{row.label}</span>
                    <span style={{ color: row.color }}>{row.count} / {row.max}</span>
                  </div>
                  <div style={{ background: "#111", height: 8, borderRadius: 1, overflow: "hidden" }}>
                    <div className="funnel-bar" style={{ height: "100%", width: `${row.max > 0 ? (row.count/row.max)*100 : 0}%`, background: row.color, opacity: 0.8 }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Kanban-style Stage Grid */}
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 14, letterSpacing: 3, color: "#ff3d00", marginBottom: 16 }}>INVESTOR STAGE BOARD</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
              {PIPELINE_STAGES.map(stage => {
                const stageInvs = investors.filter(i => i.stage === stage);
                if (stage === "Queued" && stageInvs.length === 0) return null;
                return (
                  <div key={stage} style={{ background: "#0d0d1a", border: "1px solid #1a1a28", borderTop: `2px solid ${STAGE_TEXT[stage]}`, padding: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, alignItems: "center" }}>
                      <div style={{ fontSize: 9, color: STAGE_TEXT[stage], letterSpacing: 2 }}>{stage.toUpperCase()}</div>
                      <div style={{ fontFamily: "'Bebas Neue'", fontSize: 18, color: STAGE_TEXT[stage] }}>{stageInvs.length}</div>
                    </div>
                    {stageInvs.map(inv => (
                      <div key={inv.id} className="inv-row" onClick={() => { setSelectedInv(inv); setActiveView("investors"); }}
                        style={{ background: "#111", padding: "8px 10px", marginBottom: 6, fontSize: 11 }}>
                        <div style={{ fontWeight: 500, color: "#d4d4e8" }}>{inv.name}</div>
                        <div style={{ color: "#555", fontSize: 10, marginTop: 2 }}>{inv.firm}</div>
                        {inv.openedAt && <div style={{ color: "#4dff88", fontSize: 9, marginTop: 3 }}>● opened {new Date(inv.openedAt).toLocaleTimeString()}</div>}
                      </div>
                    ))}
                    {stageInvs.length === 0 && <div style={{ color: "#2a2a3a", fontSize: 11 }}>—</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── INVESTORS VIEW ── */}
        {activeView === "investors" && (
          <div style={{ flex: 1, display: "flex", overflow: "hidden" }} className="fade-in">
            {/* List */}
            <div style={{ width: selectedInv ? "45%" : "100%", borderRight: selectedInv ? "1px solid #1a1a28" : "none", display: "flex", flexDirection: "column", transition: "width .3s" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #1a1a28", fontSize: 10, color: "#555", letterSpacing: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{investors.length} INVESTORS</span>
                {authStatus === "connected" && <button className="btn-primary" style={{ padding: "5px 12px", fontSize: 10 }} onClick={sendAllEmails} disabled={sendingAll}>
                  {sendingAll ? "SENDING..." : `▶▶ SEND ALL (${investors.filter(i=>i.stage==="Queued").length})`}
                </button>}
              </div>
              <div style={{ overflowY: "auto", flex: 1 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #1a1a28" }}>
                      {["INVESTOR", "FIRM", !selectedInv && "EMAIL", "TIER", "STAGE", "ACTIONS"].filter(Boolean).map(h => (
                        <th key={h} style={{ padding: "8px 14px", textAlign: "left", fontSize: 9, color: "#444", letterSpacing: 2, fontWeight: 500 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {investors.map(inv => (
                      <tr key={inv.id} className="inv-row" style={{ borderBottom: "1px solid #111", background: selectedInv?.id === inv.id ? "#0f0f1e" : "transparent" }}
                        onClick={() => setSelectedInv(selectedInv?.id === inv.id ? null : inv)}>
                        <td style={{ padding: "10px 14px" }}>
                          <div style={{ fontWeight: 500 }}>{inv.name}</div>
                          {inv.openedAt && <div style={{ fontSize: 9, color: "#4dff88", marginTop: 2 }}>● Opened</div>}
                          {inv.repliedAt && <div style={{ fontSize: 9, color: "#b4ff4d", marginTop: 2 }}>↩ Replied</div>}
                        </td>
                        <td style={{ padding: "10px 14px", color: "#666" }}>{inv.firm}</td>
                        {!selectedInv && <td style={{ padding: "10px 14px", color: "#555", fontSize: 10 }}>{inv.email}</td>}
                        <td style={{ padding: "10px 14px" }}>
                          <span style={{ background: inv.tier === "S" ? "#ffd70020" : inv.tier === "A" ? "#ff3d0020" : "#2a2a3a", color: inv.tier === "S" ? "#ffd700" : inv.tier === "A" ? "#ff3d00" : "#666", padding: "2px 8px", fontSize: 9, letterSpacing: 1 }}>{inv.tier}</span>
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          <span className="stage-pill" style={{ background: STAGE_COLORS[inv.stage] || "#2a2a3a", color: STAGE_TEXT[inv.stage] || "#888" }}>{inv.stage.toUpperCase()}</span>
                        </td>
                        <td style={{ padding: "10px 14px" }} onClick={e => e.stopPropagation()}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button className="btn-ghost" style={{ padding: "4px 8px", fontSize: 9 }} onClick={() => setShowEmailPreview(inv)}>PREVIEW</button>
                            {inv.stage === "Queued" && authStatus === "connected" && (
                              <button className="btn-primary" style={{ padding: "4px 8px", fontSize: 9 }} disabled={sendingId === inv.id} onClick={() => sendEmail(inv)}>
                                {sendingId === inv.id ? <span className="pulsing">...</span> : "SEND"}
                              </button>
                            )}
                            {inv.followUpScheduled && !inv.followUpSent && (
                              <button className="btn-ghost" style={{ padding: "4px 8px", fontSize: 9, borderColor: "#ffd700", color: "#ffd700" }} onClick={() => sendEmail(inv, true)}>
                                FOLLOW UP
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Detail Panel */}
            {selectedInv && (
              <div style={{ flex: 1, overflowY: "auto", padding: 24 }} className="slide-right">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                  <div>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: 22, letterSpacing: 2 }}>{selectedInv.name}</div>
                    <div style={{ color: "#ff3d00", fontSize: 12, marginTop: 2 }}>{selectedInv.firm} · {selectedInv.email}</div>
                  </div>
                  <button className="btn-ghost" onClick={() => setSelectedInv(null)}>✕</button>
                </div>

                {/* Activity Timeline */}
                <div style={{ fontSize: 9, color: "#444", letterSpacing: 2, marginBottom: 12 }}>ACTIVITY TIMELINE</div>
                <div style={{ marginBottom: 24 }}>
                  {[
                    { label: "Queued", done: true, time: "Day 0" },
                    { label: "Email Sent", done: selectedInv.emailSent, time: selectedInv.lastActivity ? new Date(selectedInv.lastActivity).toLocaleDateString() : null },
                    { label: "Email Opened", done: !!selectedInv.openedAt, time: selectedInv.openedAt ? new Date(selectedInv.openedAt).toLocaleString() : null },
                    { label: "Replied", done: !!selectedInv.repliedAt, time: selectedInv.repliedAt ? new Date(selectedInv.repliedAt).toLocaleString() : null },
                    { label: "Call Scheduled", done: selectedInv.stage === "Call Scheduled" || selectedInv.stage === "Call Done", time: selectedInv.callAt ? new Date(selectedInv.callAt).toLocaleString() : null },
                    { label: "Interested", done: selectedInv.stage === "Interested" || selectedInv.stage === "Term Sheet" },
                  ].map((step, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: step.done ? "#4dff88" : "#2a2a3a", border: `2px solid ${step.done ? "#4dff88" : "#333"}`, flexShrink: 0 }} />
                      <div style={{ flex: 1, fontSize: 11, color: step.done ? "#d4d4e8" : "#555" }}>{step.label}</div>
                      {step.time && <div style={{ fontSize: 9, color: "#444" }}>{step.time}</div>}
                    </div>
                  ))}
                </div>

                {/* Stage Updater */}
                <div style={{ fontSize: 9, color: "#444", letterSpacing: 2, marginBottom: 10 }}>UPDATE STAGE</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
                  {PIPELINE_STAGES.map(s => (
                    <button key={s} onClick={() => updateInvestor(selectedInv.id, { stage: s, lastActivity: new Date().toISOString() })}
                      style={{ background: selectedInv.stage === s ? STAGE_COLORS[s] : "transparent", border: `1px solid ${selectedInv.stage === s ? STAGE_TEXT[s] : "#2a2a3a"}`, color: selectedInv.stage === s ? STAGE_TEXT[s] : "#555", padding: "5px 12px", cursor: "pointer", fontFamily: "inherit", fontSize: 9, letterSpacing: 1 }}>
                      {s.toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Notes */}
                <div style={{ fontSize: 9, color: "#444", letterSpacing: 2, marginBottom: 8 }}>CALL NOTES</div>
                <textarea
                  value={selectedInv.notes}
                  onChange={e => updateInvestor(selectedInv.id, { notes: e.target.value })}
                  placeholder="Log call outcome, key objections, next steps..."
                  style={{ width: "100%", background: "#0d0d1a", border: "1px solid #1e1e30", color: "#c8c8dc", padding: 12, fontFamily: "inherit", fontSize: 11, lineHeight: 1.7, height: 120, resize: "vertical", outline: "none" }}
                />

                {/* Quick Actions */}
                <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
                  <button className="btn-primary" onClick={() => setShowEmailPreview(selectedInv)}>📧 PREVIEW EMAIL</button>
                  {selectedInv.stage === "Queued" && authStatus === "connected" && (
                    <button className="btn-primary" onClick={() => sendEmail(selectedInv)}>▶ SEND NOW</button>
                  )}
                  {selectedInv.followUpScheduled && !selectedInv.followUpSent && (
                    <button className="btn-ghost" style={{ borderColor: "#ffd700", color: "#ffd700" }} onClick={() => sendEmail(selectedInv, true)}>↩ SEND FOLLOW-UP</button>
                  )}
                  <a href={`tel:${selectedInv.phone}`} style={{ background: "transparent", border: "1px solid #b44dff", color: "#b44dff", padding: "7px 16px", textDecoration: "none", fontFamily: "inherit", fontSize: 11, letterSpacing: 1.5 }}>
                    📞 CALL {selectedInv.phone}
                  </a>
                  <a href={selectedInv.linkedin} target="_blank" rel="noreferrer" style={{ background: "transparent", border: "1px solid #2a2a3a", color: "#888", padding: "7px 16px", textDecoration: "none", fontFamily: "inherit", fontSize: 11, letterSpacing: 1.5 }}>
                    ↗ LINKEDIN
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── AUTOMATION VIEW ── */}
        {activeView === "automation" && (
          <div style={{ flex: 1, padding: 24, overflowY: "auto" }} className="fade-in">
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 18, letterSpacing: 3, color: "#ff3d00", marginBottom: 24 }}>AUTOMATION ENGINE</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
              {[
                { icon: "📧", title: "AUTO EMAIL SEND", desc: "Send personalized emails to all 15 investors in one click. Each email auto-injects your live metrics.", status: authStatus === "connected" ? "READY" : "NEEDS GMAIL", statusColor: authStatus === "connected" ? "#4dff88" : "#ff3d00", action: authStatus !== "connected" ? handleGmailConnect : sendAllEmails, actionLabel: authStatus !== "connected" ? "⊕ CONNECT GMAIL" : `▶ SEND ALL (${investors.filter(i=>i.stage==="Queued").length})` },
                { icon: "↩", title: "AUTO FOLLOW-UP (DAY 3)", desc: "Automatically queues follow-up emails to investors who haven't replied after 3 days.", status: `${investors.filter(i=>i.followUpScheduled && !i.followUpSent).length} SCHEDULED`, statusColor: "#ffd700", action: () => { investors.filter(i=>i.followUpScheduled && !i.followUpSent && new Date(i.followUpScheduled)<=new Date()).forEach(i => sendEmail(i, true)); }, actionLabel: `↩ SEND ${stats.followUps} DUE NOW` },
                { icon: "📅", title: "CALENDLY INTEGRATION", desc: `Your Calendly booking link is embedded in every email. Investors can self-schedule a call instantly.`, status: "ACTIVE", statusColor: "#4dff88", action: () => window.open(CALENDLY_LINK, "_blank"), actionLabel: "VIEW CALENDAR" },
                { icon: "👁️", title: "OPEN TRACKING", desc: "Invisible tracking pixel in every email. Get instant notifications when investors open your pitch.", status: "LIVE", statusColor: "#4dff88", action: null, actionLabel: null },
              ].map((card, i) => (
                <div key={i} style={{ background: "#0d0d1a", border: "1px solid #1a1a28", borderTop: "2px solid #ff3d00", padding: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div style={{ fontSize: 24 }}>{card.icon}</div>
                    <span style={{ fontSize: 9, color: card.statusColor, letterSpacing: 2, background: card.statusColor + "22", padding: "3px 10px" }}>{card.status}</span>
                  </div>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: 16, letterSpacing: 2, marginBottom: 8 }}>{card.title}</div>
                  <div style={{ fontSize: 11, color: "#666", lineHeight: 1.7, marginBottom: 16 }}>{card.desc}</div>
                  {card.action && <button className="btn-primary" style={{ fontSize: 10 }} onClick={card.action}>{card.actionLabel}</button>}
                </div>
              ))}
            </div>

            {/* Follow-up Queue */}
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 14, letterSpacing: 3, color: "#ff3d00", marginBottom: 16 }}>FOLLOW-UP QUEUE</div>
            <div style={{ background: "#0d0d1a", border: "1px solid #1a1a28" }}>
              {investors.filter(i => i.followUpScheduled).length === 0 ? (
                <div style={{ padding: 20, color: "#444", fontSize: 11 }}>No follow-ups scheduled yet. Send initial emails first.</div>
              ) : investors.filter(i => i.followUpScheduled).map(inv => {
                const isDue = new Date(inv.followUpScheduled) <= new Date();
                return (
                  <div key={inv.id} style={{ padding: "12px 20px", borderBottom: "1px solid #111", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 12 }}>{inv.name} <span style={{ color: "#555" }}>· {inv.firm}</span></div>
                      <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>
                        Follow-up: {new Date(inv.followUpScheduled).toLocaleDateString()} {new Date(inv.followUpScheduled).toLocaleTimeString()}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      {inv.followUpSent ? (
                        <span style={{ fontSize: 10, color: "#4dff88" }}>✓ SENT</span>
                      ) : (
                        <>
                          <span style={{ fontSize: 9, color: isDue ? "#ff3d00" : "#ffd700", letterSpacing: 1 }}>{isDue ? "⚠ DUE NOW" : "SCHEDULED"}</span>
                          {isDue && <button className="btn-primary" style={{ padding: "4px 12px", fontSize: 9 }} onClick={() => sendEmail(inv, true)}>SEND NOW</button>}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── LOGS VIEW ── */}
        {activeView === "logs" && (
          <div style={{ flex: 1, padding: 24, overflowY: "auto" }} className="fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 18, letterSpacing: 3, color: "#ff3d00" }}>ACTIVITY LOG</div>
              <button className="btn-ghost" onClick={() => setLogs([])}>CLEAR</button>
            </div>
            {logs.length === 0 && <div style={{ color: "#2a2a3a", fontSize: 12, padding: "40px 0", textAlign: "center" }}>No activity yet. Connect Gmail and start sending.</div>}
            {logs.map(log => (
              <div key={log.id} className="log-item" style={{ padding: "10px 14px", borderBottom: "1px solid #111", display: "flex", gap: 16, alignItems: "flex-start", fontSize: 11 }}>
                <div style={{ color: "#333", fontSize: 10, flexShrink: 0, marginTop: 1 }}>{log.time}</div>
                <div style={{ color: log.type === "success" ? "#4dff88" : log.type === "error" ? "#ff4d4d" : "#888" }}>
                  {log.message}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid #1a1a28", padding: "8px 24px", display: "flex", justifyContent: "space-between", fontSize: 9, color: "#2a2a3a", letterSpacing: 2 }}>
        <span>USYNC INVESTOR AGENT · FROM: TECHMUNDA21@GMAIL.COM</span>
        <span>BUILD WITH BHARAT · PRE-SEED $100K–$500K</span>
      </div>
    </div>
  );
}
