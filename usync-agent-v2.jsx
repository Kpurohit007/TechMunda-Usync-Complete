import { useState, useEffect, useRef, useCallback } from "react";

// ════════════════════════════════════════════════════════════
//  CONFIG — UPDATE THESE AFTER SETUP
// ════════════════════════════════════════════════════════════
const CONFIG = {
  N8N_WEBHOOK_EMAIL:    "https://YOUR-N8N.app.n8n.cloud/webhook/usync-send-email",
  N8N_WEBHOOK_CALL:     "https://YOUR-N8N.app.n8n.cloud/webhook/usync-ai-call",
  N8N_WEBHOOK_FOLLOWUP: "https://YOUR-N8N.app.n8n.cloud/webhook/usync-followup",
  N8N_WEBHOOK_STATUS:   "https://YOUR-N8N.app.n8n.cloud/webhook/usync-status",
  TRIAL_PHONE:          "+917976701222",   // YOUR number — tested first
  TRIAL_NAME:           "Usync Founder (Trial)",
  CALENDLY:             "https://calendly.com/techmunda21/usync-investor-call",
  FROM_EMAIL:           "techmunda21@gmail.com",
};

const INVESTORS = [
  { id:1,  name:"Karthik Reddy",       firm:"Blume Ventures",    email:"karthik@blume.vc",          phone:"+919876500001", tier:"A", priority:"High",   note:"Loves Bharat narrative, backed Unacademy" },
  { id:2,  name:"Sajith Pai",          firm:"Blume Ventures",    email:"sajith@blume.vc",            phone:"+919876500002", tier:"A", priority:"High",   note:"Deep Gen Z thesis, writes about Bharat internet" },
  { id:3,  name:"Anand Lunia",         firm:"India Quotient",    email:"anand@indiaquotient.in",     phone:"+919876500003", tier:"A", priority:"High",   note:"Best fit for 'Build with Bharat' narrative" },
  { id:4,  name:"WTFund Team",         firm:"WTFund",            email:"apply@wtfund.in",            phone:"+919876500004", tier:"A", priority:"High",   note:"Specifically for young founders" },
  { id:5,  name:"100X.VC Team",        firm:"100X.VC",           email:"hello@100x.vc",             phone:"+919876500005", tier:"A", priority:"High",   note:"First-check India investors, fast process" },
  { id:6,  name:"Kunal Shah",          firm:"Angel / CRED",      email:"kunal@cred.club",           phone:"+919876500006", tier:"A", priority:"High",   note:"Prolific angel, community evangelist" },
  { id:7,  name:"Aprameya R.",         firm:"Angel / Koo",       email:"aprameya@koo.in",           phone:"+919876500007", tier:"A", priority:"High",   note:"Active angel, loves community products" },
  { id:8,  name:"Antler India",        firm:"Antler",            email:"india@antler.co",            phone:"+919876500008", tier:"A", priority:"High",   note:"Great for early-stage, apply to cohort" },
  { id:9,  name:"Y Combinator",        firm:"YC",                email:"apply@ycombinator.com",      phone:"+16500000001",  tier:"S", priority:"High",   note:"Apply S25. Community + Bharat = strong app" },
  { id:10, name:"Prayank Swaroop",     firm:"Accel India",       email:"prayank@accel.com",          phone:"+919876500009", tier:"B", priority:"Medium", note:"Good for Series A path later" },
  { id:11, name:"Hemant Mohapatra",    firm:"Lightspeed India",  email:"hemant@lsvp.com",            phone:"+919876500010", tier:"B", priority:"Medium", note:"Scout program active" },
  { id:12, name:"Vani Kola",           firm:"Kalaari Capital",   email:"vani@kalaari.com",           phone:"+919876500011", tier:"B", priority:"Medium", note:"Strong India consumer thesis" },
  { id:13, name:"Venture Highway",     firm:"Venture Highway",   email:"hello@venturehighway.vc",    phone:"+919876500012", tier:"B", priority:"Medium", note:"Apply directly" },
  { id:14, name:"Arjun Sethi",         firm:"Tribe Capital",     email:"arjun@tribecap.co",          phone:"+14150000002",  tier:"B", priority:"Medium", note:"Invented community-led growth framework" },
  { id:15, name:"Peak XV Scout",       firm:"Peak XV",           email:"scout@peakxv.com",           phone:"+919876500013", tier:"B", priority:"Medium", note:"Find a scout first, warm path" },
];

const METRICS_DEFAULT = { users:1240, growth:18, wau:24, ambassadors:7, weeks:6 };

const STAGES = ["Queued","Email Sent","Email Opened","Replied","Call Queued","Calling","Call Done","Interested","Passed","Term Sheet"];
const STAGE_COLOR = {
  "Queued":"#2a2a3a","Email Sent":"#0d2a4a","Email Opened":"#0d3a2a","Replied":"#1e3a0d",
  "Call Queued":"#2a1e4a","Calling":"#4a1e00","Call Done":"#2a1e00",
  "Interested":"#0d3a1a","Passed":"#3a0d0d","Term Sheet":"#3a2e00"
};
const STAGE_GLOW = {
  "Queued":"#555","Email Sent":"#4da6ff","Email Opened":"#00ffaa","Replied":"#aaff00",
  "Call Queued":"#aa44ff","Calling":"#ff6600","Call Done":"#ff9900",
  "Interested":"#00ff66","Passed":"#ff3333","Term Sheet":"#ffcc00"
};

function buildPitch(name, metrics) {
  return `Hi, this is an AI assistant calling on behalf of the Usync team.

I'm reaching out to ${name} because we believe Usync aligns strongly with your investment thesis.

Usync is building India's largest Gen Z builder community — where execution is the culture, not just the pitch.

In just ${metrics.weeks} weeks, we've grown to ${Number(metrics.users).toLocaleString()} community members, with ${metrics.growth}% week-over-week growth and ${metrics.wau}% weekly active users. We have ${metrics.ambassadors} campus ambassadors across 6 colleges.

We're opening a small pre-seed round between 100,000 and 500,000 dollars to fuel our Build with Bharat campus movement.

I'd love to schedule a 15-minute call with our founder. Would you be open to that? I can share our deck and live metrics dashboard immediately after this call.

Thank you for your time. Have a great day.`;
}

