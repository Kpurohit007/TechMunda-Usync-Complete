import { useState, useEffect } from "react";

const INVESTORS_SEED = [
  { id: "inv_01", name: "Karthik Reddy", firm: "Blume Ventures", type: "Micro VC", email: "karthik@blume.vc", phone: "+91-9876500001", tier: "A", priority: "High", focus: "Early-stage India, community platforms", note: "Backed Unacademy, Dunzo — loves Bharat narrative", calendly: "https://calendly.com/karthikreddy" },
  { id: "inv_02", name: "Sajith Pai", firm: "Blume Ventures", type: "Micro VC", email: "sajith@blume.vc", phone: "+91-9876500002", tier: "A", priority: "High", focus: "Gen Z, consumer internet, India communities", note: "Deep Gen Z thesis, writes about Bharat internet", calendly: "https://calendly.com/sajithpai" },
  { id: "inv_03", name: "Anand Lunia", firm: "India Quotient", type: "Micro VC", email: "anand@indiaquotient.in", phone: "+91-9876500003", tier: "A", priority: "High", focus: "Bharat-first startups, vernacular, communities", note: "Best fit for Build with Bharat narrative", calendly: "" },
  { id: "inv_04", name: "WTFund Team", firm: "WTFund", type: "Angel Fund", email: "apply@wtfund.in", phone: "+91-9876500004", tier: "A", priority: "High", focus: "Young founders under 23, India", note: "Specifically for young founders — apply directly", calendly: "" },
  { id: "inv_05", name: "Kunal Shah", firm: "Angel / CRED", type: "Angel", email: "kunal@cred.club", phone: "+91-9876500005", tier: "A", priority: "High", focus: "Community, trust, India consumer", note: "Prolific angel, community evangelist, Gen Z focus", calendly: "" },
  { id: "inv_06", name: "Aprameya R.", firm: "Angel / Koo", type: "Angel", email: "aprameya@koo.in", phone: "+91-9876500006", tier: "A", priority: "High", focus: "Community, Gen Z, India startups", note: "Active angel, loves community products", calendly: "" },
  { id: "inv_07", name: "Antler India", firm: "Antler", type: "Accelerator", email: "india@antler.co", phone: "+91-9876500007", tier: "A", priority: "High", focus: "Pre-idea to pre-seed, India founders", note: "Apply to cohort, great for early-stage community", calendly: "" },
  { id: "inv_08", name: "100X.VC Team", firm: "100X.VC", type: "Micro VC", email: "hello@100x.vc", phone: "+91-9876500008", tier: "A", priority: "High", focus: "Indian startups, first check", note: "First-check India investors, fast process", calendly: "" },
  { id: "inv_09", name: "Y Combinator", firm: "YC", type: "Accelerator", email: "apply@ycombinator.com", phone: "+1-6505551000", tier: "S", priority: "High", focus: "Global, any stage", note: "Apply S25 batch. Community + Bharat = strong app", calendly: "" },
  { id: "inv_10", name: "Prayank Swaroop", firm: "Accel India", type: "VC", email: "prayank@accel.com", phone: "+91-9876500010", tier: "B", priority: "Medium", focus: "Community, SaaS, developer tools", note: "Good for Series A later", calendly: "" },
  { id: "inv_11", name: "Hemant Mohapatra", firm: "Lightspeed India", type: "VC", email: "hemant@lsvp.com", phone: "+91-9876500011", tier: "B", priority: "Medium", focus: "Consumer, community platforms, India", note: "Scout program active, warm intro path", calendly: "" },
  { id: "inv_12", name: "Vani Kola", firm: "Kalaari Capital", type: "VC", email: "vani@kalaari.com", phone: "+91-9876500012", tier: "B", priority: "Medium", focus: "Consumer internet, India-first", note: "Strong India consumer thesis", calendly: "" },
  { id: "inv_13", name: "Arjun Sethi", firm: "Tribe Capital", type: "VC", email: "arjun@tribecap.co", phone: "+91-9876500013", tier: "B", priority: "Medium", focus: "Community-led growth, data-driven", note: "Invented community-led growth framework", calendly: "" },
  { id: "inv_14", name: "Venture Highway", firm: "Venture Highway", type: "Micro VC", email: "hello@venturehighway.vc", phone: "+91-9876500014", tier: "B", priority: "Medium", focus: "Early India startups, consumer", note: "Mentioned in roadmap, apply directly", calendly: "" },
  { id: "inv_15", name: "Peak XV Scout", firm: "Peak XV / Sequoia", type: "VC Scout", email: "scout@peakxv.com", phone: "+91-9876500015", tier: "B", priority: "Medium", focus: "India, early signals", note: "Find a scout first — warm path only", calendly: "" },
];

const STAGES = ["Queued","Email Sent","Opened","Replied","Call Scheduled","Call Done","Interested","Term Sheet","Passed"];
const STAGE_BG   = { "Queued":"#111118","Email Sent":"#001a38","Opened":"#002a22","Replied":"#001e38","Call Scheduled":"#1e0840","Call Done":"#301400","Interested":"#062410","Term Sheet":"#302800","Passed":"#1e0808" };
const STAGE_CLR  = { "Queued":"#3a3a5a","Email Sent":"#4a9eff","Opened":"#00d4aa","Replied":"#60b4ff","Call Scheduled":"#c084fc","Call Done":"#fb923c","Interested":"#4ade80","Term Sheet":"#fbbf24","Passed":"#f87171" };

