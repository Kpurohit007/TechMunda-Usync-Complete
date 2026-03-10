import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════
   TECHMUNDA BY USYNC
   Founder: Keshav Purohit
   Co-Founder: Dhananjay Pathak
   ═══════════════════════════════════════════════ */

const CO = {
  name: "TechMunda",
  tagline: "by Usync",
  founder: "Keshav Purohit",
  cofounder: "Dhananjay Pathak",
  email: "techmunda21@gmail.com",
  phone: "+917976701222",
  website: "techmunda.in",
  calendly: "https://calendly.com/techmunda21/discovery-call",
  services: [
    "Web Development & Design",
    "Mobile App Development",
    "AI & Automation Solutions",
    "Digital Marketing & SEO",
    "Cloud Infrastructure & DevOps",
    "Business Process Automation",
    "IT Consulting & Strategy",
    "E-Commerce Solutions",
    "SaaS Product Development",
    "Data Analytics & BI Dashboards",
  ],
};

/* ── 10 unique demo leads ── */
const SEED_LEADS = [
  { id:1,  name:"Rahul Sharma",    company:"Sharma Retail Ltd",      email:"rahul.sharma@sharmaretail.com",  phone:"+919811001001", service:"E-Commerce Solutions",          source:"Demo" },
  { id:2,  name:"Priya Nair",      company:"Nair Hospitality Group", email:"priya.nair@nairhospitality.in",  phone:"+919822002002", service:"Business Process Automation",    source:"Demo" },
  { id:3,  name:"Amit Verma",      company:"Verma Logistics",        email:"amit.verma@vermalogistics.co",   phone:"+919833003003", service:"Cloud Infrastructure & DevOps", source:"Demo" },
  { id:4,  name:"Sneha Joshi",     company:"Joshi Edutech",          email:"sneha.joshi@joshiedutech.com",   phone:"+919844004004", service:"SaaS Product Development",      source:"Demo" },
  { id:5,  name:"Vikram Patel",    company:"Patel Builders",         email:"vikram.patel@patelbuilders.in",  phone:"+919855005005", service:"Web Development & Design",      source:"Demo" },
  { id:6,  name:"Anita Menon",     company:"Menon Foods Pvt Ltd",    email:"anita.menon@menonfoods.com",     phone:"+919866006006", service:"Digital Marketing & SEO",       source:"Demo" },
  { id:7,  name:"Rohan Gupta",     company:"Gupta FinServ",          email:"rohan.gupta@guptafinserv.in",   phone:"+919877007007", service:"Data Analytics & BI Dashboards", source:"Demo" },
  { id:8,  name:"Kavya Reddy",     company:"Reddy Healthcare",       email:"kavya.reddy@reddyhealthcare.com",phone:"+919888008008", service:"Mobile App Development",        source:"Demo" },
  { id:9,  name:"Suresh Kumar",    company:"Kumar Auto Parts",       email:"suresh.kumar@kumarauto.co",      phone:"+919899009009", service:"IT Consulting & Strategy",      source:"Demo" },
  { id:10, name:"Divya Singh",     company:"Singh Textile Mills",    email:"divya.singh@singtextile.com",    phone:"+919810010010", service:"AI & Automation Solutions",     source:"Demo" },
];

const OUTCOMES = [
  { v:"hot",      label:"🔥 Hot Lead",        color:"#ff4400" },
  { v:"warm",     label:"✅ Warm — Send Info", color:"#00cc66" },
  { v:"email_fu", label:"📧 Email Follow-up", color:"#4da6ff" },
  { v:"callback", label:"🕐 Call Back Later", color:"#ffcc00" },
  { v:"voicemail",label:"📞 Voicemail Left",  color:"#aa66ff" },
  { v:"cold",     label:"❌ Not Interested",  color:"#ff3333" },
  { v:"wrong",    label:"🚫 Wrong Contact",   color:"#555"    },
];

function scoreOf(l) {
  let s = 40;
  if (l.email && l.phone) s += 20; else if (l.email || l.phone) s += 5;
  if (l.company) s += 10;
  if (l.service) s += 10;
  if (l.outcome === "hot")  s += 20;
  if (l.outcome === "warm") s += 10;
  if (l.outcome === "cold" || l.outcome === "wrong") s -= 20;
  if (l.emailSent && l.callDone) s += 10;
  return Math.max(0, Math.min(100, s));
}

function mkLead(raw, src) {
  const base = {
    channel:"both", status:"queued", outcome:null,
    emailSent:false, callDone:false, callDuration:0,
    emailAt:null, callAt:null, notes:"",
    source: src || raw.source || "manual",
  };
  const l = { ...base, ...raw };
  l.leadScore = scoreOf(l);
  return l;
}

/* ── dedup by email OR phone ── */
function dedup(existing, incoming) {
  const emails = new Set(existing.map(l => (l.email || "").toLowerCase()).filter(Boolean));
  const phones = new Set(existing.map(l => (l.phone || "").replace(/\D/g, "")).filter(Boolean));
  return incoming.filter(r => {
    const em = (r.email || "").toLowerCase();
    const ph = (r.phone || "").replace(/\D/g, "");
    if (em && emails.has(em)) return false;
    if (ph && phones.has(ph)) return false;
    if (em) emails.add(em);
    if (ph) phones.add(ph);
    return true;
  });
}

/* ── CSV parser ── */
function parseCSV(text) {
  const lines = text.trim().split("\n").filter(Boolean);
  if (lines.length < 2) return [];
  const hdrs = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/[^a-z]/g,""));
  const col = (row, ...keys) => { for (const k of keys) { const i = hdrs.findIndex(h => h.includes(k)); if (i > -1 && row[i]) return row[i].trim().replace(/^"|"$/g,""); } return ""; };
  return lines.slice(1).map((ln, idx) => {
    const row = ln.split(",").map(c => c.trim().replace(/^"|"$/g,""));
    return {
      id: Date.now() + idx + Math.random(),
      name:    col(row,"name","contact","person") || `Contact ${idx+1}`,
      email:   col(row,"email","mail"),
      phone:   col(row,"phone","mobile","number","tel"),
      company: col(row,"company","org","firm","business"),
      service: col(row,"service","need","product","requirement") || CO.services[idx % CO.services.length],
    };
  }).filter(r => r.name || r.email || r.phone);
}

/* ── XLSX parser (SheetJS via CDN) ── */
async function parseXLSX(file) {
  if (!window.XLSX) {
    await new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
      s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }
  const buf = await file.arrayBuffer();
  const wb = window.XLSX.read(buf);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = window.XLSX.utils.sheet_to_json(ws, { defval:"" });
  return rows.map((row, idx) => {
    const k = (...keys) => { for (const key of keys) { const f = Object.keys(row).find(k2 => k2.toLowerCase().includes(key)); if (f) return String(row[f]).trim(); } return ""; };
    return {
      id: Date.now() + idx + Math.random(),
      name:    k("name","contact","person") || `Row ${idx+1}`,
      email:   k("email","mail"),
      phone:   k("phone","mobile","tel","number"),
      company: k("company","org","firm","business"),
      service: k("service","need","requirement","product") || CO.services[idx % CO.services.length],
    };
  }).filter(r => r.name || r.email || r.phone);
}