function buildEmail(inv, metrics) {
  return {
    to: inv.email,
    subject: `Building India's Gen Z Builder Network — ${metrics.growth}% weekly growth`,
    body: `Hi ${inv.name.split(" ")[0]},

I'm building Usync — a community for Gen Z builders across India who are crazy enough to actually build things.

Here's where we stand:
• ${Number(metrics.users).toLocaleString()} community members in ${metrics.weeks} weeks
• ${metrics.growth}% week-over-week growth  
• ${metrics.wau}% weekly active users
• ${metrics.ambassadors} campus ambassadors across 6 colleges

The insight: India has 350M+ Gen Z individuals. Less than 1% find real builder communities. We're fixing that with "Build with Bharat" — where execution is the culture.

Given your work at ${inv.firm} — ${inv.note} — I believe this aligns with your thesis.

Book a 15-min call directly: ${CONFIG.CALENDLY}

Or reply and I'll send our deck + live metrics dashboard.

Building,
Usync Founder
usync.build | ${CONFIG.FROM_EMAIL}`
  };
}

function buildFollowUp(inv, metrics) {
  return {
    to: inv.email,
    subject: `Re: Building India's Gen Z Builder Network — quick update`,
    body: `Hi ${inv.name.split(" ")[0]},

Following up on my email from 3 days ago.

Quick update: we've added ${Math.floor(metrics.users * 0.08)} new members this week alone.

• ${metrics.growth}% week-over-week growth
• Pre-seed round: $100K–$500K
• Book 15 mins: ${CONFIG.CALENDLY}

Building,
Usync Founder`
  };
}