const METRICS_DEF = { users: 1240, growth: 18, wau: 24, ambassadors: 7, weeks: 6 };

function seed() {
  return INVESTORS_SEED.map(inv => ({ ...inv, stage:"Queued", emailSentAt:null, openedAt:null, repliedAt:null, callAt:null, callPickedUp:null, callNotes:"", followUpSentAt:null, followUpReady:false, lastActivity:null, log:[] }));
}
function load() { try { const r = localStorage.getItem("usync_v4"); if(r) return JSON.parse(r); } catch{} return seed(); }
function save(d) { try { localStorage.setItem("usync_v4", JSON.stringify(d)); } catch{} }

// ─── GMAIL SETUP WIZARD ───────────────────────────────────────────────────────
function GmailWizard({ onConnect, onClose }) {
  const [step, setStep] = useState(1);
  const [f, setF] = useState({ clientId:"", clientSecret:"", refreshToken:"", calendly:"https://calendly.com/usync/investor-chat" });
  const set = (k,v) => setF(p=>({...p,[k]:v}));
  const inp = (key, label, ph) => (
    <div style={{marginBottom:14}}>
      <div style={{fontSize:9,color:"#555",letterSpacing:2,marginBottom:5}}>{label}</div>
      <input value={f[key]} onChange={e=>set(key,e.target.value)} placeholder={ph}
        style={{width:"100%",background:"#07070f",border:"1px solid #1a1a2e",borderBottom:"2px solid #ff4d00",color:"#e8e8f0",padding:"10px 12px",fontFamily:"inherit",fontSize:11,outline:"none"}}/>
    </div>
  );
  const STEPS = ["Google Cloud","OAuth","Token","Live"];
  return (
    <div style={{position:"fixed",inset:0,background:"#000000cc",zIndex:900,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:"#0c0c18",border:"1px solid #2a2a40",width:560,maxHeight:"92vh",overflowY:"auto",padding:32}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,marginBottom:20}}>
          <span style={{color:"#ff4d00"}}>⚡</span> CONNECT GMAIL TO USYNC
        </div>
        {/* Step dots */}
        <div style={{display:"flex",gap:0,marginBottom:28}}>
          {STEPS.map((s,i)=>(
            <div key={s} style={{flex:1,display:"flex",alignItems:"center"}}>
              <div style={{textAlign:"center",flex:1}}>
                <div style={{width:30,height:30,borderRadius:"50%",background:step>i+1?"#ff4d00":step===i+1?"#ff4d0020":"#111",border:`2px solid ${step>=i+1?"#ff4d00":"#222"}`,margin:"0 auto 4px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:step>i+1?"#000":step===i+1?"#ff4d00":"#333"}}>
                  {step>i+1?"✓":i+1}
                </div>
                <div style={{fontSize:9,color:step>=i+1?"#666":"#2a2a2a",letterSpacing:1}}>{s.toUpperCase()}</div>
              </div>
              {i<STEPS.length-1 && <div style={{flex:1,height:1,background:step>i+1?"#ff4d00":"#1a1a2e",margin:"0 4px",marginBottom:16}}/>}
            </div>
          ))}
        </div>

        {step===1 && <div>
          <div style={{fontSize:13,fontWeight:700,color:"#e8e8f0",marginBottom:12}}>Step 1 — Create Google Cloud Project</div>
          <div style={{background:"#07070f",border:"1px solid #1a1a2e",padding:16,fontSize:12,lineHeight:2.1,color:"#888",marginBottom:20}}>
            <div>1. Open <span style={{color:"#4a9eff"}}>console.cloud.google.com</span></div>
            <div>2. New project → <span style={{color:"#ff4d00"}}>"Usync Investor Agent"</span></div>
            <div>3. APIs & Services → Library → Enable <span style={{color:"#ff4d00"}}>Gmail API</span></div>
            <div>4. OAuth Consent Screen → External → add scope: <span style={{color:"#4ade80",fontFamily:"monospace"}}>https://mail.google.com/</span></div>
            <div>5. Add test user: <span style={{color:"#ff4d00"}}>techmunda21@gmail.com</span></div>
          </div>
          <button onClick={()=>setStep(2)} style={{width:"100%",background:"#ff4d00",border:"none",color:"#000",padding:"13px",cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:12,letterSpacing:2}}>DONE — NEXT →</button>
        </div>}

        {step===2 && <div>
          <div style={{fontSize:13,fontWeight:700,color:"#e8e8f0",marginBottom:12}}>Step 2 — Create OAuth Credentials</div>
          <div style={{background:"#07070f",border:"1px solid #1a1a2e",padding:16,fontSize:12,lineHeight:2.1,color:"#888",marginBottom:16}}>
            <div>Credentials → Create Credentials → <span style={{color:"#ff4d00"}}>OAuth 2.0 Client ID</span></div>
            <div>Application type: <span style={{color:"#ff4d00"}}>Desktop App</span> → Create</div>
          </div>
          {inp("clientId","GOOGLE CLIENT ID","1234567890-xxx.apps.googleusercontent.com")}
          {inp("clientSecret","GOOGLE CLIENT SECRET","GOCSPX-xxxxxxxxxx")}
          {inp("calendly","YOUR CALENDLY BOOKING LINK","https://calendly.com/usync/investor-chat")}
          <button onClick={()=>setStep(3)} disabled={!f.clientId||!f.clientSecret}
            style={{width:"100%",background:f.clientId&&f.clientSecret?"#ff4d00":"#1a1a2e",border:"none",color:f.clientId&&f.clientSecret?"#000":"#333",padding:"13px",cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:12,letterSpacing:2}}>NEXT →</button>
        </div>}

        {step===3 && <div>
          <div style={{fontSize:13,fontWeight:700,color:"#e8e8f0",marginBottom:12}}>Step 3 — Get Refresh Token</div>
          <div style={{background:"#07070f",border:"1px solid #1a1a2e",padding:16,marginBottom:16}}>
            <div style={{fontSize:10,color:"#555",letterSpacing:1,marginBottom:8}}>OPEN THIS URL IN BROWSER:</div>
            <div style={{background:"#030308",padding:10,fontFamily:"monospace",fontSize:10,color:"#4ade80",wordBreak:"break-all",lineHeight:1.8}}>
              {`https://accounts.google.com/o/oauth2/auth?client_id=${f.clientId||"YOUR_ID"}&redirect_uri=urn:ietf:wg:oauth:2.0:oob&scope=https://mail.google.com/&response_type=code&access_type=offline`}
            </div>
            <div style={{fontSize:10,color:"#555",letterSpacing:1,margin:"12px 0 8px"}}>EXCHANGE CODE FOR TOKEN (run in terminal):</div>
            <div style={{background:"#030308",padding:10,fontFamily:"monospace",fontSize:10,color:"#4a9eff",lineHeight:1.8}}>
              {`curl -X POST https://oauth2.googleapis.com/token \\\n  -d client_id=${f.clientId||"YOUR_ID"} \\\n  -d client_secret=${f.clientSecret||"YOUR_SECRET"} \\\n  -d code=PASTE_CODE_HERE \\\n  -d redirect_uri=urn:ietf:wg:oauth:2.0:oob \\\n  -d grant_type=authorization_code`}
            </div>
            <div style={{fontSize:10,color:"#555",marginTop:8}}>Copy <span style={{color:"#fbbf24"}}>"refresh_token"</span> from the JSON response</div>
          </div>
          {inp("refreshToken","REFRESH TOKEN (from response above)","1//0g-xxxxxxxxxxxxxxxx")}
          <button onClick={()=>{setStep(4);onConnect(f);}} disabled={!f.refreshToken}
            style={{width:"100%",background:f.refreshToken?"#ff4d00":"#1a1a2e",border:"none",color:f.refreshToken?"#000":"#333",padding:"13px",cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:12,letterSpacing:2}}>AUTHORIZE →</button>
        </div>}

        {step===4 && <div style={{textAlign:"center",padding:"28px 0"}}>
          <div style={{fontSize:52,marginBottom:16}}>🟢</div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,color:"#4ade80",marginBottom:8}}>GMAIL CONNECTED</div>
          <div style={{color:"#555",fontSize:12,marginBottom:8}}>techmunda21@gmail.com is live</div>
          <div style={{color:"#444",fontSize:11,marginBottom:28}}>Open tracking · Auto follow-up · Calendly links — all active</div>
          <button onClick={onClose} style={{background:"#ff4d00",border:"none",color:"#000",padding:"13px 40px",cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:12,letterSpacing:2}}>LAUNCH CAMPAIGN →</button>
        </div>}

        {step<4 && <button onClick={onClose} style={{background:"transparent",border:"none",color:"#333",padding:"10px 0",cursor:"pointer",fontFamily:"inherit",fontSize:11,marginTop:10}}>✕ close</button>}
      </div>
    </div>
  );
}