/* ── PDF — extract emails+phones from text ── */
async function parsePDF(file) {
  await new Promise((res, rej) => {
    if (window.pdfjsLib) return res();
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    s.onload = () => { window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"; res(); };
    s.onerror = rej;
    document.head.appendChild(s);
  });
  const buf = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: buf }).promise;
  let fullText = "";
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const tc = await page.getTextContent();
    fullText += tc.items.map(i => i.str).join(" ") + "\n";
  }
  const emails = [...new Set([...fullText.matchAll(/[\w.+-]+@[\w-]+\.[a-z]{2,}/gi)].map(m => m[0]))];
  const phones = [...new Set([...fullText.matchAll(/(\+?\d[\d\s\-()]{8,14}\d)/g)].map(m => m[0].replace(/\s+/g," ").trim()))];
  const names  = [...fullText.matchAll(/\b([A-Z][a-z]+ [A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\b/g)].map(m => m[0]).filter(n => !n.match(/^(January|February|March|April|May|June|July|August|September|October|November|December)/));
  const count = Math.max(emails.length, phones.length, 1);
  return Array.from({ length: count }, (_, i) => ({
    id: Date.now() + i + Math.random(),
    name:    names[i] || `PDF Contact ${i+1}`,
    email:   emails[i] || "",
    phone:   phones[i] || "",
    company: "",
    service: CO.services[i % CO.services.length],
  })).filter(r => r.email || r.phone);
}

/* ══════ WAVEFORM ══════ */
function Waveform({ active, color="#ff4400" }) {
  const [h, setH] = useState(() => Array(40).fill(4));
  const raf = useRef();
  useEffect(() => {
    if (!active) { setH(Array(40).fill(4)); return; }
    const tick = () => {
      setH(Array(40).fill(0).map((_, i) => {
        const s = Math.sin(Date.now() * 0.004 + i * 0.55) * 0.5 + 0.5;
        return Math.max(3, Math.min(46, (s + Math.random() * 0.22) * 48));
      }));
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [active]);
  return (
    <div style={{display:"flex",alignItems:"center",gap:2,height:52}}>
      {h.map((v, i) => (
        <div key={i} style={{width:3,height:v,borderRadius:2,background:active?color:"#1a1a2e",transition:active?"height 0.07s":"height 0.4s",opacity:active?0.45+(i/40)*0.55:0.18}}/>
      ))}
    </div>
  );
}

/* ══════ SCORE RING ══════ */
function ScoreRing({ score }) {
  const c = score>=80?"#ff4400":score>=60?"#ffcc00":score>=40?"#4da6ff":"#444";
  const lbl = score>=80?"HOT":score>=60?"WARM":score>=40?"COOL":"COLD";
  return (
    <div style={{textAlign:"center",flexShrink:0}}>
      <div style={{width:38,height:38,borderRadius:"50%",border:`2px solid ${c}22`,background:`${c}11`,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <span style={{fontFamily:"'Bebas Neue'",fontSize:13,color:c}}>{score}</span>
      </div>
      <div style={{fontSize:6,color:c,letterSpacing:1,marginTop:2}}>{lbl}</div>
    </div>
  );
}

/* ══════════════════════════════════════
   MAIN APP
══════════════════════════════════════ */
export default function TechMundaAgent() {
  const [leads, setLeads] = useState(() =>
    SEED_LEADS.map(l => mkLead(l, "Demo"))
  );
  const [view, setView]   = useState("dashboard");
  const [gmailOn, setGmailOn] = useState(false);
  const [phoneOn, setPhoneOn] = useState(false);
  const [logs, setLogs]   = useState([]);
  const [toast, setToast] = useState(null);

  /* import state */
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState("");
  const [importPrev, setImportPrev] = useState([]);
  const [pasteText, setPasteText]  = useState("");
  const pdfRef  = useRef();
  const xlsxRef = useRef();
  const csvRef  = useRef();

  /* call state */
  const [callState, setCallState]   = useState("idle");
  const [activeLead, setActiveLead] = useState(null);
  const [tx, setTx]                 = useState([]);
  const [timer, setTimer]           = useState(0);
  const [outcome, setOutcome]       = useState("");
  const [callNotes, setCallNotes]   = useState("");
  const timerRef = useRef();
  const txRef    = useRef();

  /* filter/search */
  const [search, setSearch] = useState("");
  const [fStatus, setFStatus] = useState("all");

  /* bulk op */
  const [bulkOp, setBulkOp] = useState(null);
  const [bulkPct, setBulkPct] = useState(0);

  /* persist */
  useEffect(() => { try { window.storage?.set("tm-v4-leads", JSON.stringify(leads)); } catch {} }, [leads]);

  useEffect(() => {
    if (callState === "connected") {
      setTimer(0);
      timerRef.current = setInterval(() => setTimer(t => t+1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [callState]);

  useEffect(() => {
    if (txRef.current) txRef.current.scrollTop = txRef.current.scrollHeight;
  }, [tx]);

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  const addLog = useCallback((msg, type="info") =>
    setLogs(p => [{ id:Date.now()+Math.random(), msg, type, t:new Date().toLocaleTimeString("en-IN") }, ...p.slice(0,99)]), []);
  const showToast = useCallback((msg, type="ok") => {
    setToast({msg,type}); setTimeout(() => setToast(null), 3200);
  }, []);
  const addTx = (speaker, text) =>
    setTx(p => [...p, { id:Date.now()+Math.random(), speaker, text, time:new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}) }]);

  const updLead = useCallback((id, patch) =>
    setLeads(p => p.map(l => { if (l.id!==id) return l; const u={...l,...patch}; return {...u,leadScore:scoreOf(u)}; })), []);

  /* ── FILE IMPORT ─────────────────────────────────── */
  const handleFile = async (file, type) => {
    if (!file) return;
    setImporting(true); setImportMsg(`Parsing ${file.name}…`); setImportPrev([]);
    try {
      let rows = [];
      if (type==="csv") {
        rows = parseCSV(await file.text());
      } else if (type==="xlsx") {
        rows = await parseXLSX(file);
      } else if (type==="pdf") {
        setImportMsg("Extracting contacts from PDF…");
        rows = await parsePDF(file);
      }
      if (!rows.length) { setImportMsg("No valid contacts found in file."); setImporting(false); return; }
      const fresh = dedup(leads, rows);
      setImportPrev(fresh);
      setImportMsg(fresh.length
        ? `✓ Found ${fresh.length} new contacts (${rows.length - fresh.length} duplicates removed)`
        : `All ${rows.length} contacts already exist — no duplicates added.`);
    } catch(e) { setImportMsg("Error: " + e.message); }
    setImporting(false);
  };

  const confirmImport = (src) => {
    if (!importPrev.length) return;
    const newLeads = importPrev.map(r => mkLead(r, src || "Import"));
    setLeads(p => [...p, ...newLeads]);
    addLog(`📂 Imported ${newLeads.length} unique leads from ${src}`, "ok");
    showToast(`${newLeads.length} contacts imported!`);
    setImportPrev([]); setImportMsg(""); setPasteText("");
  };

  /* ── EMAIL ───────────────────────────────────────── */
  const sendEmail = useCallback(async (lead) => {
    if (!lead.email) { showToast("No email for this lead","warn"); return; }
    addLog(`📧 Sending email → ${lead.name} <${lead.email}>`, "info");
    await new Promise(r => setTimeout(r, 700 + Math.random()*500));
    updLead(lead.id, { emailSent:true, emailAt:new Date().toISOString(), status:"emailed" });
    addLog(`✓ Email sent to ${lead.name}`, "ok");
  }, [addLog, updLead, showToast]);

  /* ── CALL ────────────────────────────────────────── */
  const startCall = useCallback(async (lead) => {
    if (!lead.phone) { showToast("No phone number","warn"); return; }
    setActiveLead(lead); setCallState("dialing"); setTx([]); setOutcome(""); setCallNotes(""); setTimer(0);
    setView("caller");
    updLead(lead.id, { status:"calling" });
    addLog(`📞 Dialing ${lead.name} (${lead.phone})`, "info");

    addTx("sys", `📞 Calling ${lead.phone} via TechMunda (+917976701222)…`);
    await new Promise(r => setTimeout(r, 1800));
    setCallState("ringing");
    addTx("sys", `Ringing ${lead.name} at ${lead.company || "their number"}…`);
    await new Promise(r => setTimeout(r, 2000));

    const picked = Math.random() > 0.22;
    if (picked) {
      setCallState("connected");
      addTx("sys", "✓ Call connected");
      addLog(`☎ ${lead.name} picked up`, "ok");
      const lines = [
        { sp:"ai",   text:`Hi! Am I speaking with ${lead.name}?` },
        { sp:"lead", text:"Yes, speaking. Who's calling?" },
        { sp:"ai",   text:`Hi ${lead.name.split(" ")[0]}, I'm calling from TechMunda — a tech services company by Keshav Purohit and Dhananjay Pathak. We specialise in ${lead.service || "technology solutions"} for businesses like ${lead.company || "yours"}. Got 60 seconds?` },
        { sp:"lead", text:"Sure, go ahead quickly." },
        { sp:"ai",   text:`We've delivered 50+ projects with an average 40% efficiency improvement. For ${lead.company || "your business"}, our ${lead.service} work could meaningfully cut costs and speed up operations.` },
        { sp:"ai",   text:`Keshav offers a completely free 30-minute tech audit — no cost, no commitment. Just a conversation. Would this week work for a quick call?` },
        { sp:"lead", text: Math.random()>0.4 ? "Sounds interesting. Send me more details first." : "What does it cost roughly?" },
        { sp:"ai",   text:`Absolutely! I'll send our company deck and relevant case studies to ${lead.email || "your email"} right now. And I'll schedule a slot with Keshav — he's very hands-on. Thank you ${lead.name.split(" ")[0]}, have a great day!` },
      ];
      for (const ln of lines) {
        await new Promise(r => setTimeout(r, 350));
        addTx(ln.sp, ln.text);
        await new Promise(r => setTimeout(r, Math.min(3800, ln.text.length * 36)));
      }
      await new Promise(r => setTimeout(r, 1000));
      const oc = Math.random() > 0.38 ? "hot" : "warm";
      setOutcome(oc);
      setCallState("ended");
      updLead(lead.id, { callDone:true, callAt:new Date().toISOString(), callDuration:timer||90, status:"contacted", outcome:oc });
      addLog(`✓ Call done: ${lead.name} → ${oc==="hot"?"🔥 HOT":"✅ WARM"}`, "ok");
    } else {
      setCallState("ended");
      addTx("sys", "⚠ No answer — leaving voicemail");
      addTx("ai", `Hi ${lead.name.split(" ")[0]}, this is TechMunda calling — tech services by Keshav Purohit. We'd love to help ${lead.company||"your business"} with ${lead.service||"tech solutions"}. Please call us back at +917976701222 or visit techmunda.in. Thank you!`);
      await new Promise(r => setTimeout(r, 1400));
      setOutcome("voicemail");
      updLead(lead.id, { callDone:true, callAt:new Date().toISOString(), status:"contacted", outcome:"voicemail" });
      addLog(`📞 Voicemail left for ${lead.name}`, "warn");
    }
  }, [addLog, updLead, showToast, timer]);

  const saveCall = () => {
    if (!activeLead) return;
    updLead(activeLead.id, { outcome, notes:callNotes, status:outcome==="cold"||outcome==="wrong"?"closed":"contacted" });
    setCallState("idle"); setActiveLead(null);
    const next = leads.find(l => l.status==="queued" && l.phone);
    if (next) setTimeout(() => startCall(next), 700);
  };

  /* ── BULK OPS ────────────────────────────────────── */
  const runBulk = async (type) => {
    const targets = leads.filter(l => l.status==="queued" && (type==="email" ? l.email : l.phone));
    if (!targets.length) { showToast("No queued contacts","warn"); return; }
    setBulkOp(type); setBulkPct(0);
    for (let i=0; i<targets.length; i++) {
      if (type==="email") {
        await sendEmail(targets[i]);
      } else {
        updLead(targets[i].id, { callDone:true, status:"contacted", callAt:new Date().toISOString(), outcome:"warm" });
        addLog(`✓ AI called ${targets[i].name}`, "ok");
        await new Promise(r => setTimeout(r, 600));
      }
      setBulkPct(Math.round(((i+1)/targets.length)*100));
      await new Promise(r => setTimeout(r, 800));
    }
    setBulkOp(null);
    showToast(`${type==="email"?"Email":"Call"} campaign done — ${targets.length} contacts`);
    addLog(`✅ Bulk ${type} done — ${targets.length} contacts`, "ok");
  };

  /* ── STATS ───────────────────────────────────────── */
  const ST = {
    total:    leads.length,
    queued:   leads.filter(l=>l.status==="queued").length,
    emailed:  leads.filter(l=>l.emailSent).length,
    called:   leads.filter(l=>l.callDone).length,
    hot:      leads.filter(l=>l.outcome==="hot").length,
    warm:     leads.filter(l=>l.outcome==="warm").length,
    cold:     leads.filter(l=>["cold","wrong"].includes(l.outcome)).length,
    conv:     leads.length ? Math.round(leads.filter(l=>["hot","warm"].includes(l.outcome)).length/leads.length*100) : 0,
    avgScore: leads.length ? Math.round(leads.reduce((a,l)=>a+l.leadScore,0)/leads.length) : 0,
  };

  const filtered = leads.filter(l => {
    const q = search.toLowerCase();
    const ms = !q || [l.name,l.company,l.email,l.phone].some(f=>(f||"").toLowerCase().includes(q));
    const mf = fStatus==="all" || l.status===fStatus || l.outcome===fStatus;
    return ms && mf;
  });

  /* ════════════════════════════════════════
     RENDER
  ════════════════════════════════════════ */
  return (
    <div style={{fontFamily:"'DM Mono','Courier New',monospace",background:"#04040f",color:"#d4d4ec",minHeight:"100vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Bebas+Neue&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;height:3px;} ::-webkit-scrollbar-thumb{background:#ff4400;}
        @keyframes ripple{0%{transform:scale(.6);opacity:.8}100%{transform:scale(1.3);opacity:0}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.25}}
        @keyframes fu{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes toast{from{transform:translateX(110%)}to{transform:translateX(0)}}
        @keyframes glow{0%,100%{text-shadow:0 0 10px currentColor}50%{text-shadow:0 0 26px currentColor}}
        .fu{animation:fu .22s ease;}
        .pulse{animation:pulse 1.3s infinite;}
        .glow{animation:glow 2s infinite;}
        .spin{animation:spin .9s linear infinite;}
        .toast-in{animation:toast .25s ease;}

        .nav{background:transparent;border:none;border-bottom:2px solid transparent;color:#2a2a44;padding:11px 18px;cursor:pointer;font-family:inherit;font-size:9px;letter-spacing:2.5px;transition:.15s;}
        .nav:hover{color:#666;} .nav.a{color:#ff4400;border-bottom-color:#ff4400;}

        .btnp{background:#ff4400;border:none;color:#fff;padding:8px 20px;cursor:pointer;font-family:inherit;font-size:10px;letter-spacing:2px;transition:.15s;}
        .btnp:hover{background:#ff5511;} .btnp:disabled{opacity:.3;cursor:not-allowed;}
        .btng{background:transparent;border:1px solid #1e1e34;color:#555;padding:7px 16px;cursor:pointer;font-family:inherit;font-size:10px;letter-spacing:1.5px;transition:.15s;}
        .btng:hover{border-color:#555;color:#bbb;}
        .btns{background:transparent;border:none;color:#2a2a44;padding:3px 8px;cursor:pointer;font-family:inherit;font-size:9px;transition:.15s;}
        .btns:hover{color:#ff4400;}

        .inp{background:#090918;border:none;border-bottom:2px solid #1a1a30;color:#d4d4ec;padding:8px 12px;font-family:inherit;font-size:11px;outline:none;width:100%;transition:.2s;}
        .inp:focus{border-bottom-color:#ff4400;}
        .inp::placeholder{color:#1e1e34;}
        .sel{background:#090918;border:none;border-bottom:2px solid #1a1a30;color:#d4d4ec;padding:8px 12px;font-family:inherit;font-size:10px;outline:none;cursor:pointer;width:100%;}

        .card{background:#0a0a1a;border:1px solid #181830;}
        .row:hover{background:#0e0e22 !important;}
        .ch{background:transparent;border:1px solid #1e1e34;color:#444;padding:4px 10px;cursor:pointer;font-family:inherit;font-size:8px;letter-spacing:1px;transition:.15s;}
        .ch.a{border-color:#ff4400;color:#ff4400;background:#ff440012;}
        .ch:hover{border-color:#666;color:#888;}

        .drop{border:2px dashed #181830;padding:22px;text-align:center;cursor:pointer;transition:.2s;}
        .drop:hover{border-color:#ff4400;background:#ff440009;}
        .oc{background:transparent;border:1px solid #1e1e34;color:#444;padding:5px 12px;cursor:pointer;font-family:inherit;font-size:9px;letter-spacing:1px;transition:.15s;border-radius:2px;}
        .oc:hover{border-color:#ff4400;color:#ff4400;}
        .oc.s{border-color:var(--c);color:var(--c);background:color-mix(in srgb,var(--c) 10%,transparent);}
        .tn{background:#090918;border:none;border-bottom:2px solid #1a1a30;color:#d4d4ec;padding:9px 12px;font-family:inherit;font-size:11px;resize:vertical;outline:none;width:100%;}
        .tn:focus{border-bottom-color:#ff4400;}
        .tag{padding:2px 8px;font-size:7px;letter-spacing:1.5px;}
        .scan{background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,68,0,.007) 2px,rgba(255,68,0,.007) 3px);}
        .prog{height:2px;background:#0a0a1a;} .prog-fill{height:100%;background:#ff4400;transition:width .3s;}
      `}</style>

      {/* TOAST */}
      {toast && (
        <div className="toast-in" style={{position:"fixed",bottom:18,right:18,zIndex:500,background:toast.type==="warn"?"#1a0e00":toast.type==="ok"?"#001408":"#140000",border:`1px solid ${toast.type==="warn"?"#ff9900":toast.type==="ok"?"#00cc66":"#ff4444"}`,padding:"10px 18px",fontSize:11,color:toast.type==="warn"?"#ff9900":toast.type==="ok"?"#00cc66":"#ff4444",letterSpacing:1}}>
          {toast.msg}
        </div>
      )}

      {/* CALL OVERLAY */}
      {activeLead && callState !== "idle" && callState !== "ended" && (
        <div style={{position:"fixed",top:14,right:14,zIndex:400,background:"#060614",border:"2px solid #ff4400",padding:"12px 18px",minWidth:220}} className="fu">
          <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:5}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:"#ff4400"}} className="pulse"/>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:14,letterSpacing:2,color:"#ff4400"}} className="glow">LIVE CALL</div>
          </div>
          <div style={{fontSize:11}}>{activeLead.name}</div>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:22,color:"#ff4400",letterSpacing:3,marginTop:4}}>{fmt(timer)}</div>
        </div>
      )}

      {/* ── HEADER ── */}
      <div style={{borderBottom:"1px solid #0f0f22",display:"flex",alignItems:"stretch",background:"#060614",minHeight:50}}>
        <div style={{display:"flex",alignItems:"center",gap:12,padding:"0 18px",borderRight:"1px solid #0f0f22"}}>
          <div>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:21,letterSpacing:5,lineHeight:1}}>
              <span style={{color:"#ff4400"}}>TECH</span>MUNDA
              <span style={{fontSize:9,color:"#1a1a34",letterSpacing:2,marginLeft:8}}>BY USYNC</span>
            </div>
            <div style={{fontSize:6,color:"#1e1e34",letterSpacing:2}}>
              KESHAV PUROHIT · DHANANJAY PATHAK
            </div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"stretch",flex:1}}>
          {[["dashboard","⬡ DASHBOARD"],["leads","◈ LEADS"],["import","↑ IMPORT"],["caller","☎ CALLER"],["results","★ RESULTS"],["logs","◎ LOGS"]].map(([v,l]) => (
            <button key={v} className={`nav ${view===v?"a":""}`} onClick={()=>setView(v)}>{l}</button>
          ))}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"0 14px",borderLeft:"1px solid #0f0f22"}}>
          <button className={`ch ${gmailOn?"a":""}`} onClick={()=>{setGmailOn(p=>!p);showToast(gmailOn?"Gmail disconnected":"✓ Gmail: techmunda21@gmail.com","ok");addLog(gmailOn?"Gmail disconnected":"✓ Gmail connected","ok");}}>
            {gmailOn?"✓ GMAIL":"+ GMAIL"}
          </button>
          <button className={`ch ${phoneOn?"a":""}`} onClick={()=>{setPhoneOn(p=>!p);showToast(phoneOn?"Phone disconnected":"✓ Phone: +917976701222","ok");addLog(phoneOn?"Phone disconnected":"✓ VAPI phone connected","ok");}}>
            {phoneOn?"✓ PHONE":"+ PHONE"}
          </button>
          <div style={{width:1,height:24,background:"#1a1a30",margin:"0 4px"}}/>
          <div style={{textAlign:"center"}}>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:16,color:"#ff4400"}}>{ST.conv}%</div>
            <div style={{fontSize:6,color:"#1e1e34",letterSpacing:1.5}}>CONV.</div>
          </div>
        </div>
      </div>

      {/* STAT BAR */}
      <div style={{borderBottom:"1px solid #0f0f22",display:"flex",background:"#06060f"}}>
        {[["LEADS",ST.total,"#3a3a60"],["QUEUED",ST.queued,"#4da6ff"],["EMAILED",ST.emailed,"#00aaee"],["CALLED",ST.called,"#ff9900"],["🔥 HOT",ST.hot,"#ff4400"],["✅ WARM",ST.warm,"#00cc66"],["❄ COLD",ST.cold,"#4466ff"],["CONV%",ST.conv+"%","#ffcc00"],["AVG SCORE",ST.avgScore,"#aa66ff"]].map(([l,v,c],i,a) => (
          <div key={l} style={{flex:1,textAlign:"center",padding:"7px 0",borderRight:i<a.length-1?"1px solid #0f0f22":"none"}}>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:17,color:c,lineHeight:1}}>{v}</div>
            <div style={{fontSize:6,color:"#1e1e34",letterSpacing:1.5,marginTop:1}}>{l}</div>
          </div>
        ))}
      </div>

      {bulkOp && <div className="prog"><div className="prog-fill" style={{width:`${bulkPct}%`}}/></div>}

      {/* ═══════════ DASHBOARD ═══════════ */}
      {view==="dashboard" && (
        <div style={{flex:1,overflowY:"auto",padding:22}} className="fu scan">
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:18}}>

            {/* Import card */}
            <div className="card" style={{borderTop:"2px solid #4da6ff",padding:18}}>
              <div style={{fontSize:7,color:"#4da6ff",letterSpacing:3,marginBottom:8}}>UPLOAD CONTACTS</div>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:17,letterSpacing:2,marginBottom:10}}>PDF · XLSX · CSV</div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                <button className="btnp" style={{fontSize:9,padding:"7px",textAlign:"left"}} onClick={()=>setView("import")}>
                  ↑ OPEN IMPORT PANEL
                </button>
                <div style={{fontSize:9,color:"#333",lineHeight:1.7}}>Auto-deduplicates by email &amp; phone. Extracts name, company, service needed.</div>
              </div>
            </div>

            {/* Gmail card */}
            <div className="card" style={{borderTop:"2px solid #00aaee",padding:18}}>
              <div style={{fontSize:7,color:"#00aaee",letterSpacing:3,marginBottom:8}}>GMAIL OUTREACH</div>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:17,letterSpacing:2,marginBottom:6}}>EMAIL CAMPAIGN</div>
              <div style={{fontSize:9,color:"#333",marginBottom:12}}>{ST.queued} queued · {ST.emailed} sent{!gmailOn&&" · ⚠ Connect Gmail"}</div>
              <div style={{display:"flex",gap:8}}>
                <button className="btnp" style={{fontSize:9}} onClick={()=>runBulk("email")} disabled={!!bulkOp||!gmailOn}>
                  {bulkOp==="email"?<span className="pulse">SENDING {bulkPct}%</span>:"📧 EMAIL ALL"}
                </button>
                {!gmailOn&&<button className="btng" style={{fontSize:9}} onClick={()=>{setGmailOn(true);addLog("✓ Gmail connected","ok");}}>CONNECT</button>}
              </div>
            </div>

            {/* Call card */}
            <div className="card" style={{borderTop:"2px solid #ff4400",padding:18}}>
              <div style={{fontSize:7,color:"#ff4400",letterSpacing:3,marginBottom:8}}>AI CALLING · VAPI</div>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:17,letterSpacing:2,marginBottom:6}}>CALL CAMPAIGN</div>
              <div style={{fontSize:9,color:"#333",marginBottom:12}}>{ST.called} called · {ST.queued} queued{!phoneOn&&" · ⚠ Connect phone"}</div>
              <div style={{display:"flex",gap:8}}>
                <button className="btnp" style={{background:"#cc2200",fontSize:9}} onClick={()=>{const n=leads.find(l=>l.status==="queued"&&l.phone);if(n){setView("caller");startCall(n);}}} disabled={!!bulkOp||!phoneOn}>
                  📞 START CALLS
                </button>
                {!phoneOn&&<button className="btng" style={{fontSize:9}} onClick={()=>{setPhoneOn(true);addLog("✓ Phone connected","ok");}}>CONNECT</button>}
              </div>
            </div>
          </div>

          {/* Pipeline accuracy bar */}
          <div className="card" style={{padding:18,marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:13,letterSpacing:3,color:"#ff4400"}}>LEAD PIPELINE &amp; ACCURACY</div>
              <div style={{fontSize:10,color:"#444"}}>Overall Accuracy: <span style={{color:"#ffcc00",fontFamily:"'Bebas Neue'",fontSize:16}}>{ST.avgScore}/100</span></div>
            </div>
            <div style={{display:"flex",height:60,borderRadius:2,overflow:"hidden",gap:2}}>
              {[
                {l:"HOT",    v:ST.hot,   c:"#ff4400"},
                {l:"WARM",   v:ST.warm,  c:"#00cc66"},
                {l:"EMAIL F/U",v:Math.max(0,ST.emailed-ST.called),c:"#4da6ff"},
                {l:"COLD",   v:ST.cold,  c:"#334488"},
                {l:"QUEUED", v:ST.queued,c:"#222244"},
              ].map(seg => {
                const pct = ST.total ? (seg.v/ST.total)*100 : (100/5);
                return (
                  <div key={seg.l} style={{flex:pct||2,background:seg.c+"22",display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:"0 6px 6px",borderBottom:`3px solid ${seg.c}`,transition:"flex .6s",minWidth:32}}>
                    <div style={{fontFamily:"'Bebas Neue'",fontSize:18,color:seg.c,lineHeight:1}}>{seg.v}</div>
                    <div style={{fontSize:6,color:seg.c+"aa",letterSpacing:1}}>{seg.l}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Service demand + recent leads side by side */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1.6fr",gap:14}}>
            <div className="card" style={{padding:16}}>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:11,letterSpacing:3,color:"#333",marginBottom:12}}>SERVICE DEMAND</div>
              {CO.services.map(svc => {
                const cnt = leads.filter(l=>l.service===svc).length;
                const hot = leads.filter(l=>l.service===svc&&["hot","warm"].includes(l.outcome)).length;
                if (!cnt) return null;
                return (
                  <div key={svc} style={{marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:9,marginBottom:3}}>
                      <span style={{color:hot>0?"#ff4400":"#444"}}>{svc.slice(0,24)}</span>
                      <span style={{color:"#333"}}>{cnt}{hot>0?` · ${hot}🔥`:""}</span>
                    </div>
                    <div style={{height:3,background:"#111",borderRadius:2}}>
                      <div style={{height:"100%",width:`${ST.total?cnt/ST.total*100:0}%`,background:hot>0?"#ff4400":"#2a2a4a",borderRadius:2,transition:"width .5s"}}/>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="card" style={{padding:16}}>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:11,letterSpacing:3,color:"#333",marginBottom:12}}>RECENT LEADS</div>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:10}}>
                <thead><tr style={{borderBottom:"1px solid #0f0f22"}}>
                  {["SCORE","NAME","SERVICE","STATUS"].map(h=>(
                    <th key={h} style={{padding:"5px 8px",textAlign:"left",fontSize:6,color:"#1e1e34",letterSpacing:2,fontWeight:500}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {leads.slice(0,7).map(l=>(
                    <tr key={l.id} className="row" style={{borderBottom:"1px solid #09091a",cursor:"pointer"}} onClick={()=>setView("leads")}>
                      <td style={{padding:"7px 8px"}}><ScoreRing score={l.leadScore}/></td>
                      <td style={{padding:"7px 8px"}}>
                        <div style={{fontWeight:500,fontSize:10}}>{l.name}</div>
                        <div style={{fontSize:8,color:"#2a2a44",marginTop:1}}>{l.company||"—"}</div>
                      </td>
                      <td style={{padding:"7px 8px",color:"#444",fontSize:9}}>{l.service?.slice(0,18)||"—"}</td>
                      <td style={{padding:"7px 8px"}}>
                        {l.outcome
                          ? <span className="tag" style={{background:OUTCOMES.find(o=>o.v===l.outcome)?.color+"22",color:OUTCOMES.find(o=>o.v===l.outcome)?.color}}>{OUTCOMES.find(o=>o.v===l.outcome)?.label}</span>
                          : <span style={{fontSize:8,color:"#2a2a44",letterSpacing:1}}>{l.status.toUpperCase()}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ IMPORT ═══════════ */}
      {view==="import" && (
        <div style={{flex:1,overflowY:"auto",padding:22}} className="fu">
          <div style={{fontFamily:"'Bebas Neue'",fontSize:14,letterSpacing:4,color:"#ff4400",marginBottom:18}}>IMPORT CONTACTS</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:18}}>
            {/* PDF */}
            <div className="card" style={{borderTop:"2px solid #ff4400",padding:18}}>
              <div style={{fontSize:7,color:"#ff4400",letterSpacing:3,marginBottom:10}}>PDF IMPORT</div>
              <div className="drop" onClick={()=>pdfRef.current?.click()} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();handleFile(e.dataTransfer.files[0],"pdf");}}>
                <div style={{fontSize:28,marginBottom:6}}>📄</div>
                <div style={{fontSize:11,color:"#444"}}>Drop PDF or <span style={{color:"#ff4400"}}>click to browse</span></div>
                <div style={{fontSize:8,color:"#1e1e34",marginTop:4}}>Business cards, proposals, contact sheets</div>
              </div>
              <input ref={pdfRef} type="file" accept=".pdf" style={{display:"none"}} onChange={e=>{handleFile(e.target.files[0],"pdf");e.target.value="";}}/>
            </div>

            {/* XLSX */}
            <div className="card" style={{borderTop:"2px solid #00cc66",padding:18}}>
              <div style={{fontSize:7,color:"#00cc66",letterSpacing:3,marginBottom:10}}>EXCEL / XLSX IMPORT</div>
              <div className="drop" onClick={()=>xlsxRef.current?.click()} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();handleFile(e.dataTransfer.files[0],"xlsx");}}>
                <div style={{fontSize:28,marginBottom:6}}>📊</div>
                <div style={{fontSize:11,color:"#444"}}>Drop XLSX/XLS or <span style={{color:"#00cc66"}}>click to browse</span></div>
                <div style={{fontSize:8,color:"#1e1e34",marginTop:4}}>CRM exports, prospect sheets, reports</div>
              </div>
              <input ref={xlsxRef} type="file" accept=".xlsx,.xls" style={{display:"none"}} onChange={e=>{handleFile(e.target.files[0],"xlsx");e.target.value="";}}/>
            </div>

            {/* CSV */}
            <div className="card" style={{borderTop:"2px solid #4da6ff",padding:18}}>
              <div style={{fontSize:7,color:"#4da6ff",letterSpacing:3,marginBottom:10}}>CSV IMPORT</div>
              <div className="drop" onClick={()=>csvRef.current?.click()} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();handleFile(e.dataTransfer.files[0],"csv");}}>
                <div style={{fontSize:28,marginBottom:6}}>📋</div>
                <div style={{fontSize:11,color:"#444"}}>Drop CSV or <span style={{color:"#4da6ff"}}>click to browse</span></div>
                <div style={{fontSize:8,color:"#1e1e34",marginTop:4}}>Any CSV with name, email, phone columns</div>
              </div>
              <input ref={csvRef} type="file" accept=".csv,.txt" style={{display:"none"}} onChange={e=>{handleFile(e.target.files[0],"csv");e.target.value="";}}/>
            </div>
          </div>

          {/* Paste list */}
          <div className="card" style={{padding:18,marginBottom:14}}>
            <div style={{fontSize:7,color:"#333",letterSpacing:3,marginBottom:10}}>PASTE LIST</div>
            <div style={{fontSize:9,color:"#333",marginBottom:10,lineHeight:1.7}}>
              Paste one contact per line — auto-detects email &amp; phone.<br/>
              <span style={{color:"#ff4400"}}>Format:</span> Name, Email, Phone, Company, Service (comma / tab / pipe)
            </div>
            <textarea className="tn" rows={5} value={pasteText} placeholder={"Rahul Sharma, rahul@retail.com, +919811001001, Sharma Retail, E-Commerce\nPriya Nair | priya@hotel.in | +919822002002 | Nair Hotels | Automation"} onChange={e=>{
              setPasteText(e.target.value);
              if (e.target.value.trim()) {
                const rows = parseCSV(e.target.value);
                const fresh = dedup(leads, rows);
                setImportPrev(fresh);
                setImportMsg(fresh.length ? `✓ ${fresh.length} new contacts (${rows.length-fresh.length} duplicates)` : "All duplicates — none to add");
              } else { setImportPrev([]); setImportMsg(""); }
            }}/>
          </div>

          {/* Import status + preview */}
          {(importing || importMsg) && (
            <div className="card fu" style={{padding:14,borderLeft:`3px solid ${importMsg.startsWith("✓")?"#00cc66":"#ff4400"}`,marginBottom:14,display:"flex",alignItems:"center",gap:12}}>
              {importing && <div style={{width:14,height:14,border:"2px solid #ff4400",borderTop:"2px solid transparent",borderRadius:"50%"}} className="spin"/>}
              <div style={{fontSize:11,color:importMsg.startsWith("✓")?"#00cc66":importMsg.startsWith("All dup")?"#ffcc00":"#888"}}>{importMsg}</div>
            </div>
          )}

          {importPrev.length>0 && (
            <div className="card fu" style={{padding:16,marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{fontSize:7,color:"#00cc66",letterSpacing:2}}>PREVIEW — {importPrev.length} CONTACTS TO IMPORT</div>
                <button className="btnp" style={{fontSize:9,padding:"6px 16px"}} onClick={()=>confirmImport(importPrev[0]?.source||"Import")}>
                  ➕ CONFIRM IMPORT ({importPrev.length})
                </button>
              </div>
              <div style={{maxHeight:200,overflowY:"auto"}}>
                {importPrev.map((r,i)=>(
                  <div key={i} style={{padding:"7px 10px",borderBottom:"1px solid #0a0a1a",display:"flex",gap:14,fontSize:9}}>
                    <span style={{minWidth:130,color:"#d4d4ec"}}>{r.name}</span>
                    <span style={{minWidth:170,color:"#4da6ff"}}>{r.email||<span style={{color:"#1e1e34"}}>no email</span>}</span>
                    <span style={{minWidth:130,color:"#888"}}>{r.phone||<span style={{color:"#1e1e34"}}>no phone</span>}</span>
                    <span style={{color:"#444"}}>{r.company||""}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Template */}
          <div className="card" style={{padding:16}}>
            <div style={{fontSize:7,color:"#333",letterSpacing:2,marginBottom:10}}>CSV TEMPLATE</div>
            <div style={{background:"#060614",border:"1px solid #181830",padding:12,fontFamily:"monospace",fontSize:10,color:"#444",lineHeight:2,marginBottom:10}}>
              <span style={{color:"#ff4400"}}>name</span>,<span style={{color:"#4da6ff"}}>email</span>,<span style={{color:"#00cc66"}}>phone</span>,<span style={{color:"#ffcc00"}}>company</span>,<span style={{color:"#aa66ff"}}>service</span><br/>
              Rahul Sharma,rahul@retail.com,+919811001001,Sharma Retail,E-Commerce Solutions<br/>
              Priya Nair,priya@hotel.in,+919822002002,Nair Hotels,Business Process Automation
            </div>
            <button className="btng" style={{fontSize:9}} onClick={()=>{
              const c="name,email,phone,company,service\nRahul Sharma,rahul@retail.com,+919811001001,Sharma Retail,E-Commerce Solutions\nPriya Nair,priya@hotel.in,+919822002002,Nair Hotels,Business Automation\n";
              const a=document.createElement("a");a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(c);a.download="techmunda-contacts-template.csv";a.click();
            }}>⬇ DOWNLOAD TEMPLATE</button>
          </div>
        </div>
      )}

      {/* ═══════════ LEADS TABLE ═══════════ */}
      {view==="leads" && (
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}} className="fu">
          <div style={{padding:"9px 14px",borderBottom:"1px solid #0f0f22",display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
            <input className="inp" style={{width:200}} placeholder="Search name, company, email…" value={search} onChange={e=>setSearch(e.target.value)}/>
            <select className="sel" style={{width:130}} value={fStatus} onChange={e=>setFStatus(e.target.value)}>
              <option value="all">All</option>
              <option value="queued">Queued</option>
              <option value="emailed">Emailed</option>
              <option value="contacted">Contacted</option>
              <option value="hot">Hot</option>
              <option value="warm">Warm</option>
              <option value="cold">Cold</option>
            </select>
            <div style={{flex:1}}/>
            <span style={{fontSize:8,color:"#1e1e34"}}>{filtered.length}/{ST.total}</span>
            <button className="btnp" style={{fontSize:9,padding:"5px 12px"}} onClick={()=>runBulk("email")} disabled={!gmailOn||!!bulkOp}>📧 EMAIL ALL</button>
            <button className="btnp" style={{background:"#cc2200",fontSize:9,padding:"5px 12px"}} onClick={()=>{const n=leads.find(l=>l.status==="queued"&&l.phone);if(n){setView("caller");startCall(n);}}} disabled={!phoneOn}>📞 CALL ALL</button>
            <button className="btng" style={{fontSize:9,padding:"5px 10px"}} onClick={()=>{
              const c="name,email,phone,company,service,status,outcome,leadScore,notes\n"+leads.map(l=>`${l.name},${l.email||""},${l.phone||""},${l.company||""},${l.service||""},${l.status},${l.outcome||""},${l.leadScore},"${l.notes||""}"`).join("\n");
              const a=document.createElement("a");a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(c);a.download="techmunda-leads.csv";a.click();
            }}>⬇ EXPORT</button>
          </div>
          <div style={{flex:1,overflowY:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:10}}>
              <thead>
                <tr style={{borderBottom:"1px solid #0f0f22",position:"sticky",top:0,background:"#04040f",zIndex:1}}>
                  {["ACCURACY","NAME","COMPANY","SERVICE","EMAIL","PHONE","CHANNEL","STATUS / OUTCOME","ACTIONS"].map(h=>(
                    <th key={h} style={{padding:"7px 10px",textAlign:"left",fontSize:6,color:"#1e1e34",letterSpacing:2,fontWeight:500}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(lead=>(
                  <tr key={lead.id} className="row" style={{borderBottom:"1px solid #090918"}}>
                    <td style={{padding:"9px 10px"}}><ScoreRing score={lead.leadScore}/></td>
                    <td style={{padding:"9px 10px"}}>
                      <div style={{fontWeight:500}}>{lead.name}</div>
                      <div style={{fontSize:7,color:"#1e1e34",marginTop:1}}>{lead.source}</div>
                    </td>
                    <td style={{padding:"9px 10px",color:"#444",fontSize:9}}>{lead.company||"—"}</td>
                    <td style={{padding:"9px 10px",color:"#555",fontSize:9,maxWidth:130,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{lead.service||"—"}</td>
                    <td style={{padding:"9px 10px",fontSize:9}}>
                      {lead.email
                        ? <span style={{color:lead.emailSent?"#00aaee":"#3a3a66"}}>{lead.emailSent?"✓ ":""}{lead.email.slice(0,20)}{lead.email.length>20?"…":""}</span>
                        : <span style={{color:"#1a1a2e"}}>—</span>}
                    </td>
                    <td style={{padding:"9px 10px",color:"#3a3a66",fontSize:9}}>{lead.phone||<span style={{color:"#1a1a2e"}}>—</span>}</td>
                    <td style={{padding:"9px 10px"}}>
                      <div style={{display:"flex",gap:4}}>
                        {["call","email","both"].map(ch=>(
                          <button key={ch} className={`ch ${lead.channel===ch?"a":""}`} style={{padding:"2px 6px",fontSize:7}} onClick={()=>updLead(lead.id,{channel:ch})}>
                            {ch==="call"?"📞":ch==="email"?"📧":"⚡"}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td style={{padding:"9px 10px"}}>
                      {lead.outcome
                        ? <span className="tag" style={{background:OUTCOMES.find(o=>o.v===lead.outcome)?.color+"20",color:OUTCOMES.find(o=>o.v===lead.outcome)?.color}}>
                            {OUTCOMES.find(o=>o.v===lead.outcome)?.label}
                          </span>
                        : <span style={{fontSize:8,color:lead.status==="queued"?"#2a2a44":lead.status==="calling"?"#ffaa00":"#4da6ff",letterSpacing:1}}>{lead.status.toUpperCase()}</span>}
                    </td>
                    <td style={{padding:"9px 10px"}}>
                      <div style={{display:"flex",gap:3}}>
                        {lead.email && <button className="btns" onClick={()=>sendEmail(lead)} title="Send Email">📧</button>}
                        {lead.phone && <button className="btns" onClick={()=>{setView("caller");startCall(lead);}} title="Call">📞</button>}
                        <button className="btns" style={{color:"#ff333366"}} onClick={()=>{setLeads(p=>p.filter(l=>l.id!==lead.id));addLog(`🗑 Removed ${lead.name}`,"warn");}}>✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filtered.length && <div style={{padding:"40px 0",textAlign:"center",color:"#1a1a2e",fontSize:11}}>No leads match filter.</div>}
          </div>
        </div>
      )}

      {/* ═══════════ CALLER ═══════════ */}
      {view==="caller" && (
        <div style={{flex:1,display:"grid",gridTemplateColumns:"1fr 320px",overflow:"hidden"}} className="fu scan">
          {/* Left — live call */}
          <div style={{display:"flex",flexDirection:"column",borderRight:"1px solid #0f0f22",overflow:"hidden"}}>
            <div style={{padding:"24px 28px 18px",flexShrink:0}}>
              {!activeLead ? (
                <div style={{textAlign:"center",paddingTop:36}}>
                  <div style={{fontFamily:"'Bebas Neue'",fontSize:52,color:"#111133",letterSpacing:6}}>READY</div>
                  <div style={{fontSize:11,color:"#2a2a44",margin:"12px 0 24px"}}>{leads.find(l=>l.status==="queued"&&l.phone)?`Next: ${leads.find(l=>l.status==="queued"&&l.phone)?.name}`:"All contacts processed"}</div>
                  {leads.find(l=>l.status==="queued"&&l.phone) && (
                    <button className="btnp" style={{fontSize:13,padding:"14px 44px",letterSpacing:3}} onClick={()=>{const n=leads.find(l=>l.status==="queued"&&l.phone);if(n)startCall(n);}}>▶ START CALLING</button>
                  )}
                  {!phoneOn && <div style={{fontSize:10,color:"#ff4400",marginTop:16}}>⚠ Connect phone in header first</div>}
                </div>
              ) : (
                <div>
                  {/* Active call header */}
                  <div style={{display:"flex",gap:18,alignItems:"center",marginBottom:18}}>
                    <div style={{position:"relative",width:76,height:76,flexShrink:0}}>
                      {["ringing","connected"].includes(callState)&&[1,2].map(i=>(
                        <div key={i} style={{position:"absolute",inset:`${-i*14}px`,borderRadius:"50%",border:`1px solid ${callState==="connected"?"#00cc66":"#ff4400"}`,opacity:0,animation:`ripple 1.7s ease-out ${i*0.42}s infinite`}}/>
                      ))}
                      <div style={{width:76,height:76,borderRadius:"50%",background:callState==="connected"?"#001a0a":"#160400",border:`2px solid ${callState==="connected"?"#00cc66":"#ff4400"}`,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",zIndex:1}}>
                        <div style={{fontFamily:"'Bebas Neue'",fontSize:22,color:callState==="connected"?"#00cc66":"#ff4400"}}>
                          {activeLead.name.split(" ").map(w=>w[0]).join("").slice(0,2)}
                        </div>
                      </div>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:"'Bebas Neue'",fontSize:24,letterSpacing:2,lineHeight:1}}>{activeLead.name}</div>
                      <div style={{color:"#ff4400",fontSize:12,marginTop:3}}>{activeLead.company||"—"}</div>
                      <div style={{color:"#333",fontSize:9,marginTop:2,fontStyle:"italic"}}>{activeLead.service}</div>
                      <div style={{marginTop:10,display:"inline-flex",alignItems:"center",gap:8,padding:"4px 12px",border:`1px solid ${callState==="connected"?"#00cc66":"#ff4400"+"66"}`,borderRadius:1}}>
                        <div style={{width:6,height:6,borderRadius:"50%",background:callState==="connected"?"#00cc66":"#ff4400"}} className={callState!=="ended"?"pulse":""}/>
                        <span style={{fontSize:8,color:callState==="connected"?"#00cc66":"#ff4400",letterSpacing:2}}>
                          {callState==="dialing"?"DIALING…":callState==="ringing"?"RINGING…":callState==="connected"?"LIVE":"ENDED"}
                        </span>
                        {callState==="connected"&&<span style={{fontFamily:"'Bebas Neue'",fontSize:15,color:"#00cc66"}}>{fmt(timer)}</span>}
                      </div>
                    </div>
                    <ScoreRing score={activeLead.leadScore}/>
                  </div>

                  {/* Waveform */}
                  <div className="card" style={{padding:"9px 14px",marginBottom:14}}>
                    <div style={{fontSize:6,color:"#1a1a30",letterSpacing:2,marginBottom:3}}>AI VOICE · TECHMUNDA AGENT · {CO.phone}</div>
                    <Waveform active={callState==="connected"} color="#ff4400"/>
                  </div>

                  {/* Outcome picker after call */}
                  {callState==="ended" && (
                    <div className="fu">
                      <div style={{fontSize:7,color:"#333",letterSpacing:2,marginBottom:8}}>CALL OUTCOME</div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}}>
                        {OUTCOMES.map(o=>(
                          <button key={o.v} className={`oc ${outcome===o.v?"s":""}`} style={{"--c":o.color}} onClick={()=>setOutcome(o.v)}>{o.label}</button>
                        ))}
                      </div>
                      <div style={{marginBottom:12}}>
                        <div style={{fontSize:7,color:"#333",letterSpacing:2,marginBottom:5}}>NOTES</div>
                        <textarea className="tn" rows={2} placeholder="Key requirements, objections, next steps…" value={callNotes} onChange={e=>setCallNotes(e.target.value)}/>
                      </div>
                      <div style={{display:"flex",gap:8}}>
                        <button className="btnp" onClick={saveCall} disabled={!outcome}>✓ SAVE &amp; NEXT</button>
                        <button className="btng" onClick={()=>{setCallState("idle");setActiveLead(null);}}>SKIP</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Transcript */}
            {tx.length>0 && (
              <div style={{flex:1,overflowY:"auto",borderTop:"1px solid #0f0f22"}} ref={txRef}>
                <div style={{padding:"8px 14px",borderBottom:"1px solid #0f0f22",display:"flex",justifyContent:"space-between"}}>
                  <div style={{fontSize:6,color:"#1a1a30",letterSpacing:2}}>LIVE TRANSCRIPT</div>
                  {callState==="connected"&&<div style={{fontSize:6,color:"#ff4400",letterSpacing:2}} className="pulse">● REC</div>}
                </div>
                {tx.map(t=>(
                  <div key={t.id} style={{padding:"8px 14px",borderBottom:"1px solid #09091a",display:"flex",gap:10}} className="fu">
                    <div style={{fontSize:7,color:"#1a1a28",flexShrink:0,width:44}}>{t.time}</div>
                    <div>
                      <div style={{fontSize:6,letterSpacing:2,marginBottom:3,color:t.speaker==="ai"?"#ff4400":t.speaker==="lead"?"#00cc66":"#2a2a44"}}>
                        {t.speaker==="ai"?"TECHMUNDA AI":t.speaker==="lead"?(activeLead?.name||"LEAD").toUpperCase():"SYSTEM"}
                      </div>
                      <div style={{fontSize:10,color:t.speaker==="sys"?"#2a2a3a":"#b0b0cc",lineHeight:1.7}}>{t.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right — pitch script */}
          <div style={{overflowY:"auto"}}>
            <div style={{padding:"10px 14px",borderBottom:"1px solid #0f0f22",fontSize:6,color:"#1a1a30",letterSpacing:2}}>TECHMUNDA PITCH SCRIPT</div>
            <div style={{padding:14}}>
              {[
                {step:"OPEN",   text:`Hi! Am I speaking with ${activeLead?.name||"[name]"}?`},
                {step:"HOOK",   text:`Hi ${activeLead?.name?.split(" ")[0]||"there"}, calling from TechMunda — tech services by Keshav Purohit & Dhananjay Pathak. Got 60 seconds?`},
                {step:"PAIN",   text:`We've helped 50+ businesses cut costs and improve efficiency by 40% using ${activeLead?.service||"technology"}.`},
                {step:"PITCH",  text:`For ${activeLead?.company||"your company"} — ${activeLead?.service||"our tech solutions"} could be transformative. We handle everything: Web, App, AI, Cloud, Marketing.`},
                {step:"ASK",    text:`Keshav offers a FREE 30-min tech audit. No commitment. Would this week work?`},
                {step:"CLOSE",  text:`I'll send our deck to ${activeLead?.email||"your email"} now. Thank you ${activeLead?.name?.split(" ")[0]||""}!`},
              ].map((s,i)=>(
                <div key={i} style={{padding:"9px 12px",borderLeft:"3px solid #181830",marginBottom:5,background:"#07071a"}}>
                  <div style={{fontSize:6,color:"#ff4400",letterSpacing:2,marginBottom:3}}>{s.step}</div>
                  <div style={{fontSize:9,color:"#555",lineHeight:1.7}}>{s.text}</div>
                </div>
              ))}
              <div style={{marginTop:14,padding:12,background:"#07071a",borderLeft:"3px solid #ff4400"}}>
                <div style={{fontSize:6,color:"#ff4400",letterSpacing:2,marginBottom:8}}>TECHMUNDA SERVICES</div>
                {CO.services.map((s,i)=>(
                  <div key={i} style={{fontSize:8,color:"#3a3a5a",marginBottom:4,display:"flex",gap:6}}>
                    <span style={{color:"#ff4400"}}>▸</span>{s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ RESULTS ═══════════ */}
      {view==="results" && (
        <div style={{flex:1,overflowY:"auto",padding:22}} className="fu">
          {/* Header */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
            <div>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:28,letterSpacing:5,color:"#ff4400"}}>FINAL RESULTS</div>
              <div style={{fontSize:9,color:"#333",marginTop:2}}>TECHMUNDA BY USYNC · KESHAV PUROHIT &amp; DHANANJAY PATHAK</div>
              <div style={{fontSize:9,color:"#2a2a44",marginTop:1}}>techmunda21@gmail.com · +917976701222 · techmunda.in</div>
            </div>
            <button className="btng" style={{fontSize:9}} onClick={()=>{
              const c="name,company,email,phone,service,outcome,leadScore,callDuration,emailSent,callDone,notes\n"+leads.filter(l=>l.outcome).map(l=>`${l.name},${l.company||""},${l.email||""},${l.phone||""},${l.service||""},${l.outcome||""},${l.leadScore},${l.callDuration},${l.emailSent?1:0},${l.callDone?1:0},"${l.notes||""}"`).join("\n");
              const a=document.createElement("a");a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(c);a.download="techmunda-results.csv";a.click();
            }}>⬇ EXPORT RESULTS</button>
          </div>

          {/* Big KPI cards */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12,marginBottom:20}}>
            {[
              {l:"TOTAL LEADS",     v:ST.total,       c:"#4da6ff", icon:"◈"},
              {l:"CONVERSION RATE", v:ST.conv+"%",    c:"#ff4400", icon:"⚡"},
              {l:"🔥 HOT LEADS",   v:ST.hot,         c:"#ff4400", icon:""},
              {l:"✅ WARM LEADS",  v:ST.warm,        c:"#00cc66", icon:""},
              {l:"AVG ACCURACY",   v:ST.avgScore+"/100",c:"#ffcc00",icon:"★"},
            ].map(k=>(
              <div key={k.l} className="card" style={{borderTop:`2px solid ${k.c}`,padding:"16px 14px",textAlign:"center"}}>
                <div style={{fontSize:16,marginBottom:4,opacity:.7}}>{k.icon}</div>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:32,color:k.c,lineHeight:1}}>{k.v}</div>
                <div style={{fontSize:6,color:"#2a2a44",letterSpacing:2,marginTop:5}}>{k.l}</div>
              </div>
            ))}
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20}}>
            {/* Outcome bars */}
            <div className="card" style={{padding:18}}>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:12,letterSpacing:3,color:"#333",marginBottom:14}}>OUTCOME BREAKDOWN</div>
              {OUTCOMES.map(o=>{
                const cnt = leads.filter(l=>l.outcome===o.v).length;
                const pct = ST.total ? Math.round(cnt/ST.total*100) : 0;
                return (
                  <div key={o.v} style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:9,marginBottom:3}}>
                      <span style={{color:o.color}}>{o.label}</span>
                      <span style={{color:"#333"}}>{cnt} · {pct}%</span>
                    </div>
                    <div style={{height:4,background:"#0a0a18",borderRadius:2}}>
                      <div style={{height:"100%",width:`${pct}%`,background:o.color,borderRadius:2,transition:"width .6s"}}/>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Channel performance */}
            <div className="card" style={{padding:18}}>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:12,letterSpacing:3,color:"#333",marginBottom:14}}>CHANNEL PERFORMANCE</div>
              {[
                {l:"📧 Email Sent",     v:ST.emailed, c:"#4da6ff"},
                {l:"📞 Calls Made",     v:ST.called,  c:"#ff9900"},
                {l:"⚡ Both Channels",  v:leads.filter(l=>l.emailSent&&l.callDone).length, c:"#ff4400"},
                {l:"⏳ Queued Only",   v:ST.queued,  c:"#2a2a44"},
              ].map(r=>(
                <div key={r.l} style={{marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:9,marginBottom:3}}>
                    <span style={{color:r.c}}>{r.l}</span><span style={{color:"#333"}}>{r.v}</span>
                  </div>
                  <div style={{height:4,background:"#0a0a18",borderRadius:2}}>
                    <div style={{height:"100%",width:`${ST.total?Math.round(r.v/ST.total*100):0}%`,background:r.c,borderRadius:2,transition:"width .5s"}}/>
                  </div>
                </div>
              ))}
              <div style={{marginTop:16,padding:"10px 14px",background:"#0a0a18",borderLeft:"3px solid #ff4400"}}>
                <div style={{fontSize:7,color:"#ff4400",letterSpacing:2,marginBottom:4}}>ACCURACY SCORE</div>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:32,color:"#ff4400"}}>{ST.avgScore}<span style={{fontSize:14,color:"#ff440088"}}>/100</span></div>
                <div style={{fontSize:8,color:"#444",marginTop:2}}>Avg lead quality across {ST.total} contacts</div>
              </div>
            </div>
          </div>

          {/* Hot leads table */}
          <div className="card" style={{padding:18,marginBottom:14}}>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:12,letterSpacing:3,color:"#ff4400",marginBottom:14}}>🔥 HOT &amp; WARM LEADS — REQUIRES IMMEDIATE ACTION</div>
            {leads.filter(l=>["hot","warm","email_fu"].includes(l.outcome)).length===0 ? (
              <div style={{padding:"20px 0",textAlign:"center",color:"#1a1a2e",fontSize:11}}>No hot/warm leads yet — start the call campaign!</div>
            ) : (
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:10}}>
                <thead><tr style={{borderBottom:"1px solid #0f0f22"}}>
                  {["SCORE","NAME","COMPANY","SERVICE","EMAIL","PHONE","OUTCOME","NOTES"].map(h=>(
                    <th key={h} style={{padding:"6px 10px",textAlign:"left",fontSize:6,color:"#1e1e34",letterSpacing:2,fontWeight:500}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {leads.filter(l=>["hot","warm","email_fu"].includes(l.outcome)).sort((a,b)=>b.leadScore-a.leadScore).map(l=>(
                    <tr key={l.id} className="row" style={{borderBottom:"1px solid #09091a"}}>
                      <td style={{padding:"8px 10px"}}><ScoreRing score={l.leadScore}/></td>
                      <td style={{padding:"8px 10px",fontWeight:500}}>{l.name}</td>
                      <td style={{padding:"8px 10px",color:"#444",fontSize:9}}>{l.company||"—"}</td>
                      <td style={{padding:"8px 10px",color:"#555",fontSize:9,maxWidth:130,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.service||"—"}</td>
                      <td style={{padding:"8px 10px",color:"#4da6ff",fontSize:9}}>{l.email||"—"}</td>
                      <td style={{padding:"8px 10px",color:"#555",fontSize:9}}>{l.phone||"—"}</td>
                      <td style={{padding:"8px 10px"}}>
                        <span className="tag" style={{background:OUTCOMES.find(o=>o.v===l.outcome)?.color+"20",color:OUTCOMES.find(o=>o.v===l.outcome)?.color}}>
                          {OUTCOMES.find(o=>o.v===l.outcome)?.label}
                        </span>
                      </td>
                      <td style={{padding:"8px 10px",color:"#444",fontSize:9}}>{l.notes||"—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Services heatmap */}
          <div className="card" style={{padding:18}}>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:12,letterSpacing:3,color:"#333",marginBottom:14}}>SERVICE DEMAND HEATMAP</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {CO.services.map(svc=>{
                const cnt = leads.filter(l=>l.service===svc).length;
                const hot = leads.filter(l=>l.service===svc&&["hot","warm"].includes(l.outcome)).length;
                return (
                  <div key={svc} style={{padding:"10px 14px",background:`rgba(255,68,0,${0.03+hot*0.07})`,border:`1px solid rgba(255,68,0,${0.07+hot*0.14})`,minWidth:145}}>
                    <div style={{fontSize:7,color:hot>0?"#ff4400":"#333",letterSpacing:1,marginBottom:3}}>{svc}</div>
                    <div style={{display:"flex",gap:6,alignItems:"baseline"}}>
                      <div style={{fontFamily:"'Bebas Neue'",fontSize:20,color:hot>0?"#ff4400":"#2a2a44",lineHeight:1}}>{cnt}</div>
                      <div style={{fontSize:7,color:hot>0?"#ff440088":"#1a1a2e"}}>{hot} hot</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ LOGS ═══════════ */}
      {view==="logs" && (
        <div style={{flex:1,padding:20,overflowY:"auto"}} className="fu">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:14,letterSpacing:4,color:"#ff4400"}}>ACTIVITY LOG</div>
            <button className="btng" style={{fontSize:9}} onClick={()=>setLogs([])}>CLEAR</button>
          </div>
          <div className="card">
            {!logs.length && <div style={{padding:"28px",color:"#1a1a2e",fontSize:11,textAlign:"center"}}>No activity yet.</div>}
            {logs.map(l=>(
              <div key={l.id} style={{padding:"8px 14px",borderBottom:"1px solid #09091a",display:"flex",gap:12,fontSize:10}} className="fu">
                <span style={{color:"#1a1a28",flexShrink:0,minWidth:62}}>{l.t}</span>
                <span style={{color:l.type==="ok"?"#00cc66":l.type==="warn"?"#ffcc00":"#4da6ff"}}>{l.msg}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{borderTop:"1px solid #0f0f22",padding:"5px 18px",display:"flex",justifyContent:"space-between",fontSize:6,color:"#111130",letterSpacing:2,background:"#060614",flexShrink:0}}>
        <span>TECHMUNDA BY USYNC · KESHAV PUROHIT &amp; DHANANJAY PATHAK · techmunda21@gmail.com · +917976701222</span>
        <span>OFFLINE-READY SERVER · N8N + VAPI + GMAIL · v4.0</span>
      </div>
    </div>
  );
}