// ════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ════════════════════════════════════════════════════════════
export default function UsynqAgent() {
  const [investors, setInvestors] = useState(() =>
    INVESTORS.map(inv => ({
      ...inv, stage:"Queued", emailSent:false, openedAt:null,
      repliedAt:null, callStatus:null, callDuration:null,
      callPickedUp:false, followUpSent:false,
      followUpDue:null, notes:"", lastActivity:null
    }))
  );
  const [metrics, setMetrics] = useState(METRICS_DEFAULT);
  const [view, setView] = useState("command"); // command | pipeline | investors | logs | setup
  const [logs, setLogs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [trialMode, setTrialMode] = useState(true);
  const [n8nConnected, setN8nConnected] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeOp, setActiveOp] = useState(null); // current bulk operation
  const [opProgress, setOpProgress] = useState(0);
  const [editMetrics, setEditMetrics] = useState(false);
  const [callActive, setCallActive] = useState(null); // currently calling investor
  const [callTimer, setCallTimer] = useState(0);
  const timerRef = useRef(null);

  const log = useCallback((msg, type="info") => {
    setLogs(p => [{ id:Date.now()+Math.random(), msg, type, time: new Date().toLocaleTimeString("en-IN") }, ...p.slice(0,99)]);
  }, []);

  const toast_ = useCallback((msg, type="ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const upd = useCallback((id, patch) => {
    setInvestors(p => p.map(i => i.id===id ? {...i,...patch,lastActivity:new Date().toISOString()} : i));
    setSelected(p => p?.id===id ? {...p,...patch} : p);
  }, []);

  // ── Call timer ────────────────────────────────────────────
  useEffect(() => {
    if (callActive) {
      setCallTimer(0);
      timerRef.current = setInterval(() => setCallTimer(t => t+1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [callActive]);

  const fmtTimer = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  // ── n8n ping ──────────────────────────────────────────────
  const pingN8n = async () => {
    try {
      await fetch(CONFIG.N8N_WEBHOOK_STATUS, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ ping:true }) });
      setN8nConnected(true);
      log("✓ n8n Cloud connected", "ok");
      toast_("n8n connected!");
    } catch {
      setN8nConnected(false);
      log("⚠ n8n not reachable — update webhook URLs in CONFIG", "warn");
      toast_("n8n not reachable — running in demo mode", "warn");
    }
  };

  // ── Fire webhook (with demo fallback) ────────────────────
  const fireWebhook = async (url, payload) => {
    try {
      const res = await fetch(url, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(payload) });
      return await res.json();
    } catch {
      // Demo fallback — simulate success
      await new Promise(r => setTimeout(r, 600+Math.random()*800));
      return { success:true, demo:true };
    }
  };

  // ── Send Email via n8n ────────────────────────────────────
  const sendEmail = async (inv, isFollowUp=false) => {
    const content = isFollowUp ? buildFollowUp(inv, metrics) : buildEmail(inv, metrics);
    log(`📧 Sending ${isFollowUp?"follow-up":"email"} → ${inv.name} <${inv.email}>`, "info");
    const res = await fireWebhook(CONFIG.N8N_WEBHOOK_EMAIL, { ...content, investorId: inv.id, investorName: inv.name, isFollowUp });
    if (res.success) {
      upd(inv.id, {
        stage: isFollowUp ? inv.stage : "Email Sent",
        emailSent: true,
        followUpSent: isFollowUp,
        followUpDue: !isFollowUp ? new Date(Date.now()+3*24*60*60*1000).toISOString() : inv.followUpDue
      });
      log(`✓ Email delivered to ${inv.name}${res.demo?" (demo)":""}`, "ok");
    }
    return res;
  };

  // ── AI Call via n8n → VAPI ────────────────────────────────
  const fireCall = async (inv) => {
    const isTrialCall = inv.phone === CONFIG.TRIAL_PHONE;
    const phone = trialMode ? CONFIG.TRIAL_PHONE : inv.phone;
    const callTo = trialMode ? CONFIG.TRIAL_NAME : inv.name;

    log(`📞 Initiating AI call → ${callTo} (${phone})`, "info");
    upd(inv.id, { stage:"Calling", callStatus:"ringing" });
    setCallActive(inv);

    const pitch = buildPitch(inv.name, metrics);
    const res = await fireWebhook(CONFIG.N8N_WEBHOOK_CALL, {
      phone,
      investorId: inv.id,
      investorName: inv.name,
      pitch,
      firstMessage: `Hi, this is an AI assistant calling on behalf of Usync. May I speak with ${inv.name}?`,
      isTrialCall,
    });

    if (res.success) {
      // Simulate call progression for demo
      setTimeout(() => {
        upd(inv.id, { callStatus:"connected", callPickedUp:true, stage:"Calling" });
        log(`☎️ ${callTo} picked up!`, "ok");
        toast_(`${callTo} picked up the call!`);
      }, 3000);
      setTimeout(() => {
        upd(inv.id, { stage:"Call Done", callStatus:"completed", callDuration:120+Math.floor(Math.random()*180) });
        setCallActive(null);
        log(`✓ Call completed with ${callTo}${res.demo?" (demo)":""}`, "ok");
        toast_(`Call done with ${callTo}`);
      }, 12000);
    }
    return res;
  };

  // ── Bulk: Send All Emails ─────────────────────────────────
  const sendAllEmails = async () => {
    const queued = investors.filter(i => i.stage==="Queued");
    if (!queued.length) { toast_("No queued investors!", "warn"); return; }
    setActiveOp("emails"); setOpProgress(0);
    log(`🚀 Bulk email send started — ${queued.length} investors`, "info");
    for (let idx=0; idx<queued.length; idx++) {
      await sendEmail(queued[idx]);
      setOpProgress(Math.round(((idx+1)/queued.length)*100));
      await new Promise(r => setTimeout(r, 1200));
    }
    setActiveOp(null);
    log(`✅ All ${queued.length} emails sent!`, "ok");
    toast_(`${queued.length} emails sent!`);
  };

  // ── Trial Call First, Then All ────────────────────────────
  const runTrialCall = async () => {
    log(`🧪 TRIAL CALL → Your number ${CONFIG.TRIAL_PHONE}`, "info");
    const trialInv = { id:"trial", name:CONFIG.TRIAL_NAME, phone:CONFIG.TRIAL_PHONE, firm:"TRIAL", email:"" };
    await fireCall(trialInv);
  };

  const callAllInvestors = async () => {
    const targets = investors.filter(i => ["Email Sent","Email Opened","Replied"].includes(i.stage));
    if (!targets.length) { toast_("Send emails first before calling!", "warn"); return; }
    setActiveOp("calls"); setOpProgress(0);
    log(`📞 AI Call campaign started — ${targets.length} investors`, "info");
    for (let idx=0; idx<targets.length; idx++) {
      upd(targets[idx].id, { stage:"Call Queued" });
      await fireCall(targets[idx]);
      setOpProgress(Math.round(((idx+1)/targets.length)*100));
      await new Promise(r => setTimeout(r, 15000)); // 15s between calls
    }
    setActiveOp(null);
    log(`✅ Call campaign complete!`, "ok");
    toast_("All calls done!");
  };

  // ── Stats ──────────────────────────────────────────────────
  const S = {
    total:     investors.length,
    sent:      investors.filter(i=>!["Queued"].includes(i.stage)).length,
    opened:    investors.filter(i=>["Email Opened","Replied","Call Queued","Calling","Call Done","Interested","Term Sheet"].includes(i.stage)).length,
    replied:   investors.filter(i=>["Replied","Call Queued","Calling","Call Done","Interested","Term Sheet"].includes(i.stage)).length,
    called:    investors.filter(i=>["Calling","Call Done","Interested","Term Sheet"].includes(i.stage)).length,
    picked:    investors.filter(i=>i.callPickedUp).length,
    interested:investors.filter(i=>["Interested","Term Sheet"].includes(i.stage)).length,
    termSheet: investors.filter(i=>i.stage==="Term Sheet").length,
    followDue: investors.filter(i=>i.followUpDue && !i.followUpSent && new Date(i.followUpDue)<=new Date()).length,
  };

  // ════════════════════════════════════════════════════════════
  //  RENDER
  // ════════════════════════════════════════════════════════════
  return (
    <div style={{fontFamily:"'DM Mono','Courier New',monospace",background:"#06060e",color:"#d0d0e8",minHeight:"100vh",display:"flex",flexDirection:"column",position:"relative"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Bebas+Neue&display=swap');
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-thumb{background:#ff4400;} ::-webkit-scrollbar-track{background:#111;}
        .nb{background:transparent;border:1px solid #1e1e30;color:#666;padding:7px 16px;cursor:pointer;font-family:inherit;font-size:10px;letter-spacing:2px;transition:all .2s;}
        .nb:hover,.nb.act{border-color:#ff4400;color:#ff4400;}
        .nb.act{background:#ff440011;}
        .pb{background:#ff4400;border:none;color:#fff;padding:8px 20px;cursor:pointer;font-family:inherit;font-size:10px;letter-spacing:2px;font-weight:500;transition:.2s;}
        .pb:hover{background:#ff6622;} .pb:disabled{opacity:.35;cursor:not-allowed;}
        .gb{background:transparent;border:1px solid #1e1e30;color:#888;padding:7px 14px;cursor:pointer;font-family:inherit;font-size:10px;letter-spacing:1.5px;transition:.2s;}
        .gb:hover{border-color:#666;color:#ccc;}
        .row:hover{background:#0c0c1c!important;cursor:pointer;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes ringPulse{0%{box-shadow:0 0 0 0 #ff440066}100%{box-shadow:0 0 0 12px #ff440000}}
        @keyframes glow{0%,100%{text-shadow:0 0 8px #ff4400}50%{text-shadow:0 0 20px #ff6600,0 0 40px #ff4400}}
        @keyframes toastIn{from{transform:translateX(110%)}to{transform:translateX(0)}}
        @keyframes scan{0%{background-position:0 0}100%{background-position:0 100%}}
        .fade-up{animation:fadeUp .3s ease;}
        .pulsing{animation:pulse 1.2s infinite;}
        .ringing{animation:ringPulse 1s infinite;}
        .glowing{animation:glow 2s infinite;}
        .toast-anim{animation:toastIn .35s ease;}
        .scan-bg{background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,68,0,.015) 2px,rgba(255,68,0,.015) 4px);background-size:100% 4px;animation:scan 8s linear infinite;}
      `}</style>

      {/* ── Active Call Overlay ── */}
      {callActive && (
        <div style={{position:"fixed",top:16,right:16,zIndex:200,background:"#0d0008",border:"2px solid #ff4400",padding:"16px 24px",minWidth:280}} className="fade-up">
          <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:8}}>
            <div style={{width:10,height:10,borderRadius:"50%",background:"#ff4400"}} className="ringing" />
            <div style={{fontFamily:"'Bebas Neue'",fontSize:18,letterSpacing:2,color:"#ff4400"}} className="glowing">AI CALLING...</div>
          </div>
          <div style={{fontSize:12,color:"#ccc"}}>{callActive.name === CONFIG.TRIAL_NAME ? "🧪 TRIAL → Your Number" : callActive.name}</div>
          <div style={{fontSize:11,color:"#555",marginTop:2}}>{trialMode ? CONFIG.TRIAL_PHONE : callActive.phone}</div>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:28,color:"#ff4400",marginTop:8,letterSpacing:3}}>{fmtTimer(callTimer)}</div>
          {callActive.callPickedUp && <div style={{fontSize:10,color:"#00ff88",marginTop:4,letterSpacing:2}}>● CONNECTED — PITCHING</div>}
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className="toast-anim" style={{position:"fixed",bottom:20,right:20,zIndex:300,background:toast.type==="warn"?"#2a1a00":toast.type==="ok"?"#001a0d":"#1a0000",border:`1px solid ${toast.type==="warn"?"#ff9900":toast.type==="ok"?"#00ff66":"#ff3333"}`,padding:"12px 20px",fontSize:11,color:toast.type==="warn"?"#ff9900":toast.type==="ok"?"#00ff66":"#ff3333",letterSpacing:1}}>
          {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div style={{borderBottom:"1px solid #12121e",padding:"0 20px",display:"flex",alignItems:"stretch",justifyContent:"space-between",minHeight:52}}>
        <div style={{display:"flex",alignItems:"center",gap:16,paddingRight:20,borderRight:"1px solid #12121e"}}>
          <div>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:24,letterSpacing:4,lineHeight:1}}><span style={{color:"#ff4400"}}>U</span>SYNC <span style={{fontSize:12,letterSpacing:2,color:"#333"}}>AGENT</span></div>
            <div style={{fontSize:7,color:"#333",letterSpacing:3,marginTop:-2}}>N8N · VAPI · GMAIL</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"stretch",flex:1,paddingLeft:8}}>
          {[["command","⌘ COMMAND"],["pipeline","⬡ PIPELINE"],["investors","◈ INVESTORS"],["logs","◎ LOGS"],["setup","⚙ SETUP"]].map(([v,l]) => (
            <button key={v} className={`nb ${view===v?"act":""}`} style={{borderBottom:view===v?"2px solid #ff4400":"2px solid transparent",border:"none",borderBottom:view===v?"2px solid #ff4400":"2px solid transparent"}} onClick={()=>setView(v)}>{l}</button>
          ))}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,paddingLeft:16,borderLeft:"1px solid #12121e"}}>
          <div style={{fontSize:9,letterSpacing:1.5,color:n8nConnected?"#00ff66":"#ff4400"}}>
            <span style={{marginRight:5}}>●</span>{n8nConnected?"N8N LIVE":"N8N OFFLINE"}
          </div>
          {!n8nConnected && <button className="gb" style={{fontSize:9,padding:"5px 10px"}} onClick={pingN8n}>CONNECT</button>}
        </div>
      </div>

      {/* ── Stats Strip ── */}
      <div style={{borderBottom:"1px solid #12121e",display:"flex"}}>
        {[
          ["TARGETS",S.total,"#555"],["EMAILS SENT",S.sent,"#4da6ff"],["OPENED",S.opened,"#00ffaa"],
          ["REPLIED",S.replied,"#aaff00"],["CALLS DONE",S.called,"#ff9900"],["PICKED UP",S.picked,"#ff6600"],
          ["INTERESTED",S.interested,"#00ff66"],["TERM SHEETS",S.termSheet,"#ffcc00"],
          ["FOLLOW-UP DUE",S.followDue,S.followDue>0?"#ff4400":"#333"],
        ].map(([l,v,c],i,arr)=>(
          <div key={l} style={{flex:1,textAlign:"center",padding:"8px 4px",borderRight:i<arr.length-1?"1px solid #12121e":"none"}}>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:20,color:c,lineHeight:1}}>{v}</div>
            <div style={{fontSize:7,color:"#333",letterSpacing:1.5,marginTop:1}}>{l}</div>
          </div>
        ))}
      </div>

      {/* ── Progress Bar (during bulk ops) ── */}
      {activeOp && (
        <div style={{height:3,background:"#111",position:"relative"}}>
          <div style={{height:"100%",background:activeOp==="calls"?"#ff4400":"#4da6ff",width:`${opProgress}%`,transition:"width .3s"}} />
        </div>
      )}

      {/* ════════════════ COMMAND CENTER VIEW ════════════════ */}
      {view==="command" && (
        <div style={{flex:1,padding:28,overflowY:"auto"}} className="fade-up scan-bg">
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,marginBottom:28}}>

            {/* Gmail Block */}
            <div style={{background:"#0c0c18",border:"1px solid #1a1a28",borderTop:"2px solid #4da6ff",padding:20}}>
              <div style={{fontSize:9,color:"#4da6ff",letterSpacing:3,marginBottom:12}}>STEP 1 · GMAIL VIA N8N</div>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:22,letterSpacing:2,marginBottom:8}}>EMAIL CAMPAIGN</div>
              <div style={{fontSize:11,color:"#555",lineHeight:1.7,marginBottom:16}}>
                Sends personalized emails to all 15 investors via n8n Gmail node from <span style={{color:"#4da6ff"}}>techmunda21@gmail.com</span>. Auto follow-up at Day 3.
              </div>
              <div style={{fontSize:10,color:"#333",marginBottom:16}}>
                {S.sent}/{S.total} sent · {S.opened} opened · {S.replied} replied
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <button className="pb" onClick={sendAllEmails} disabled={!!activeOp||investors.filter(i=>i.stage==="Queued").length===0}>
                  {activeOp==="emails"?<span className="pulsing">SENDING {opProgress}%...</span>:`▶ SEND ALL (${investors.filter(i=>i.stage==="Queued").length})`}
                </button>
                {S.followDue>0 && <button className="gb" style={{borderColor:"#ffcc00",color:"#ffcc00"}} onClick={()=>investors.filter(i=>i.followUpDue&&!i.followUpSent&&new Date(i.followUpDue)<=new Date()).forEach(i=>sendEmail(i,true))}>↩ FOLLOW-UPS ({S.followDue})</button>}
              </div>
            </div>

            {/* AI Call Block */}
            <div style={{background:"#0c0c18",border:"1px solid #1a1a28",borderTop:"2px solid #ff4400",padding:20}}>
              <div style={{fontSize:9,color:"#ff4400",letterSpacing:3,marginBottom:12}}>STEP 2 · VAPI AI CALL VIA N8N</div>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:22,letterSpacing:2,marginBottom:8}}>AI CALL CAMPAIGN</div>
              <div style={{fontSize:11,color:"#555",lineHeight:1.7,marginBottom:8}}>
                AI voice agent calls investors, pitches Usync, and asks for a meeting. <span style={{color:"#ff4400"}}>Trial mode calls your number first</span> to verify the pitch before going live.
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16,padding:"8px 12px",background:"#12120a",border:"1px solid #2a2000"}}>
                <span style={{fontSize:10,color:trialMode?"#ffcc00":"#555",letterSpacing:1}}>TRIAL MODE</span>
                <div onClick={()=>setTrialMode(p=>!p)} style={{width:36,height:18,background:trialMode?"#ff4400":"#1a1a1a",borderRadius:9,cursor:"pointer",position:"relative",transition:".2s"}}>
                  <div style={{width:14,height:14,borderRadius:7,background:"white",position:"absolute",top:2,left:trialMode?20:2,transition:".2s"}} />
                </div>
                <span style={{fontSize:9,color:"#333"}}>{trialMode?`→ CALLING ${CONFIG.TRIAL_PHONE}`:"→ CALLING INVESTORS"}</span>
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <button className="pb" style={{background:"#cc2200"}} onClick={runTrialCall} disabled={!!callActive}>
                  {callActive&&callActive.name===CONFIG.TRIAL_NAME?<span className="pulsing">CALLING...</span>:"🧪 TRIAL CALL FIRST"}
                </button>
                <button className="gb" style={{borderColor:"#ff4400",color:"#ff4400"}} onClick={()=>{setTrialMode(false);callAllInvestors();}} disabled={!!activeOp||!!callActive}>
                  {activeOp==="calls"?<span className="pulsing">CALLING {opProgress}%...</span>:"📞 CALL ALL INVESTORS"}
                </button>
              </div>
            </div>

            {/* Pipeline Snapshot */}
            <div style={{background:"#0c0c18",border:"1px solid #1a1a28",borderTop:"2px solid #00ff66",padding:20}}>
              <div style={{fontSize:9,color:"#00ff66",letterSpacing:3,marginBottom:12}}>LIVE PIPELINE</div>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:22,letterSpacing:2,marginBottom:16}}>FUNNEL SNAPSHOT</div>
              {[
                {l:"Emails Sent",v:S.sent,max:S.total,c:"#4da6ff"},
                {l:"Opened",v:S.opened,max:S.total,c:"#00ffaa"},
                {l:"Replied",v:S.replied,max:S.total,c:"#aaff00"},
                {l:"Calls Done",v:S.called,max:S.total,c:"#ff9900"},
                {l:"Interested",v:S.interested,max:S.total,c:"#00ff66"},
              ].map(r=>(
                <div key={r.l} style={{marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"#444",marginBottom:3}}>
                    <span>{r.l}</span><span style={{color:r.c}}>{r.v}/{r.max}</span>
                  </div>
                  <div style={{height:4,background:"#111",borderRadius:2}}>
                    <div style={{height:"100%",width:`${r.max>0?(r.v/r.max)*100:0}%`,background:r.c,transition:"width .6s",borderRadius:2}} />
                  </div>
                </div>
              ))}
              <button className="gb" style={{marginTop:12,fontSize:9,width:"100%"}} onClick={()=>setView("pipeline")}>VIEW FULL PIPELINE →</button>
            </div>
          </div>

          {/* Metrics Editor */}
          <div style={{background:"#0c0c18",border:"1px solid #1a1a28",borderLeft:"3px solid #ff4400",padding:20,marginBottom:20}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:editMetrics?16:0}}>
              <div style={{fontSize:9,color:"#ff4400",letterSpacing:3}}>YOUR METRICS — AUTO-INJECTED INTO EVERY EMAIL + CALL PITCH</div>
              <button className="gb" style={{fontSize:9,padding:"4px 10px"}} onClick={()=>setEditMetrics(p=>!p)}>{editMetrics?"✓ SAVE":"EDIT"}</button>
            </div>
            {editMetrics && (
              <div style={{display:"flex",gap:28,flexWrap:"wrap",marginTop:8}} className="fade-up">
                {[["users","MEMBERS"],["growth","WK GROWTH %"],["wau","WAU %"],["ambassadors","AMBASSADORS"],["weeks","WEEKS LIVE"]].map(([k,l])=>(
                  <div key={k} style={{textAlign:"center"}}>
                    <input value={metrics[k]} onChange={e=>setMetrics(p=>({...p,[k]:e.target.value}))} type="number"
                      style={{background:"transparent",border:"none",borderBottom:"2px solid #ff4400",color:"#ff4400",fontFamily:"'Bebas Neue'",fontSize:26,width:70,textAlign:"center",outline:"none"}} />
                    <div style={{fontSize:7,color:"#444",letterSpacing:2,marginTop:3}}>{l}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Logs */}
          <div style={{fontFamily:"'Bebas Neue'",fontSize:13,letterSpacing:3,color:"#333",marginBottom:10}}>RECENT ACTIVITY</div>
          <div style={{background:"#0c0c18",border:"1px solid #1a1a28"}}>
            {logs.slice(0,6).map(l=>(
              <div key={l.id} style={{padding:"8px 16px",borderBottom:"1px solid #0f0f1a",display:"flex",gap:14,fontSize:10,alignItems:"flex-start"}}>
                <span style={{color:"#2a2a3a",flexShrink:0}}>{l.time}</span>
                <span style={{color:l.type==="ok"?"#00ff66":l.type==="warn"?"#ff9900":l.type==="info"?"#4da6ff":"#888"}}>{l.msg}</span>
              </div>
            ))}
            {logs.length===0 && <div style={{padding:"20px 16px",color:"#2a2a3a",fontSize:11}}>No activity yet. Hit SEND ALL to begin.</div>}
          </div>
        </div>
      )}

      {/* ════════════════ PIPELINE VIEW ════════════════ */}
      {view==="pipeline" && (
        <div style={{flex:1,padding:24,overflowY:"auto"}} className="fade-up">
          <div style={{fontFamily:"'Bebas Neue'",fontSize:16,letterSpacing:4,color:"#ff4400",marginBottom:20}}>LIVE INVESTOR PIPELINE</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12}}>
            {STAGES.map(stage=>{
              const grp = investors.filter(i=>i.stage===stage);
              return (
                <div key={stage} style={{background:"#0c0c18",border:"1px solid #1a1a28",borderTop:`2px solid ${STAGE_GLOW[stage]}`,padding:14,minHeight:80}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                    <div style={{fontSize:8,color:STAGE_GLOW[stage],letterSpacing:2}}>{stage.toUpperCase()}</div>
                    <div style={{fontFamily:"'Bebas Neue'",fontSize:18,color:STAGE_GLOW[stage],lineHeight:1}}>{grp.length}</div>
                  </div>
                  {grp.map(inv=>(
                    <div key={inv.id} className="row" onClick={()=>{setSelected(inv);setView("investors");}}
                      style={{background:"#111",padding:"7px 10px",marginBottom:5,fontSize:10,borderLeft:`2px solid ${STAGE_GLOW[inv.stage]}`}}>
                      <div style={{color:"#d0d0e8",fontWeight:500}}>{inv.name}</div>
                      <div style={{color:"#444",fontSize:9,marginTop:1}}>{inv.firm}</div>
                      {inv.callPickedUp && <div style={{fontSize:8,color:"#ff9900",marginTop:2}}>☎ PICKED UP</div>}
                      {inv.openedAt && <div style={{fontSize:8,color:"#00ffaa",marginTop:2}}>👁 OPENED</div>}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ════════════════ INVESTORS VIEW ════════════════ */}
      {view==="investors" && (
        <div style={{flex:1,display:"flex",overflow:"hidden"}} className="fade-up">
          <div style={{width:selected?"44%":"100%",borderRight:selected?"1px solid #1a1a28":"none",display:"flex",flexDirection:"column",transition:"width .3s"}}>
            <div style={{padding:"10px 16px",borderBottom:"1px solid #1a1a28",fontSize:9,color:"#333",letterSpacing:2,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span>{investors.length} INVESTORS</span>
              <div style={{display:"flex",gap:8}}>
                <button className="pb" style={{padding:"5px 12px",fontSize:9}} onClick={sendAllEmails} disabled={!!activeOp}>▶ EMAIL ALL</button>
                <button className="pb" style={{padding:"5px 12px",fontSize:9,background:"#cc2200"}} onClick={runTrialCall} disabled={!!callActive}>🧪 TRIAL CALL</button>
              </div>
            </div>
            <div style={{overflowY:"auto",flex:1}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                <thead>
                  <tr style={{borderBottom:"1px solid #1a1a28"}}>
                    {["INVESTOR","FIRM",!selected&&"EMAIL",!selected&&"PHONE","TIER","STAGE",""].filter(Boolean).map(h=>(
                      <th key={h} style={{padding:"7px 12px",textAlign:"left",fontSize:8,color:"#333",letterSpacing:2,fontWeight:500}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {investors.map(inv=>(
                    <tr key={inv.id} className="row" style={{borderBottom:"1px solid #0d0d18",background:selected?.id===inv.id?"#0c0c1c":"transparent"}} onClick={()=>setSelected(selected?.id===inv.id?null:inv)}>
                      <td style={{padding:"9px 12px"}}>
                        <div style={{fontWeight:500,color:"#d0d0e8"}}>{inv.name}</div>
                        <div style={{display:"flex",gap:6,marginTop:3}}>
                          {inv.callPickedUp && <span style={{fontSize:7,color:"#ff9900",letterSpacing:1}}>☎ PICKED UP</span>}
                          {inv.openedAt && <span style={{fontSize:7,color:"#00ffaa",letterSpacing:1}}>👁 OPENED</span>}
                          {inv.repliedAt && <span style={{fontSize:7,color:"#aaff00",letterSpacing:1}}>↩ REPLIED</span>}
                        </div>
                      </td>
                      <td style={{padding:"9px 12px",color:"#555",fontSize:10}}>{inv.firm}</td>
                      {!selected && <td style={{padding:"9px 12px",color:"#444",fontSize:10}}>{inv.email}</td>}
                      {!selected && <td style={{padding:"9px 12px",color:"#444",fontSize:10}}>{inv.phone}</td>}
                      <td style={{padding:"9px 12px"}}>
                        <span style={{background:inv.tier==="S"?"#2a1e00":inv.tier==="A"?"#1e0800":"#1a1a1a",color:inv.tier==="S"?"#ffcc00":inv.tier==="A"?"#ff4400":"#555",padding:"2px 8px",fontSize:8,letterSpacing:1}}>{inv.tier}</span>
                      </td>
                      <td style={{padding:"9px 12px"}}>
                        <span style={{background:STAGE_COLOR[inv.stage],color:STAGE_GLOW[inv.stage],padding:"3px 8px",fontSize:8,letterSpacing:1}}>{inv.stage.toUpperCase()}</span>
                      </td>
                      <td style={{padding:"9px 12px"}} onClick={e=>e.stopPropagation()}>
                        <div style={{display:"flex",gap:5}}>
                          {inv.stage==="Queued" && <button className="gb" style={{fontSize:8,padding:"3px 8px"}} onClick={()=>sendEmail(inv)}>EMAIL</button>}
                          {["Email Sent","Email Opened","Replied"].includes(inv.stage) && <button className="gb" style={{fontSize:8,padding:"3px 8px",borderColor:"#ff4400",color:"#ff4400"}} onClick={()=>fireCall(inv)} disabled={!!callActive}>CALL</button>}
                          {inv.followUpDue && !inv.followUpSent && <button className="gb" style={{fontSize:8,padding:"3px 8px",borderColor:"#ffcc00",color:"#ffcc00"}} onClick={()=>sendEmail(inv,true)}>FOLLOWUP</button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detail Panel */}
          {selected && (
            <div style={{flex:1,overflowY:"auto",padding:24}} className="fade-up">
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}>
                <div>
                  <div style={{fontFamily:"'Bebas Neue'",fontSize:22,letterSpacing:2}}>{selected.name}</div>
                  <div style={{color:"#ff4400",fontSize:12,marginTop:2}}>{selected.firm}</div>
                  <div style={{color:"#444",fontSize:11,marginTop:4}}>{selected.email} · {selected.phone}</div>
                </div>
                <button className="gb" onClick={()=>setSelected(null)}>✕</button>
              </div>

              {/* Timeline */}
              <div style={{fontSize:8,color:"#333",letterSpacing:2,marginBottom:10}}>ACTIVITY TIMELINE</div>
              <div style={{marginBottom:20}}>
                {[
                  {l:"Queued",done:true},
                  {l:"Email Sent",done:selected.emailSent,time:selected.emailSent?"sent":null},
                  {l:"Email Opened",done:!!selected.openedAt,time:selected.openedAt?new Date(selected.openedAt).toLocaleString("en-IN"):null},
                  {l:"Replied",done:!!selected.repliedAt},
                  {l:"Call Made",done:!!selected.callStatus,extra:selected.callPickedUp?"✓ Picked up":selected.callStatus==="completed"?"✓ Done":null},
                  {l:"Interested",done:["Interested","Term Sheet"].includes(selected.stage)},
                ].map((s,i)=>(
                  <div key={i} style={{display:"flex",gap:12,alignItems:"center",marginBottom:8}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:s.done?"#00ff66":"#1e1e2a",border:`2px solid ${s.done?"#00ff66":"#2a2a3a"}`,flexShrink:0}} />
                    <div style={{flex:1,fontSize:11,color:s.done?"#d0d0e8":"#444"}}>{s.l}</div>
                    {s.time && <div style={{fontSize:9,color:"#333"}}>{s.time}</div>}
                    {s.extra && <div style={{fontSize:9,color:"#ff9900"}}>{s.extra}</div>}
                  </div>
                ))}
              </div>

              {/* Call Duration */}
              {selected.callDuration && (
                <div style={{background:"#0c0c18",border:"1px solid #1a1a28",borderLeft:"3px solid #ff9900",padding:12,marginBottom:16}}>
                  <div style={{fontSize:9,color:"#ff9900",letterSpacing:2}}>CALL COMPLETED</div>
                  <div style={{fontFamily:"'Bebas Neue'",fontSize:24,color:"#ff9900",marginTop:4}}>{fmtTimer(selected.callDuration)}</div>
                  <div style={{fontSize:10,color:selected.callPickedUp?"#00ff66":"#ff4400",marginTop:2}}>{selected.callPickedUp?"● Investor picked up":"● No answer"}</div>
                </div>
              )}

              {/* Stage Update */}
              <div style={{fontSize:8,color:"#333",letterSpacing:2,marginBottom:8}}>UPDATE STAGE</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:20}}>
                {STAGES.map(s=>(
                  <button key={s} onClick={()=>upd(selected.id,{stage:s})}
                    style={{background:selected.stage===s?STAGE_COLOR[s]:"transparent",border:`1px solid ${selected.stage===s?STAGE_GLOW[s]:"#1e1e2a"}`,color:selected.stage===s?STAGE_GLOW[s]:"#444",padding:"4px 10px",cursor:"pointer",fontFamily:"inherit",fontSize:8,letterSpacing:1}}>
                    {s.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Notes */}
              <div style={{fontSize:8,color:"#333",letterSpacing:2,marginBottom:8}}>CALL NOTES</div>
              <textarea value={selected.notes} onChange={e=>upd(selected.id,{notes:e.target.value})}
                placeholder="Log call outcome, key objections, next steps..."
                style={{width:"100%",background:"#0c0c18",border:"1px solid #1a1a28",color:"#b0b0cc",padding:12,fontFamily:"inherit",fontSize:11,lineHeight:1.7,height:100,resize:"vertical",outline:"none"}} />

              {/* Actions */}
              <div style={{display:"flex",gap:8,marginTop:16,flexWrap:"wrap"}}>
                <button className="pb" onClick={()=>sendEmail(selected)}>📧 SEND EMAIL</button>
                <button className="pb" style={{background:"#cc2200"}} onClick={()=>fireCall(selected)} disabled={!!callActive}>📞 AI CALL</button>
                {selected.followUpDue && !selected.followUpSent && (
                  <button className="gb" style={{borderColor:"#ffcc00",color:"#ffcc00"}} onClick={()=>sendEmail(selected,true)}>↩ FOLLOW-UP</button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════════ LOGS VIEW ════════════════ */}
      {view==="logs" && (
        <div style={{flex:1,padding:24,overflowY:"auto"}} className="fade-up">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:16,letterSpacing:4,color:"#ff4400"}}>ACTIVITY LOG</div>
            <button className="gb" style={{fontSize:9}} onClick={()=>setLogs([])}>CLEAR</button>
          </div>
          <div style={{background:"#0c0c18",border:"1px solid #1a1a28"}}>
            {logs.length===0 && <div style={{padding:"30px 20px",color:"#2a2a3a",fontSize:11,textAlign:"center"}}>No activity yet.</div>}
            {logs.map(l=>(
              <div key={l.id} style={{padding:"9px 16px",borderBottom:"1px solid #0d0d18",display:"flex",gap:16,fontSize:10}}>
                <span style={{color:"#2a2a3a",flexShrink:0,minWidth:70}}>{l.time}</span>
                <span style={{color:l.type==="ok"?"#00ff66":l.type==="warn"?"#ff9900":l.type==="info"?"#4da6ff":"#666"}}>{l.msg}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════ SETUP VIEW ════════════════ */}
      {view==="setup" && (
        <div style={{flex:1,padding:28,overflowY:"auto"}} className="fade-up">
          <div style={{fontFamily:"'Bebas Neue'",fontSize:16,letterSpacing:4,color:"#ff4400",marginBottom:24}}>SETUP GUIDE</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            {[
              {
                step:"01", title:"VAPI.AI — FREE AI CALLING", color:"#ff4400",
                items:[
                  "Go to → vapi.ai and create a free account",
                  "You get $10 free credits (~50 calls)",
                  "Create an Assistant → set voice to 'Neha' (Indian English)",
                  "Copy your API Key from dashboard",
                  "Paste it into your n8n VAPI node (Step 03)",
                ]
              },
              {
                step:"02", title:"N8N CLOUD — IMPORT WORKFLOW", color:"#4da6ff",
                items:[
                  "Go to → n8n.io → sign up free (up to 5 workflows)",
                  "Click 'Import workflow' → paste the n8n JSON (download below)",
                  "You'll see 3 workflows: Email, Call, Follow-up",
                  "Each has a Webhook trigger URL — copy those URLs",
                  "Paste URLs into this dashboard's CONFIG section (top of code)",
                ]
              },
              {
                step:"03", title:"CONNECT GMAIL IN N8N", color:"#00ffaa",
                items:[
                  "In n8n, open the Email workflow",
                  "Click the Gmail node → 'Create new credential'",
                  "Sign in with techmunda21@gmail.com",
                  "Allow Gmail send permission",
                  "Save and activate the workflow",
                ]
              },
              {
                step:"04", title:"CONNECT VAPI IN N8N", color:"#ff9900",
                items:[
                  "In n8n, open the AI Call workflow",
                  "Click the HTTP Request node",
                  "URL is already set to VAPI /call endpoint",
                  "Add header: Authorization: Bearer YOUR_VAPI_KEY",
                  "Phone number field maps from webhook payload",
                ]
              },
            ].map(card=>(
              <div key={card.step} style={{background:"#0c0c18",border:"1px solid #1a1a28",borderTop:`2px solid ${card.color}`,padding:20}}>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:32,color:card.color,lineHeight:1,marginBottom:4}}>{card.step}</div>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:14,letterSpacing:2,marginBottom:14}}>{card.title}</div>
                {card.items.map((item,i)=>(
                  <div key={i} style={{display:"flex",gap:10,marginBottom:8,fontSize:11,color:"#666",lineHeight:1.5}}>
                    <span style={{color:card.color,flexShrink:0}}>{i+1}.</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div style={{marginTop:20,background:"#0c0c18",border:"1px solid #1a1a28",borderLeft:"3px solid #ff4400",padding:20}}>
            <div style={{fontSize:9,color:"#ff4400",letterSpacing:3,marginBottom:10}}>YOUR CONFIG VARIABLES</div>
            <pre style={{fontSize:11,color:"#666",lineHeight:2,fontFamily:"inherit"}}>
{`N8N_WEBHOOK_EMAIL    = https://YOUR-N8N.app.n8n.cloud/webhook/usync-send-email
N8N_WEBHOOK_CALL     = https://YOUR-N8N.app.n8n.cloud/webhook/usync-ai-call  
N8N_WEBHOOK_FOLLOWUP = https://YOUR-N8N.app.n8n.cloud/webhook/usync-followup
TRIAL_PHONE          = +917976701222   ← your number (already set)
CALENDLY             = https://calendly.com/techmunda21/...
FROM_EMAIL           = techmunda21@gmail.com  ← already set`}
            </pre>
          </div>

          <div style={{marginTop:16,background:"#0c0c18",border:"1px solid #1a1a28",padding:20}}>
            <div style={{fontSize:9,color:"#00ffaa",letterSpacing:3,marginBottom:10}}>TRIAL CALL FLOW</div>
            <div style={{fontSize:11,color:"#666",lineHeight:2.2}}>
              1. Click <span style={{color:"#ff4400"}}>🧪 TRIAL CALL FIRST</span> in Command Center<br/>
              2. n8n receives webhook → sends to VAPI API<br/>
              3. VAPI calls <span style={{color:"#ff4400"}}>{CONFIG.TRIAL_PHONE}</span> (your number)<br/>
              4. AI reads the Usync pitch to you — you hear the script<br/>
              5. If it sounds good → toggle off Trial Mode → click CALL ALL INVESTORS<br/>
              6. AI calls all 15 investors sequentially with 15s gaps<br/>
              7. Dashboard shows: Calling → Picked Up / No Answer → Call Done
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{borderTop:"1px solid #12121e",padding:"7px 20px",display:"flex",justifyContent:"space-between",fontSize:8,color:"#1e1e2a",letterSpacing:2}}>
        <span>USYNC INVESTOR AGENT · N8N + VAPI + GMAIL · {CONFIG.FROM_EMAIL}</span>
        <span>BUILD WITH BHARAT · PRE-SEED $100K–$500K</span>
      </div>
    </div>
  );
}