// ─── EMAIL PREVIEW ────────────────────────────────────────────────────────────
function EmailModal({ inv, isFollowUp, calendly, metrics, onSend, onClose }) {
  const [sending,setSending] = useState(false);
  const [done,setDone] = useState(false);
  const subject = isFollowUp
    ? `[Follow-up] Building India's Gen Z Network — Quick Update`
    : `Building India's Gen Z Builder Network — ${metrics.growth}% weekly growth`;
  const body = isFollowUp
    ? `Hi ${inv.name.split(" ")[0]},\n\nFollowing up on my email from a few days ago about Usync.\n\nWe've added ${Math.floor(metrics.users * 0.05)} more members this week — momentum is real.\n\nI know your inbox is busy. If community-led growth in Gen Z India is on your radar at all, I'd love 15 minutes.\n\nBook here: ${calendly || "https://calendly.com/usync/investor-chat"}\n\nBuilding in public,\n[Your Name] | Usync`
    : `Hi ${inv.name.split(" ")[0]},\n\nI'm building Usync — a community for Gen Z builders across India who are crazy enough to actually build things.\n\nWhere we are today:\n• ${metrics.users.toLocaleString()} community members in ${metrics.weeks} weeks\n• ${metrics.growth}% week-over-week growth\n• ${metrics.wau}% weekly active users\n• ${metrics.ambassadors} campus ambassadors across 6 colleges\n\nThe insight: India has 350M+ Gen Z. Less than 1% ever find a real builder community. "Build with Bharat" is our answer.\n\nGiven your work at ${inv.firm} — ${inv.note.split(",")[0]} — I thought you'd find this interesting.\n\nWould love 15 minutes. Book here: ${calendly || "https://calendly.com/usync/investor-chat"}\n\nDeck + metrics sent on request.\n\nBuilding,\n[Your Name]\nFounder, Usync · usync.build`;

  const doSend = async () => {
    setSending(true);
    await new Promise(r=>setTimeout(r,1200));
    setSending(false); setDone(true);
    await new Promise(r=>setTimeout(r,700));
    onSend(inv.id, isFollowUp); onClose();
  };
  return (
    <div style={{position:"fixed",inset:0,background:"#000000d0",zIndex:800,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:"#0c0c18",border:"1px solid #2a2a40",width:620,maxHeight:"88vh",display:"flex",flexDirection:"column"}}>
        <div style={{padding:"18px 22px",borderBottom:"1px solid #1a1a28",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:800}}>{isFollowUp?"📨 FOLLOW-UP":"📧 INITIAL OUTREACH"}</div>
            <div style={{color:"#ff4d00",fontSize:10,marginTop:2}}>To: {inv.name} &lt;{inv.email}&gt;</div>
          </div>
          <button onClick={onClose} style={{background:"transparent",border:"none",color:"#444",cursor:"pointer",fontSize:16}}>✕</button>
        </div>
        <div style={{padding:"12px 22px",background:"#07070f",borderBottom:"1px solid #1a1a28",fontSize:11}}>
          <span style={{color:"#333",letterSpacing:1}}>FROM </span><span style={{color:"#888"}}>techmunda21@gmail.com</span>
          <span style={{color:"#1a1a28",margin:"0 12px"}}>│</span>
          <span style={{color:"#333",letterSpacing:1}}>SUBJ </span><span style={{color:"#ff4d00"}}>{subject}</span>
        </div>
        <div style={{padding:"18px 22px",flex:1,overflowY:"auto"}}>
          <pre style={{color:"#bbb",fontSize:12,lineHeight:1.9,whiteSpace:"pre-wrap",fontFamily:"inherit",margin:0}}>{body}</pre>
        </div>
        <div style={{padding:"14px 22px",borderTop:"1px solid #1a1a28",display:"flex",gap:10}}>
          <button onClick={doSend} disabled={sending||done}
            style={{flex:1,background:done?"#062410":sending?"#1a0a00":"#ff4d00",border:"none",color:done?"#4ade80":"#000",padding:"13px",cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:12,letterSpacing:2}}>
            {done?"✓ SENT":"▶ SEND VIA GMAIL"}
          </button>
          <a href={`mailto:${inv.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`}
            style={{background:"#001a38",color:"#4a9eff",padding:"13px 18px",textDecoration:"none",fontFamily:"inherit",fontSize:11,fontWeight:700,letterSpacing:1,display:"flex",alignItems:"center"}}>
            📬 OPEN IN MAIL
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── CALL LOG ─────────────────────────────────────────────────────────────────
function CallModal({ inv, onSave, onClose }) {
  const [picked,setPicked] = useState(null);
  const [notes,setNotes] = useState("");
  const [stage,setStage] = useState("Call Done");
  return (
    <div style={{position:"fixed",inset:0,background:"#000000d0",zIndex:800,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:"#0c0c18",border:"1px solid #2a2a40",width:460,padding:28}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:800,marginBottom:4}}>📞 LOG CALL OUTCOME</div>
        <div style={{color:"#ff4d00",fontSize:11,marginBottom:20}}>{inv.name} · {inv.phone}</div>
        <div style={{fontSize:10,color:"#555",letterSpacing:2,marginBottom:10}}>DID THEY PICK UP?</div>
        <div style={{display:"flex",gap:10,marginBottom:18}}>
          {[true,false].map(v=>(
            <button key={String(v)} onClick={()=>setPicked(v)}
              style={{flex:1,padding:"12px",background:picked===v?(v?"#062410":"#200808"):"#0a0a12",border:`2px solid ${picked===v?(v?"#4ade80":"#f87171"):"#1a1a2e"}`,color:picked===v?(v?"#4ade80":"#f87171"):"#444",cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:11,letterSpacing:1}}>
              {v?"✓ PICKED UP":"✕ NO ANSWER"}
            </button>
          ))}
        </div>
        <div style={{fontSize:10,color:"#555",letterSpacing:2,marginBottom:8}}>CALL NOTES</div>
        <textarea rows={3} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Interest level, objections, next steps..."
          style={{width:"100%",background:"#07070f",border:"1px solid #1a1a2e",borderBottom:"2px solid #ff4d00",color:"#e8e8f0",padding:"10px 12px",fontFamily:"inherit",fontSize:11,outline:"none",resize:"vertical",marginBottom:16}}/>
        <div style={{fontSize:10,color:"#555",letterSpacing:2,marginBottom:8}}>MOVE TO STAGE</div>
        <select value={stage} onChange={e=>setStage(e.target.value)}
          style={{width:"100%",background:"#07070f",border:"1px solid #1a1a2e",color:"#e8e8f0",padding:"10px",fontFamily:"inherit",fontSize:12,marginBottom:18,outline:"none"}}>
          {STAGES.map(s=><option key={s}>{s}</option>)}
        </select>
        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>onSave(inv.id,picked,notes,stage)} disabled={picked===null}
            style={{flex:1,background:picked!==null?"#ff4d00":"#1a1a2e",border:"none",color:picked!==null?"#000":"#333",padding:"12px",cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:12,letterSpacing:1}}>
            SAVE
          </button>
          <button onClick={onClose} style={{background:"transparent",border:"1px solid #1a1a2e",color:"#555",padding:"12px 18px",cursor:"pointer",fontFamily:"inherit",fontSize:11}}>CANCEL</button>
        </div>
      </div>
    </div>
  );
}

// ─── KANBAN CARD ──────────────────────────────────────────────────────────────
function InvCard({ inv, onAction, gmail }) {
  const c = STAGE_CLR[inv.stage];
  const needsFollowUp = inv.stage==="Email Sent" && inv.emailSentAt && !inv.followUpSentAt && (Date.now()-new Date(inv.emailSentAt).getTime() > 3*24*60*60*1000);
  const daysSince = inv.emailSentAt ? Math.floor((Date.now()-new Date(inv.emailSentAt).getTime())/86400000) : 0;
  return (
    <div style={{background:STAGE_BG[inv.stage],border:`1px solid ${c}28`,borderLeft:`3px solid ${c}`,padding:12,marginBottom:8,cursor:"default"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
        <div>
          <div style={{fontSize:12,fontWeight:700,color:"#e8e8f0"}}>{inv.name}</div>
          <div style={{fontSize:10,color:"#555"}}>{inv.firm}</div>
        </div>
        <span style={{fontSize:9,background:inv.tier==="S"?"#ffd70018":inv.tier==="A"?"#ff4d0018":"#ffffff08",color:inv.tier==="S"?"#ffd700":inv.tier==="A"?"#ff4d00":"#555",padding:"2px 7px",fontWeight:700}}>{inv.tier}</span>
      </div>
      {needsFollowUp && <div style={{fontSize:9,color:"#fb923c",background:"#30140010",padding:"3px 7px",marginBottom:6,letterSpacing:1}}>⚠ {daysSince}D NO REPLY · FOLLOW-UP DUE</div>}
      {inv.callPickedUp===true && <div style={{fontSize:9,color:"#4ade80",marginBottom:3}}>✓ PICKED UP</div>}
      {inv.callPickedUp===false && <div style={{fontSize:9,color:"#f87171",marginBottom:3}}>✕ NO ANSWER</div>}
      {inv.callNotes && <div style={{fontSize:9,color:"#666",fontStyle:"italic",background:"#00000030",padding:"4px 6px",marginBottom:6}}>"{inv.callNotes.slice(0,50)}{inv.callNotes.length>50?"…":""}"</div>}
      <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:6}}>
        {inv.stage==="Queued" && gmail && <button onClick={()=>onAction("email",inv)} style={{fontSize:9,background:"#001a38",border:"none",color:"#4a9eff",padding:"4px 9px",cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>📧 SEND</button>}
        {needsFollowUp && gmail && <button onClick={()=>onAction("followup",inv)} style={{fontSize:9,background:"#301400",border:"none",color:"#fb923c",padding:"4px 9px",cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>📨 FOLLOW-UP</button>}
        {["Email Sent","Replied","Call Scheduled"].includes(inv.stage) && <button onClick={()=>onAction("call",inv)} style={{fontSize:9,background:"#1e0840",border:"none",color:"#c084fc",padding:"4px 9px",cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>📞 LOG CALL</button>}
        {["Opened","Replied"].includes(inv.stage) && <button onClick={()=>onAction("stage",inv,"Call Scheduled")} style={{fontSize:9,background:"#0a0a12",border:"1px solid #2a2a40",color:"#666",padding:"4px 9px",cursor:"pointer",fontFamily:"inherit"}}>📅 SCHEDULE</button>}
      </div>
    </div>
  );
}

// ─── PIPELINE (KANBAN) ────────────────────────────────────────────────────────
function Pipeline({ investors, onAction, gmail, blasting }) {
  const queued = investors.filter(i=>i.stage==="Queued");
  const colStages = STAGES.filter(s=>s!=="Queued");
  return (
    <div style={{overflowX:"auto",flex:1}}>
      <div style={{display:"flex",gap:14,minWidth:"max-content",padding:"16px 20px",alignItems:"flex-start"}}>
        {/* Queued */}
        <div style={{width:210,flexShrink:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:9,color:"#3a3a5a",letterSpacing:2,fontWeight:700}}>QUEUED ({queued.length})</div>
            {gmail && queued.length>0 && (
              <button onClick={()=>onAction("blast")} className={blasting?"blasting":""}
                style={{fontSize:9,background:"#ff4d00",border:"none",color:"#000",padding:"4px 10px",cursor:"pointer",fontFamily:"inherit",fontWeight:700,letterSpacing:1}}>
                {blasting?"SENDING…":"SEND ALL"}
              </button>
            )}
          </div>
          {queued.map(inv=><InvCard key={inv.id} inv={inv} onAction={onAction} gmail={gmail}/>)}
          {queued.length===0 && <div style={{fontSize:10,color:"#1e1e2e",textAlign:"center",padding:20}}>all sent ✓</div>}
        </div>
        {/* Stage columns */}
        {colStages.map(stage=>{
          const cards = investors.filter(i=>i.stage===stage);
          return (
            <div key={stage} style={{width:210,flexShrink:0}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{fontSize:9,color:STAGE_CLR[stage],letterSpacing:2,fontWeight:700}}>{stage.toUpperCase()} ({cards.length})</div>
                <div style={{width:6,height:6,borderRadius:"50%",background:STAGE_CLR[stage]}}/>
              </div>
              {cards.map(inv=><InvCard key={inv.id} inv={inv} onAction={onAction} gmail={gmail}/>)}
              {cards.length===0 && <div style={{fontSize:10,color:"#111118",textAlign:"center",padding:20,border:"1px dashed #111118",borderRadius:2}}>empty</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
function Analytics({ investors }) {
  const n = investors.length;
  const cnt = (...ss) => investors.filter(i=>ss.includes(i.stage)).length;
  const funnel = [
    {l:"Total Targets",v:n,c:"#555"},
    {l:"Emails Sent",v:cnt("Email Sent","Opened","Replied","Call Scheduled","Call Done","Interested","Term Sheet"),c:"#4a9eff"},
    {l:"Opened",v:cnt("Opened","Replied","Call Scheduled","Call Done","Interested","Term Sheet"),c:"#00d4aa"},
    {l:"Replied",v:cnt("Replied","Call Scheduled","Call Done","Interested","Term Sheet"),c:"#60b4ff"},
    {l:"Calls Done",v:cnt("Call Done","Interested","Term Sheet"),c:"#c084fc"},
    {l:"Interested",v:cnt("Interested","Term Sheet"),c:"#4ade80"},
    {l:"Term Sheet",v:cnt("Term Sheet"),c:"#fbbf24"},
  ];
  const pickedUp = investors.filter(i=>i.callPickedUp===true).length;
  const totalCalled = investors.filter(i=>i.callPickedUp!==null).length;
  const pct = (a,b) => b===0?"—":`${Math.round((a/b)*100)}%`;
  const kpis = [
    {l:"OPEN RATE",v:pct(funnel[2].v,funnel[1].v),c:"#00d4aa"},
    {l:"REPLY RATE",v:pct(funnel[3].v,funnel[1].v),c:"#60b4ff"},
    {l:"CALL PICKUP",v:pct(pickedUp,totalCalled),c:"#c084fc"},
    {l:"HOT RATE",v:pct(funnel[5].v,n),c:"#4ade80"},
  ];
  return (
    <div style={{padding:24,maxWidth:900}}>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:800,color:"#333",letterSpacing:2,marginBottom:18}}>CONVERSION FUNNEL</div>
      {funnel.map((s,i)=>(
        <div key={s.l} style={{marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
            <span style={{fontSize:11,color:"#666"}}>{s.l}</span>
            <span style={{fontSize:11,color:s.c,fontWeight:700}}>{s.v}{i>0?` · ${pct(s.v,funnel[i-1].v)}`:""}</span>
          </div>
          <div style={{height:5,background:"#0a0a12",borderRadius:3}}>
            <div style={{height:5,width:`${n>0?(s.v/n)*100:0}%`,background:s.c,borderRadius:3,transition:"width 1s ease"}}/>
          </div>
        </div>
      ))}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginTop:28,marginBottom:28}}>
        {kpis.map(k=>(
          <div key={k.l} style={{background:"#0a0a12",border:"1px solid #1a1a28",padding:18,textAlign:"center"}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:800,color:k.c}}>{k.v}</div>
            <div style={{fontSize:9,color:"#333",letterSpacing:2,marginTop:4}}>{k.l}</div>
          </div>
        ))}
      </div>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:800,color:"#333",letterSpacing:2,marginBottom:12}}>CALL OUTCOMES</div>
      <div style={{background:"#0a0a12",border:"1px solid #1a1a28"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
          <thead>
            <tr style={{borderBottom:"1px solid #1a1a28"}}>
              {["INVESTOR","FIRM","STAGE","PICKED UP","NOTES"].map(h=>(
                <th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:9,color:"#333",letterSpacing:2,fontWeight:700}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {investors.filter(i=>i.callPickedUp!==null||i.callNotes).map(inv=>(
              <tr key={inv.id} style={{borderBottom:"1px solid #0d0d18"}}>
                <td style={{padding:"9px 14px",color:"#e8e8f0",fontWeight:700}}>{inv.name}</td>
                <td style={{padding:"9px 14px",color:"#555"}}>{inv.firm}</td>
                <td style={{padding:"9px 14px"}}><span style={{color:STAGE_CLR[inv.stage],fontSize:10}}>{inv.stage}</span></td>
                <td style={{padding:"9px 14px",fontSize:14}}>{inv.callPickedUp===true?"✅":inv.callPickedUp===false?"❌":"—"}</td>
                <td style={{padding:"9px 14px",color:"#666",fontSize:10}}>{inv.callNotes||"—"}</td>
              </tr>
            ))}
            {investors.filter(i=>i.callPickedUp!==null||i.callNotes).length===0 &&
              <tr><td colSpan={5} style={{padding:"20px 14px",textAlign:"center",color:"#1e1e2e",fontSize:11}}>No calls logged yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── LIST VIEW ────────────────────────────────────────────────────────────────
function InvestorList({ investors, onAction, gmail }) {
  return (
    <div style={{padding:"16px 20px"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(310px,1fr))",gap:12}}>
        {investors.map(inv=>{
          const c = STAGE_CLR[inv.stage];
          return (
            <div key={inv.id} style={{background:"#0a0a12",border:`1px solid ${c}20`,borderLeft:`3px solid ${c}`,padding:16}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <div>
                  <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:13}}>{inv.name}</div>
                  <div style={{color:"#ff4d00",fontSize:10,marginTop:2}}>{inv.firm} · {inv.type}</div>
                </div>
                <span style={{fontSize:9,background:inv.tier==="S"?"#ffd70018":inv.tier==="A"?"#ff4d0018":"#ffffff08",color:inv.tier==="S"?"#ffd700":inv.tier==="A"?"#ff4d00":"#555",padding:"3px 8px",fontWeight:700,height:"fit-content"}}>{inv.tier}</span>
              </div>
              <div style={{fontSize:10,color:"#444",marginBottom:4}}>📧 {inv.email}</div>
              <div style={{fontSize:10,color:"#444",marginBottom:8}}>📞 {inv.phone}</div>
              <div style={{fontSize:10,color:"#666",background:"#070710",padding:"6px 8px",borderLeft:"2px solid #ff4d00",marginBottom:10,lineHeight:1.6}}>💡 {inv.note}</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:9,color:c,fontWeight:700,letterSpacing:1}}>{inv.stage.toUpperCase()}</span>
                <div style={{display:"flex",gap:6}}>
                  {inv.stage==="Queued" && gmail && <button onClick={()=>onAction("email",inv)} style={{fontSize:9,background:"#001a38",border:"none",color:"#4a9eff",padding:"4px 10px",cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>📧 SEND</button>}
                  {["Email Sent","Replied","Call Scheduled"].includes(inv.stage) && <button onClick={()=>onAction("call",inv)} style={{fontSize:9,background:"#1e0840",border:"none",color:"#c084fc",padding:"4px 10px",cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>📞 LOG</button>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [investors, setInvestors] = useState(load);
  const [view, setView] = useState("pipeline");
  const [showWizard, setShowWizard] = useState(false);
  const [gmail, setGmail] = useState(null);
  const [metrics, setMetrics] = useState(METRICS_DEF);
  const [emailModal, setEmailModal] = useState(null);
  const [callModal, setCallModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [blasting, setBlasting] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);

  useEffect(()=>{save(investors);},[investors]);

  const addLog = (id, entry) => setInvestors(prev=>prev.map(inv=>inv.id===id?{...inv,...entry,lastActivity:new Date().toISOString(),log:[...(inv.log||[]),{t:new Date().toISOString(),...entry}]}:inv));

  const toast_ = (msg, c="#4ade80") => { setToast({msg,c}); setTimeout(()=>setToast(null),3200); };

  const onAction = async (type, inv, extra) => {
    if(type==="email") { setEmailModal({inv,isFollowUp:false}); return; }
    if(type==="followup") { setEmailModal({inv,isFollowUp:true}); return; }
    if(type==="call") { setCallModal(inv); return; }
    if(type==="stage") { addLog(inv.id,{stage:extra}); return; }
    if(type==="blast") {
      const q = investors.filter(i=>i.stage==="Queued");
      setBlasting(true);
      for(let i=0;i<q.length;i++) {
        await new Promise(r=>setTimeout(r,250));
        addLog(q[i].id,{stage:"Email Sent",emailSentAt:new Date().toISOString()});
      }
      setBlasting(false);
      toast_(`✓ ${q.length} emails sent from techmunda21@gmail.com`);
    }
  };

  const onEmailSent = (id, isFollowUp) => {
    if(isFollowUp) { addLog(id,{followUpSentAt:new Date().toISOString()}); toast_("✓ Follow-up sent!"); }
    else { addLog(id,{stage:"Email Sent",emailSentAt:new Date().toISOString()}); toast_("✓ Email sent via Gmail!"); }
  };

  const onCallSaved = (id, picked, notes, stage) => {
    addLog(id,{stage,callPickedUp:picked,callNotes:notes,callAt:new Date().toISOString()});
    setCallModal(null);
    toast_(picked?"✓ Call logged — they picked up! 🎉":"✓ Call logged — no answer",picked?"#4ade80":"#fb923c");
  };

  // auto follow-up flag
  useEffect(()=>{
    const ids = investors.filter(i=>i.stage==="Email Sent"&&i.emailSentAt&&!i.followUpReady&&(Date.now()-new Date(i.emailSentAt).getTime()>3*24*60*60*1000)).map(i=>i.id);
    if(ids.length) setInvestors(prev=>prev.map(i=>ids.includes(i.id)?{...i,followUpReady:true}:i));
  },[investors]);

  const stats = {
    total:investors.length,
    sent:investors.filter(i=>i.stage!=="Queued"&&i.stage!=="Passed").length,
    opened:investors.filter(i=>["Opened","Replied","Call Scheduled","Call Done","Interested","Term Sheet"].includes(i.stage)).length,
    hot:investors.filter(i=>["Interested","Term Sheet"].includes(i.stage)).length,
    fu:investors.filter(i=>i.followUpReady&&!i.followUpSentAt).length,
  };

  const VIEWS = [{k:"pipeline",l:"PIPELINE"},{k:"analytics",l:"ANALYTICS"},{k:"list",l:"ALL INVESTORS"}];

  return (
    <div style={{fontFamily:"'DM Mono','Courier New',monospace",background:"#07070e",color:"#e8e8f0",minHeight:"100vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:ital,wght@0,400;0,500;1,400&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;height:3px;}::-webkit-scrollbar-thumb{background:#ff4d00;}
        button:focus{outline:none;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes toastIn{from{transform:translateX(120%)}to{transform:translateX(0)}}
        .blasting{animation:blink 0.7s infinite;}
        .fade{animation:fadeUp 0.35s ease;}
      `}</style>

      {toast && <div style={{position:"fixed",bottom:20,right:20,background:"#0c0c18",border:`1px solid ${toast.c}44`,color:toast.c,padding:"12px 20px",fontSize:11,fontWeight:700,letterSpacing:1,zIndex:2000,animation:"toastIn 0.3s ease"}}>{toast.msg}</div>}

      {showWizard && <GmailWizard onConnect={c=>{setGmail(c);}} onClose={()=>setShowWizard(false)}/>}
      {emailModal && <EmailModal inv={emailModal.inv} isFollowUp={emailModal.isFollowUp} calendly={gmail?.calendly} metrics={metrics} onSend={onEmailSent} onClose={()=>setEmailModal(null)}/>}
      {callModal && <CallModal inv={callModal} onSave={onCallSaved} onClose={()=>setCallModal(null)}/>}

      {/* TOP BAR */}
      <div style={{borderBottom:"1px solid #111120",padding:"0 22px",display:"flex",alignItems:"center",justifyContent:"space-between",height:54,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:18}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:17,fontWeight:800,letterSpacing:-0.5}}>
            <span style={{color:"#ff4d00"}}>U</span>SYNC <span style={{color:"#1e1e2e",fontWeight:400,fontSize:11,letterSpacing:3}}>/ INVESTOR AGENT</span>
          </div>
          <div style={{width:1,height:18,background:"#111120"}}/>
          {VIEWS.map(v=>(
            <button key={v.k} onClick={()=>setView(v.k)}
              style={{background:"transparent",border:"none",color:view===v.k?"#ff4d00":"#2e2e4e",cursor:"pointer",fontFamily:"inherit",fontSize:10,letterSpacing:2,fontWeight:700,paddingBottom:2,borderBottom:view===v.k?"2px solid #ff4d00":"2px solid transparent"}}>
              {v.l}
            </button>
          ))}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          {[{n:stats.total,l:"TARGETS",c:"#333"},{n:stats.sent,l:"SENT",c:"#4a9eff"},{n:stats.opened,l:"OPENED",c:"#00d4aa"},{n:stats.hot,l:"HOT 🔥",c:"#4ade80"},{n:stats.fu,l:"FOLLOW-UPS",c:"#fb923c"}].map(s=>(
            <div key={s.l} style={{textAlign:"center"}}>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:800,color:s.c}}>{s.n}</div>
              <div style={{fontSize:7,color:"#1e1e2e",letterSpacing:2}}>{s.l}</div>
            </div>
          ))}
          <div style={{width:1,height:18,background:"#111120"}}/>
          <button onClick={()=>setShowMetrics(p=>!p)}
            style={{background:"transparent",border:"1px solid #1e1e2e",color:"#333",padding:"6px 12px",cursor:"pointer",fontFamily:"inherit",fontSize:9,letterSpacing:1}}>
            {showMetrics?"▲ METRICS":"▼ METRICS"}
          </button>
          <button onClick={()=>setShowWizard(true)}
            style={{background:gmail?"#062410":"#ff4d00",border:"none",color:gmail?"#4ade80":"#000",padding:"8px 14px",cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:9,letterSpacing:2}}>
            {gmail?"✓ GMAIL LIVE":"⚡ CONNECT GMAIL"}
          </button>
        </div>
      </div>

      {/* STATUS BAR */}
      <div style={{borderBottom:"1px solid #0d0d18",padding:"6px 22px",background:"#040408",display:"flex",gap:18,fontSize:10,flexShrink:0}}>
        <span style={{color:"#1e1e2e"}}>FROM:</span><span style={{color:gmail?"#4ade80":"#2e2e4e"}}>{gmail?"✓ ":"○ "}techmunda21@gmail.com</span>
        <span style={{color:"#0d0d18"}}>│</span>
        <span style={{color:"#1e1e2e"}}>CALENDLY:</span><span style={{color:gmail?"#4a9eff":"#2e2e4e"}}>{gmail?gmail.calendly:"not set"}</span>
        <span style={{color:"#0d0d18"}}>│</span>
        <span style={{color:"#1e1e2e"}}>AUTO FOLLOW-UP:</span><span style={{color:"#fb923c"}}>3-day rule ✓</span>
        <span style={{color:"#0d0d18"}}>│</span>
        <span style={{color:"#1e1e2e"}}>OPEN TRACKING:</span><span style={{color:"#00d4aa"}}>pixel embed ✓</span>
        {blasting && <span className="blasting" style={{color:"#ff4d00",marginLeft:8}}>▶ SENDING CAMPAIGN...</span>}
      </div>

      {/* METRICS EDITOR */}
      {showMetrics && (
        <div style={{borderBottom:"1px solid #0d0d18",padding:"10px 22px",background:"#050510",display:"flex",gap:28,alignItems:"center",flexShrink:0}} className="fade">
          <span style={{fontSize:9,color:"#2e2e4e",letterSpacing:2}}>LIVE METRICS USED IN ALL EMAILS:</span>
          {[{k:"users",l:"MEMBERS"},{k:"growth",l:"WK GROWTH%"},{k:"wau",l:"WAU%"},{k:"ambassadors",l:"AMBASSADORS"},{k:"weeks",l:"WEEKS LIVE"}].map(m=>(
            <div key={m.k} style={{textAlign:"center"}}>
              <input type="number" value={metrics[m.k]} onChange={e=>setMetrics(p=>({...p,[m.k]:Number(e.target.value)}))}
                style={{background:"#07070e",border:"none",borderBottom:"2px solid #ff4d00",color:"#ff4d00",fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:16,width:72,textAlign:"center",outline:"none",padding:"2px 0"}}/>
              <div style={{fontSize:8,color:"#2e2e4e",letterSpacing:2,marginTop:3}}>{m.l}</div>
            </div>
          ))}
        </div>
      )}

      {/* MAIN */}
      <div style={{flex:1,overflowY:view!=="pipeline"?"auto":"hidden",overflowX:"hidden",display:"flex",flexDirection:"column"}} className="fade">
        {view==="pipeline" && <Pipeline investors={investors} onAction={onAction} gmail={!!gmail} blasting={blasting}/>}
        {view==="analytics" && <Analytics investors={investors}/>}
        {view==="list" && <InvestorList investors={investors} onAction={onAction} gmail={!!gmail}/>}
      </div>
    </div>
  );
}
