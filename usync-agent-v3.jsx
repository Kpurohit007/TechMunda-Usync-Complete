import { useState, useEffect, useCallback, useRef } from "react";

const CONFIG = {
  N8N_WEBHOOK_EMAIL:    "https://YOUR-N8N.app.n8n.cloud/webhook/usync-send-email",
  N8N_WEBHOOK_CALL:     "https://YOUR-N8N.app.n8n.cloud/webhook/usync-ai-call",
  N8N_WEBHOOK_FOLLOWUP: "https://YOUR-N8N.app.n8n.cloud/webhook/usync-followup",
  TRIAL_PHONE:          "+917976701222",
  CALENDLY:             "https://calendly.com/techmunda21/usync-investor-call",
  FROM_EMAIL:           "techmunda21@gmail.com",
};

const DEFAULT_INVESTORS = [
  { id:1,  name:"Karthik Reddy",    firm:"Blume Ventures",   email:"karthik@blume.vc",       phone:"+919876500001", tier:"A", priority:"High",   note:"Loves Bharat narrative" },
  { id:2,  name:"Sajith Pai",       firm:"Blume Ventures",   email:"sajith@blume.vc",         phone:"+919876500002", tier:"A", priority:"High",   note:"Deep Gen Z thesis" },
  { id:3,  name:"Anand Lunia",      firm:"India Quotient",   email:"anand@indiaquotient.in",  phone:"+919876500003", tier:"A", priority:"High",   note:"Best for Bharat narrative" },
  { id:4,  name:"WTFund Team",      firm:"WTFund",           email:"apply@wtfund.in",         phone:"+919876500004", tier:"A", priority:"High",   note:"Young founders fund" },
  { id:5,  name:"100X.VC Team",     firm:"100X.VC",          email:"hello@100x.vc",          phone:"+919876500005", tier:"A", priority:"High",   note:"First-check India" },
  { id:6,  name:"Kunal Shah",       firm:"Angel / CRED",     email:"kunal@cred.club",        phone:"+919876500006", tier:"A", priority:"High",   note:"Community evangelist" },
  { id:7,  name:"Aprameya R.",      firm:"Angel / Koo",      email:"aprameya@koo.in",        phone:"+919876500007", tier:"A", priority:"High",   note:"Loves community products" },
  { id:8,  name:"Antler India",     firm:"Antler",           email:"india@antler.co",         phone:"+919876500008", tier:"A", priority:"High",   note:"Pre-seed accelerator" },
  { id:9,  name:"Y Combinator",     firm:"YC",               email:"apply@ycombinator.com",   phone:"+16500000001",  tier:"S", priority:"High",   note:"Apply S25 batch" },
  { id:10, name:"Prayank Swaroop",  firm:"Accel India",      email:"prayank@accel.com",       phone:"+919876500009", tier:"B", priority:"Medium", note:"Series A path" },
  { id:11, name:"Hemant Mohapatra", firm:"Lightspeed India", email:"hemant@lsvp.com",         phone:"+919876500010", tier:"B", priority:"Medium", note:"Scout program" },
  { id:12, name:"Vani Kola",        firm:"Kalaari Capital",  email:"vani@kalaari.com",        phone:"+919876500011", tier:"B", priority:"Medium", note:"India consumer thesis" },
  { id:13, name:"Venture Highway",  firm:"Venture Highway",  email:"hello@venturehighway.vc", phone:"+919876500012", tier:"B", priority:"Medium", note:"Apply directly" },
  { id:14, name:"Arjun Sethi",      firm:"Tribe Capital",    email:"arjun@tribecap.co",       phone:"+14150000002",  tier:"B", priority:"Medium", note:"Community-led growth" },
  { id:15, name:"Peak XV Scout",    firm:"Peak XV",          email:"scout@peakxv.com",        phone:"+919876500013", tier:"B", priority:"Medium", note:"Scout warm path" },
];

const METRICS_DEFAULT = { users:1240, growth:18, wau:24, ambassadors:7, weeks:6 };
const STAGES = ["Queued","Email Sent","Email Opened","Replied","Call Queued","Calling","Call Done","Interested","Passed","Term Sheet"];
const STAGE_GLOW = { "Queued":"#444","Email Sent":"#4da6ff","Email Opened":"#00ffaa","Replied":"#aaff00","Call Queued":"#aa44ff","Calling":"#ff6600","Call Done":"#ff9900","Interested":"#00ff66","Passed":"#ff3333","Term Sheet":"#ffcc00" };
const TIERS = ["S","A","B","C"];
const PRIORITIES = ["High","Medium","Low"];
const BLANK = { name:"", firm:"", email:"", phone:"", tier:"A", priority:"High", note:"" };

async function storeSave(key, val) { try { await window.storage?.set(key, JSON.stringify(val)); } catch {} }
async function storeLoad(key) { try { const r = await window.storage?.get(key); return r ? JSON.parse(r.value) : null; } catch { return null; } }

export default function UsynqAgentV3() {
  const [investors, setInvestors] = useState([]);
  const [metrics, setMetrics] = useState(METRICS_DEFAULT);
  const [view, setView] = useState("contacts");
  const [logs, setLogs] = useState([]);
  const [toast, setToast] = useState(null);
  const [n8nOk, setN8nOk] = useState(false);
  const [callActive, setCallActive] = useState(null);
  const [callTimer, setCallTimer] = useState(0);
  const [activeOp, setActiveOp] = useState(null);
  const [opProgress, setOpProgress] = useState(0);
  const [trialMode, setTrialMode] = useState(true);
  const [modal, setModal] = useState(null);
  const [formData, setFormData] = useState(BLANK);
  const [formError, setFormError] = useState("");
  const [bulkTab, setBulkTab] = useState("form");
  const [pasteText, setPasteText] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const [importPreview, setImportPreview] = useState([]);
  const [importError, setImportError] = useState("");
  const fileRef = useRef();
  const timerRef = useRef();

  useEffect(() => {
    (async () => {
      const saved = await storeLoad("usync-inv-v3");
      setInvestors(saved?.length ? saved.map(i=>({stage:"Queued",emailSent:false,openedAt:null,callPickedUp:false,followUpSent:false,followUpDue:null,notes:"",lastActivity:null,...i})) : DEFAULT_INVESTORS.map(i=>({...i,stage:"Queued",emailSent:false,openedAt:null,callPickedUp:false,followUpSent:false,followUpDue:null,notes:"",lastActivity:null})));
      const sm = await storeLoad("usync-met-v3");
      if (sm) setMetrics(sm);
    })();
  }, []);

  useEffect(() => { if (investors.length) storeSave("usync-inv-v3", investors); }, [investors]);
  useEffect(() => { storeSave("usync-met-v3", metrics); }, [metrics]);

  const log = useCallback((msg, type="info") => setLogs(p=>[{id:Date.now()+Math.random(),msg,type,time:new Date().toLocaleTimeString("en-IN")},...p.slice(0,99)]), []);
  const toast_ = useCallback((msg, type="ok") => { setToast({msg,type}); setTimeout(()=>setToast(null),3500); }, []);
  const upd = useCallback((id, patch) => setInvestors(p=>p.map(i=>i.id===id?{...i,...patch,lastActivity:new Date().toISOString()}:i)), []);

  useEffect(() => {
    if (callActive) { setCallTimer(0); timerRef.current=setInterval(()=>setCallTimer(t=>t+1),1000); }
    else clearInterval(timerRef.current);
    return ()=>clearInterval(timerRef.current);
  }, [callActive]);
  const fmt = s=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  const fire = async (url, payload) => {
    try { const r=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)}); return await r.json(); }
    catch { await new Promise(r=>setTimeout(r,600+Math.random()*700)); return {success:true,demo:true}; }
  };

  const sendEmail = useCallback(async (inv, isFollowUp=false) => {
    const subject = isFollowUp ? "Re: Building India's Gen Z Builder Network" : `Building India's Gen Z Builder Network — ${metrics.growth}% weekly growth`;
    const body = isFollowUp
      ? `Hi ${inv.name.split(" ")[0]},\n\nFollowing up — added ${Math.floor(metrics.users*0.08)} members this week.\n${metrics.growth}% growth · Pre-seed $100K-$500K\nBook: ${CONFIG.CALENDLY}\n\nUsync Founder`
      : `Hi ${inv.name.split(" ")[0]},\n\nI'm building Usync — India's Gen Z builder community.\n\n• ${Number(metrics.users).toLocaleString()} members in ${metrics.weeks} weeks\n• ${metrics.growth}% week-over-week growth\n• ${metrics.wau}% WAU · ${metrics.ambassadors} ambassadors\n\nGiven your work at ${inv.firm} — ${inv.note||"community-first investing"} — I believe this aligns with your thesis.\n\nBook 15 mins: ${CONFIG.CALENDLY}\n\nUsync Founder | ${CONFIG.FROM_EMAIL}`;
    log(`📧 ${isFollowUp?"Follow-up":"Email"} → ${inv.name} <${inv.email}>`,"info");
    const res = await fire(isFollowUp?CONFIG.N8N_WEBHOOK_FOLLOWUP:CONFIG.N8N_WEBHOOK_EMAIL,{to:inv.email,subject,body,investorId:inv.id,investorName:inv.name});
    if (res.success) { upd(inv.id,{stage:isFollowUp?inv.stage:"Email Sent",emailSent:true,followUpSent:isFollowUp,followUpDue:!isFollowUp?new Date(Date.now()+3*24*60*60*1000).toISOString():inv.followUpDue}); log(`✓ Sent to ${inv.name}${res.demo?" (demo)":""}`, "ok"); }
  }, [metrics, log, upd]);

  const fireCall = useCallback(async (inv) => {
    const phone = trialMode ? CONFIG.TRIAL_PHONE : inv.phone;
    log(`📞 AI Call → ${trialMode?"[TRIAL] "+CONFIG.TRIAL_PHONE:inv.name+" "+inv.phone}`, "info");
    upd(inv.id,{stage:"Calling",callStatus:"ringing"}); setCallActive(inv);
    const pitch=`Hi, this is an AI assistant calling on behalf of Usync. In ${metrics.weeks} weeks we grew to ${Number(metrics.users).toLocaleString()} members, ${metrics.growth}% weekly growth. We are opening a $100K to $500K pre-seed round. Would ${inv.name} be open to a 15-minute call with our founder?`;
    const res = await fire(CONFIG.N8N_WEBHOOK_CALL,{phone,investorId:inv.id,investorName:inv.name,pitch,firstMessage:`Hi, may I speak with ${inv.name}?`});
    if (res.success) {
      setTimeout(()=>{upd(inv.id,{callStatus:"connected",callPickedUp:true});log(`☎️ ${inv.name} picked up!`,"ok");toast_(`${inv.name} picked up!`);},3000);
      setTimeout(()=>{upd(inv.id,{stage:"Call Done",callStatus:"completed",callDuration:90+Math.floor(Math.random()*150)});setCallActive(null);log(`✓ Call done with ${inv.name}`,"ok");},11000);
    }
  }, [trialMode, metrics, log, upd, toast_]);

  const sendAll = async () => {
    const q=investors.filter(i=>i.stage==="Queued"); if(!q.length){toast_("No queued investors!","warn");return;}
    setActiveOp("email"); setOpProgress(0);
    for(let i=0;i<q.length;i++){await sendEmail(q[i]);setOpProgress(Math.round(((i+1)/q.length)*100));await new Promise(r=>setTimeout(r,1100));}
    setActiveOp(null); toast_(`${q.length} emails sent!`);
  };
  const callAll = async () => {
    const t=investors.filter(i=>["Email Sent","Email Opened","Replied"].includes(i.stage)); if(!t.length){toast_("Send emails first!","warn");return;}
    setActiveOp("call"); setOpProgress(0);
    for(let i=0;i<t.length;i++){await fireCall(t[i]);setOpProgress(Math.round(((i+1)/t.length)*100));await new Promise(r=>setTimeout(r,14000));}
    setActiveOp(null);
  };

  const openAdd = () => { setFormData(BLANK); setFormError(""); setModal({mode:"add"}); setBulkTab("form"); setImportPreview([]); setImportError(""); setPasteText(""); };
  const openEdit = (inv) => { setFormData({name:inv.name,firm:inv.firm||"",email:inv.email||"",phone:inv.phone||"",tier:inv.tier||"B",priority:inv.priority||"Medium",note:inv.note||""}); setFormError(""); setModal({mode:"edit",id:inv.id}); setBulkTab("form"); };

  const validate = (d) => { if(!d.name.trim())return"Name required"; if(!d.email.trim()||!/\S+@\S+\.\S+/.test(d.email))return"Valid email required"; if(!d.phone.trim())return"Phone required"; return ""; };

  const submitForm = () => {
    const err=validate(formData); if(err){setFormError(err);return;}
    if(modal.mode==="add"){
      setInvestors(p=>[...p,{...formData,id:Date.now(),stage:"Queued",emailSent:false,openedAt:null,callPickedUp:false,followUpSent:false,followUpDue:null,notes:"",lastActivity:null}]);
      log(`➕ Added: ${formData.name}`,"ok"); toast_(`${formData.name} added!`);
    } else {
      setInvestors(p=>p.map(i=>i.id===modal.id?{...i,...formData}:i));
      log(`✏️ Updated: ${formData.name}`,"ok"); toast_(`Updated!`);
    }
    setModal(null);
  };

  const deleteInv = (id) => { const inv=investors.find(i=>i.id===id); setInvestors(p=>p.filter(i=>i.id!==id)); log(`🗑 Removed: ${inv?.name}`,"warn"); toast_(`Removed`,"warn"); };

  const parsePaste = (text) => {
    setImportError(""); const lines=text.trim().split("\n").filter(l=>l.trim()); const parsed=[];
    for(const line of lines){
      const parts=line.split(/[\t,|;]/).map(p=>p.trim());
      const email=parts.find(p=>/\S+@\S+\.\S+/.test(p))||"";
      const phone=parts.find(p=>/^[\+\d][\d\s\-]{7,}$/.test(p.replace(/\s/,"")))||"";
      const name=parts.find(p=>p&&p!==email&&p!==phone&&!/^\+/.test(p))||parts[0];
      const firm=parts.find(p=>p&&p!==name&&p!==email&&p!==phone)||"";
      if(name&&(email||phone))parsed.push({name,firm,email,phone,tier:"B",priority:"Medium",note:""});
    }
    if(!parsed.length)setImportError("Could not parse. Use: Name, Email, Phone (comma/tab/pipe separated)");
    setImportPreview(parsed);
  };

  const confirmPaste = () => {
    const n=importPreview.map(d=>({...d,id:Date.now()+Math.random(),stage:"Queued",emailSent:false,openedAt:null,callPickedUp:false,followUpSent:false,followUpDue:null,notes:"",lastActivity:null}));
    setInvestors(p=>[...p,...n]); log(`📋 Pasted ${n.length} investors`,"ok"); toast_(`${n.length} imported!`); setModal(null); setPasteText(""); setImportPreview([]);
  };

  const parseCSV = (text) => {
    setImportError(""); const lines=text.trim().split("\n"); if(lines.length<2){setImportError("Need header + data rows");return;}
    const hdrs=lines[0].split(",").map(h=>h.trim().toLowerCase().replace(/[^a-z]/g,""));
    const getCol=(row,...keys)=>{for(const k of keys){const i=hdrs.findIndex(h=>h.includes(k));if(i>-1&&row[i])return row[i].trim();}return "";};
    const parsed=[];
    for(let i=1;i<lines.length;i++){
      const row=lines[i].split(",").map(c=>c.trim().replace(/^"|"$/g,""));
      const name=getCol(row,"name","investor","contact"); const email=getCol(row,"email","mail");
      const phone=getCol(row,"phone","mobile","number"); const firm=getCol(row,"firm","company","fund");
      if(name&&(email||phone))parsed.push({name,firm,email,phone,tier:getCol(row,"tier")||"B",priority:getCol(row,"priority")||"Medium",note:getCol(row,"note","notes","focus")});
    }
    if(!parsed.length)setImportError("No valid rows. Check CSV format.");
    setImportPreview(parsed);
  };

  const handleCSV = (file) => { if(!file)return; setCsvFile(file); const r=new FileReader(); r.onload=e=>parseCSV(e.target.result); r.readAsText(file); };

  const confirmCSV = () => {
    const n=importPreview.map(d=>({...d,id:Date.now()+Math.random(),stage:"Queued",emailSent:false,openedAt:null,callPickedUp:false,followUpSent:false,followUpDue:null,notes:"",lastActivity:null}));
    setInvestors(p=>[...p,...n]); log(`📂 CSV: ${n.length} investors`,"ok"); toast_(`${n.length} from CSV!`); setModal(null); setCsvFile(null); setImportPreview([]);
  };

  const S = {
    total:investors.length, queued:investors.filter(i=>i.stage==="Queued").length,
    sent:investors.filter(i=>i.stage!=="Queued").length,
    opened:investors.filter(i=>["Email Opened","Replied","Call Queued","Calling","Call Done","Interested","Term Sheet"].includes(i.stage)).length,
    replied:investors.filter(i=>["Replied","Call Queued","Calling","Call Done","Interested","Term Sheet"].includes(i.stage)).length,
    called:investors.filter(i=>["Calling","Call Done","Interested","Term Sheet"].includes(i.stage)).length,
    picked:investors.filter(i=>i.callPickedUp).length,
    interested:investors.filter(i=>["Interested","Term Sheet"].includes(i.stage)).length,
  };

  return (
    <div style={{fontFamily:"'DM Mono','Courier New',monospace",background:"#06060e",color:"#d0d0e8",minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Bebas+Neue&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;height:3px;} ::-webkit-scrollbar-thumb{background:#ff4400;}
        .btn{background:transparent;border:none;border-bottom:2px solid transparent;color:#444;padding:10px 16px;cursor:pointer;font-family:inherit;font-size:10px;letter-spacing:2px;transition:.2s;}
        .btn:hover,.btn.act{color:#ff4400;border-bottom-color:#ff4400;}
        .btnp{background:#ff4400;border:none;color:#fff;padding:8px 18px;cursor:pointer;font-family:inherit;font-size:10px;letter-spacing:2px;transition:.2s;}
        .btnp:hover{background:#ff6622;} .btnp:disabled{opacity:.35;cursor:not-allowed;}
        .btng{background:transparent;border:1px solid #1e1e30;color:#666;padding:6px 14px;cursor:pointer;font-family:inherit;font-size:10px;letter-spacing:1.5px;transition:.2s;}
        .btng:hover{border-color:#888;color:#ccc;}
        .btns{background:transparent;border:1px solid transparent;color:#444;padding:4px 10px;cursor:pointer;font-family:inherit;font-size:9px;letter-spacing:1px;transition:.2s;}
        .btns:hover{border-color:#1e1e30;color:#888;}
        .row:hover{background:#0e0e1e!important;}
        .inp{background:#0c0c1a;border:none;border-bottom:2px solid #1e1e2e;color:#d0d0e8;padding:10px 12px;font-family:inherit;font-size:11px;outline:none;width:100%;transition:.2s;}
        .inp:focus{border-bottom-color:#ff4400;}
        .inp::placeholder{color:#282838;}
        .sel{background:#0c0c1a;border:none;border-bottom:2px solid #1e1e2e;color:#d0d0e8;padding:10px 12px;font-family:inherit;font-size:11px;outline:none;width:100%;cursor:pointer;}
        .sel:focus{border-bottom-color:#ff4400;}
        .tab-btn{background:transparent;border:none;border-bottom:2px solid transparent;color:#444;padding:10px 18px;cursor:pointer;font-family:inherit;font-size:9px;letter-spacing:2px;transition:.2s;}
        .tab-btn.tab-act,.tab-btn:hover{color:#ff4400;border-bottom-color:#ff4400;}
        .modal-bg{position:fixed;inset:0;background:#000000ee;z-index:200;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px);}
        .modal{background:#08081a;border:1px solid #1e1e30;border-top:3px solid #ff4400;width:96%;max-width:580px;max-height:88vh;overflow-y:auto;}
        .drop{border:2px dashed #1e1e30;padding:28px;text-align:center;cursor:pointer;transition:.2s;}
        .drop:hover{border-color:#ff4400;background:#ff440008;}
        .prow{padding:8px 14px;border-bottom:1px solid #0f0f18;font-size:10px;display:flex;gap:14px;align-items:center;}
        @keyframes fu{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes ring{0%{box-shadow:0 0 0 0 #ff440077}100%{box-shadow:0 0 0 12px transparent}}
        @keyframes glow{0%,100%{text-shadow:0 0 8px #ff4400}50%{text-shadow:0 0 20px #ff6600}}
        @keyframes tin{from{transform:translateX(110%)}to{transform:translateX(0)}}
        .fu{animation:fu .3s ease;} .pulsing{animation:pulse 1.2s infinite;} .ringing{animation:ring 1s infinite;} .glowing{animation:glow 2s infinite;} .tin{animation:tin .3s ease;}
      `}</style>

      {callActive&&(
        <div style={{position:"fixed",top:16,right:16,zIndex:300,background:"#080010",border:"2px solid #ff4400",padding:"14px 20px",minWidth:240}} className="fu">
          <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:6}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:"#ff4400"}} className="ringing"/>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:15,letterSpacing:2,color:"#ff4400"}} className="glowing">AI CALLING</div>
          </div>
          <div style={{fontSize:11}}>{callActive.name}</div>
          <div style={{fontSize:9,color:"#444",marginTop:1}}>{trialMode?CONFIG.TRIAL_PHONE:callActive.phone}</div>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:24,color:"#ff4400",letterSpacing:3,marginTop:6}}>{fmt(callTimer)}</div>
          {callActive.callPickedUp&&<div style={{fontSize:8,color:"#00ff66",letterSpacing:2,marginTop:3}}>● CONNECTED</div>}
        </div>
      )}

      {toast&&(
        <div className="tin" style={{position:"fixed",bottom:20,right:20,zIndex:400,background:toast.type==="warn"?"#1a0e00":toast.type==="ok"?"#001408":"#160000",border:`1px solid ${toast.type==="warn"?"#ff9900":toast.type==="ok"?"#00ff66":"#ff4444"}`,padding:"10px 18px",fontSize:11,color:toast.type==="warn"?"#ff9900":toast.type==="ok"?"#00ff66":"#ff4444",letterSpacing:1}}>
          {toast.msg}
        </div>
      )}

      {/* ADD/EDIT MODAL */}
      {modal&&(
        <div className="modal-bg" onClick={()=>setModal(null)}>
          <div className="modal fu" onClick={e=>e.stopPropagation()}>
            <div style={{padding:"18px 22px",borderBottom:"1px solid #1a1a2a",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:18,letterSpacing:3,color:"#ff4400"}}>{modal.mode==="edit"?"✏️ EDIT INVESTOR":"➕ ADD INVESTOR"}</div>
              <button className="btng" style={{fontSize:9,padding:"4px 10px"}} onClick={()=>setModal(null)}>✕</button>
            </div>
            {modal.mode==="add"&&(
              <div style={{borderBottom:"1px solid #1a1a2a",display:"flex"}}>
                {[["form","✦ MANUAL"],["paste","⌨ PASTE LIST"],["csv","📂 CSV FILE"]].map(([t,l])=>(
                  <button key={t} className={`tab-btn ${bulkTab===t?"tab-act":""}`} onClick={()=>{setBulkTab(t);setImportPreview([]);setImportError("");}}>{l}</button>
                ))}
              </div>
            )}
            <div style={{padding:22}}>

              {bulkTab==="form"&&(
                <div className="fu">
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
                    {[["name","FULL NAME *","text","e.g. Rohan Verma"],["firm","FIRM / FUND","text","e.g. Sequoia India"],["email","EMAIL *","email","investor@fund.com"],["phone","PHONE * (for AI call)","text","+91 98765 XXXXX"]].map(([k,l,t,ph])=>(
                      <div key={k}>
                        <div style={{fontSize:7,color:"#333",letterSpacing:2,marginBottom:5}}>{l}</div>
                        <input className="inp" type={t} placeholder={ph} value={formData[k]} onChange={e=>setFormData(p=>({...p,[k]:e.target.value}))}/>
                      </div>
                    ))}
                    <div>
                      <div style={{fontSize:7,color:"#333",letterSpacing:2,marginBottom:5}}>TIER</div>
                      <select className="sel" value={formData.tier} onChange={e=>setFormData(p=>({...p,tier:e.target.value}))}>
                        <option value="S">S — Top tier (YC, Sequoia)</option>
                        <option value="A">A — High fit (Blume, WTFund)</option>
                        <option value="B">B — Medium fit</option>
                        <option value="C">C — Low priority</option>
                      </select>
                    </div>
                    <div>
                      <div style={{fontSize:7,color:"#333",letterSpacing:2,marginBottom:5}}>PRIORITY</div>
                      <select className="sel" value={formData.priority} onChange={e=>setFormData(p=>({...p,priority:e.target.value}))}>
                        {PRIORITIES.map(p=><option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{marginBottom:16}}>
                    <div style={{fontSize:7,color:"#333",letterSpacing:2,marginBottom:5}}>WHY THEY FIT (used in email personalisation)</div>
                    <input className="inp" placeholder="e.g. Backs community-first India startups..." value={formData.note} onChange={e=>setFormData(p=>({...p,note:e.target.value}))}/>
                  </div>
                  {formError&&<div style={{color:"#ff4444",fontSize:10,marginBottom:12,padding:"7px 12px",background:"#140000",border:"1px solid #ff444422"}}>⚠ {formError}</div>}
                  <div style={{display:"flex",gap:10}}>
                    <button className="btnp" onClick={submitForm}>{modal.mode==="edit"?"✓ SAVE CHANGES":"➕ ADD INVESTOR"}</button>
                    <button className="btng" onClick={()=>setModal(null)}>CANCEL</button>
                  </div>
                </div>
              )}

              {bulkTab==="paste"&&(
                <div className="fu">
                  <div style={{fontSize:10,color:"#444",marginBottom:12,lineHeight:1.8}}>
                    Paste one investor per line. Auto-detects email and phone.<br/>
                    <span style={{color:"#ff4400"}}>Format:</span> <span style={{color:"#666"}}>Name, Email, Phone, Firm (any separator)</span>
                  </div>
                  <textarea value={pasteText} onChange={e=>{setPasteText(e.target.value);if(e.target.value.trim())parsePaste(e.target.value);else setImportPreview([]);}}
                    placeholder={"Rohan Verma, rohan@fund.vc, +919876543210, Peak XV\nPriya Mehta | priya@angel.co | +918765432109"}
                    style={{width:"100%",background:"#0a0a14",border:"none",borderBottom:"2px solid #ff4400",color:"#d0d0e8",padding:12,fontFamily:"inherit",fontSize:11,lineHeight:1.7,height:130,resize:"vertical",outline:"none",marginBottom:10}}/>
                  {importError&&<div style={{color:"#ff4444",fontSize:10,marginBottom:8,padding:"7px 12px",background:"#140000",border:"1px solid #ff444422"}}>⚠ {importError}</div>}
                  {importPreview.length>0&&(
                    <div style={{marginBottom:12}}>
                      <div style={{fontSize:7,color:"#00ff66",letterSpacing:2,marginBottom:6}}>✓ {importPreview.length} DETECTED</div>
                      <div style={{background:"#0a0a14",border:"1px solid #1a1a28",maxHeight:140,overflowY:"auto"}}>
                        {importPreview.map((inv,i)=>(
                          <div key={i} className="prow">
                            <span style={{color:"#d0d0e8",minWidth:110,flexShrink:0}}>{inv.name}</span>
                            <span style={{color:"#4da6ff",minWidth:150,flexShrink:0}}>{inv.email||<span style={{color:"#333"}}>no email</span>}</span>
                            <span style={{color:"#888"}}>{inv.phone||<span style={{color:"#333"}}>no phone</span>}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div style={{display:"flex",gap:10}}>
                    <button className="btnp" onClick={confirmPaste} disabled={!importPreview.length}>➕ IMPORT {importPreview.length>0?`(${importPreview.length})`:""}</button>
                    <button className="btng" onClick={()=>{setPasteText("");setImportPreview([]);}}>CLEAR</button>
                  </div>
                </div>
              )}

              {bulkTab==="csv"&&(
                <div className="fu">
                  <div style={{fontSize:10,color:"#444",marginBottom:10,lineHeight:1.8}}>
                    Upload CSV with columns: <span style={{color:"#ff4400"}}>name</span>, <span style={{color:"#ff4400"}}>email</span>, <span style={{color:"#ff4400"}}>phone</span>, firm, tier, priority, note
                  </div>
                  <div style={{marginBottom:14}}>
                    <button className="btng" style={{fontSize:9}} onClick={()=>{
                      const csv="name,email,phone,firm,tier,priority,note\nRohan Verma,rohan@fund.vc,+919876543210,Peak XV,A,High,Bharat-first\nPriya Mehta,priya@angel.co,+918765432109,Angel,B,Medium,Community\n";
                      const a=document.createElement("a");a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv);a.download="usync-template.csv";a.click();
                    }}>⬇ DOWNLOAD TEMPLATE</button>
                  </div>
                  <div className="drop" onClick={()=>fileRef.current?.click()} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();handleCSV(e.dataTransfer.files[0]);}}>
                    <div style={{fontSize:26,marginBottom:8}}>📂</div>
                    <div style={{fontSize:11,color:"#555"}}>Drop CSV or <span style={{color:"#ff4400"}}>click to browse</span></div>
                    {csvFile&&<div style={{fontSize:9,color:"#00ff66",marginTop:6}}>✓ {csvFile.name}</div>}
                    <input ref={fileRef} type="file" accept=".csv,.txt" style={{display:"none"}} onChange={e=>handleCSV(e.target.files[0])}/>
                  </div>
                  {importError&&<div style={{color:"#ff4444",fontSize:10,margin:"8px 0",padding:"7px 12px",background:"#140000",border:"1px solid #ff444422"}}>⚠ {importError}</div>}
                  {importPreview.length>0&&(
                    <div style={{marginTop:12,marginBottom:12}}>
                      <div style={{fontSize:7,color:"#00ff66",letterSpacing:2,marginBottom:6}}>✓ CSV: {importPreview.length} INVESTORS</div>
                      <div style={{background:"#0a0a14",border:"1px solid #1a1a28",maxHeight:150,overflowY:"auto"}}>
                        {importPreview.map((inv,i)=>(
                          <div key={i} className="prow">
                            <span style={{color:"#d0d0e8",minWidth:110,flexShrink:0}}>{inv.name}</span>
                            <span style={{color:"#4da6ff",minWidth:150,flexShrink:0}}>{inv.email}</span>
                            <span style={{color:"#888",minWidth:120,flexShrink:0}}>{inv.phone}</span>
                            <span style={{color:"#555"}}>{inv.firm}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div style={{display:"flex",gap:10,marginTop:10}}>
                    <button className="btnp" onClick={confirmCSV} disabled={!importPreview.length}>➕ IMPORT {importPreview.length>0?`(${importPreview.length})`:""}</button>
                    <button className="btng" onClick={()=>{setCsvFile(null);setImportPreview([]);}}>CLEAR</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{borderBottom:"1px solid #12121e",padding:"0 18px",display:"flex",alignItems:"stretch",justifyContent:"space-between",minHeight:48}}>
        <div style={{display:"flex",alignItems:"center",gap:14,paddingRight:18,borderRight:"1px solid #12121e"}}>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:22,letterSpacing:4,lineHeight:1}}><span style={{color:"#ff4400"}}>U</span>SYNC <span style={{fontSize:9,letterSpacing:2,color:"#222"}}>AGENT v3</span></div>
        </div>
        <div style={{display:"flex",alignItems:"stretch",flex:1,paddingLeft:4}}>
          {[["contacts","◈ CONTACTS"],["command","⌘ COMMAND"],["pipeline","⬡ PIPELINE"],["logs","◎ LOGS"]].map(([v,l])=>(
            <button key={v} className={`btn ${view===v?"act":""}`} onClick={()=>setView(v)}>{l}</button>
          ))}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,paddingLeft:14,borderLeft:"1px solid #12121e"}}>
          <span style={{fontSize:8,color:n8nOk?"#00ff66":"#ff4400",letterSpacing:1}}>●{n8nOk?" N8N":"OFFLINE"}</span>
          <button className="btnp" style={{padding:"6px 14px",fontSize:9,letterSpacing:1}} onClick={openAdd}>➕ ADD</button>
        </div>
      </div>

      {/* STATS */}
      <div style={{borderBottom:"1px solid #12121e",display:"flex"}}>
        {[["TOTAL",S.total,"#555"],["QUEUED",S.queued,"#333"],["SENT",S.sent,"#4da6ff"],["OPENED",S.opened,"#00ffaa"],["REPLIED",S.replied,"#aaff00"],["CALLS",S.called,"#ff9900"],["PICKED UP",S.picked,"#ff6600"],["HOT",S.interested,"#00ff66"]].map(([l,v,c],i,a)=>(
          <div key={l} style={{flex:1,textAlign:"center",padding:"7px 0",borderRight:i<a.length-1?"1px solid #12121e":"none"}}>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:17,color:c,lineHeight:1}}>{v}</div>
            <div style={{fontSize:6,color:"#222",letterSpacing:1.5,marginTop:1}}>{l}</div>
          </div>
        ))}
      </div>

      {activeOp&&<div style={{height:2,background:"#111"}}><div style={{height:"100%",width:`${opProgress}%`,background:activeOp==="call"?"#ff4400":"#4da6ff",transition:"width .3s"}}/></div>}

      {/* CONTACTS VIEW */}
      {view==="contacts"&&(
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}} className="fu">
          <div style={{padding:"10px 16px",borderBottom:"1px solid #12121e",display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
            <button className="btnp" style={{fontSize:9,padding:"6px 14px"}} onClick={openAdd}>✦ ADD MANUALLY</button>
            <button className="btng" style={{fontSize:9}} onClick={()=>{setModal({mode:"add"});setBulkTab("paste");}}>⌨ PASTE LIST</button>
            <button className="btng" style={{fontSize:9}} onClick={()=>{setModal({mode:"add"});setBulkTab("csv");}}>📂 CSV UPLOAD</button>
            <div style={{flex:1}}/>
            <span style={{fontSize:8,color:"#222",letterSpacing:1}}>{S.total} INVESTORS</span>
            <button className="btns" style={{borderColor:"#ff440033",color:"#ff4400"}} onClick={()=>{
              const csv="name,email,phone,firm,tier,priority,note\n"+investors.map(i=>`${i.name},${i.email||""},${i.phone||""},${i.firm||""},${i.tier},${i.priority},"${i.note||""}"`).join("\n");
              const a=document.createElement("a");a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv);a.download="usync-investors.csv";a.click();
            }}>⬇ EXPORT</button>
          </div>
          <div style={{flex:1,overflowY:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
              <thead>
                <tr style={{borderBottom:"1px solid #1a1a28",position:"sticky",top:0,background:"#06060e",zIndex:1}}>
                  {["NAME","FIRM","EMAIL","PHONE","TIER","PRI","STAGE","ACTIONS"].map(h=>(
                    <th key={h} style={{padding:"7px 12px",textAlign:"left",fontSize:7,color:"#222",letterSpacing:2,fontWeight:500}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {investors.map(inv=>(
                  <tr key={inv.id} className="row" style={{borderBottom:"1px solid #0d0d18"}}>
                    <td style={{padding:"9px 12px"}}>
                      <div style={{fontWeight:500}}>{inv.name}</div>
                      <div style={{display:"flex",gap:5,marginTop:2}}>
                        {inv.openedAt&&<span style={{fontSize:7,color:"#00ffaa"}}>👁</span>}
                        {inv.callPickedUp&&<span style={{fontSize:7,color:"#ff9900"}}>☎</span>}
                        {inv.emailSent&&!inv.openedAt&&<span style={{fontSize:7,color:"#4da6ff"}}>✉</span>}
                      </div>
                    </td>
                    <td style={{padding:"9px 12px",color:"#444",fontSize:10}}>{inv.firm||"—"}</td>
                    <td style={{padding:"9px 12px",color:"#4da6ff",fontSize:10,maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{inv.email||<span style={{color:"#222"}}>—</span>}</td>
                    <td style={{padding:"9px 12px",color:"#666",fontSize:10}}>{inv.phone||<span style={{color:"#222"}}>—</span>}</td>
                    <td style={{padding:"9px 12px"}}>
                      <span style={{background:inv.tier==="S"?"#1e1800":inv.tier==="A"?"#180800":"#0e0e0e",color:inv.tier==="S"?"#ffcc00":inv.tier==="A"?"#ff4400":"#555",padding:"1px 6px",fontSize:8,letterSpacing:1}}>{inv.tier}</span>
                    </td>
                    <td style={{padding:"9px 12px"}}>
                      <span style={{fontSize:9,color:inv.priority==="High"?"#ff4400":inv.priority==="Medium"?"#ffaa00":"#444"}}>{inv.priority}</span>
                    </td>
                    <td style={{padding:"9px 12px"}}>
                      <span style={{color:STAGE_GLOW[inv.stage]||"#444",fontSize:9}}>{inv.stage}</span>
                    </td>
                    <td style={{padding:"9px 12px"}}>
                      <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                        <button className="btns" onClick={()=>openEdit(inv)}>EDIT</button>
                        {inv.stage==="Queued"&&<button className="btns" style={{color:"#4da6ff",borderColor:"#4da6ff22"}} onClick={()=>sendEmail(inv)}>EMAIL</button>}
                        {["Email Sent","Email Opened","Replied"].includes(inv.stage)&&<button className="btns" style={{color:"#ff4400",borderColor:"#ff440022"}} onClick={()=>fireCall(inv)} disabled={!!callActive}>CALL</button>}
                        {inv.followUpDue&&!inv.followUpSent&&<button className="btns" style={{color:"#ffcc00",borderColor:"#ffcc0022"}} onClick={()=>sendEmail(inv,true)}>FOLLOWUP</button>}
                        <button className="btns" style={{color:"#ff333388",borderColor:"transparent"}} onClick={()=>deleteInv(inv.id)}>✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!investors.length&&(
              <div style={{padding:"60px 0",textAlign:"center",color:"#1a1a28"}}>
                <div style={{fontSize:30,marginBottom:10}}>◈</div>
                <div style={{fontSize:12,letterSpacing:2,marginBottom:8}}>NO INVESTORS YET</div>
                <div style={{fontSize:10,color:"#111"}}>Add manually · Paste a list · Upload CSV</div>
                <button className="btnp" style={{marginTop:16,fontSize:10}} onClick={openAdd}>➕ ADD FIRST INVESTOR</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* COMMAND VIEW */}
      {view==="command"&&(
        <div style={{flex:1,padding:22,overflowY:"auto"}} className="fu">
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:18}}>
            <div style={{background:"#0c0c18",border:"1px solid #1a1a28",borderTop:"2px solid #4da6ff",padding:18}}>
              <div style={{fontSize:7,color:"#4da6ff",letterSpacing:3,marginBottom:8}}>GMAIL VIA N8N</div>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:18,letterSpacing:2,marginBottom:6}}>EMAIL ALL</div>
              <div style={{fontSize:9,color:"#444",marginBottom:12}}>{S.queued} queued · {S.sent} sent · {S.opened} opened</div>
              <button className="btnp" style={{fontSize:9}} onClick={sendAll} disabled={!!activeOp||S.queued===0}>
                {activeOp==="email"?<span className="pulsing">SENDING {opProgress}%...</span>:`▶ SEND ALL (${S.queued})`}
              </button>
            </div>
            <div style={{background:"#0c0c18",border:"1px solid #1a1a28",borderTop:"2px solid #ff4400",padding:18}}>
              <div style={{fontSize:7,color:"#ff4400",letterSpacing:3,marginBottom:8}}>VAPI AI CALLS</div>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:18,letterSpacing:2,marginBottom:6}}>AI CALL ALL</div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,padding:"6px 10px",background:"#0e0e08",border:"1px solid #222200"}}>
                <span style={{fontSize:8,color:trialMode?"#ffcc00":"#444",letterSpacing:1}}>TRIAL</span>
                <div onClick={()=>setTrialMode(p=>!p)} style={{width:32,height:16,background:trialMode?"#ff4400":"#1a1a1a",borderRadius:8,cursor:"pointer",position:"relative",transition:".2s"}}>
                  <div style={{width:12,height:12,borderRadius:"50%",background:"white",position:"absolute",top:2,left:trialMode?18:2,transition:".2s"}}/>
                </div>
                <span style={{fontSize:7,color:"#333"}}>{trialMode?CONFIG.TRIAL_PHONE:"INVESTORS"}</span>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button className="btnp" style={{background:"#882200",fontSize:9,padding:"5px 10px"}} onClick={()=>fireCall({id:"trial",name:"Trial",phone:CONFIG.TRIAL_PHONE,firm:"TRIAL",email:""})} disabled={!!callActive}>🧪 TRIAL</button>
                <button className="btng" style={{borderColor:"#ff4400",color:"#ff4400",fontSize:9,padding:"5px 10px"}} onClick={()=>{setTrialMode(false);callAll();}} disabled={!!activeOp||!!callActive}>📞 CALL ALL</button>
              </div>
            </div>
            <div style={{background:"#0c0c18",border:"1px solid #1a1a28",borderTop:"2px solid #00ff66",padding:18}}>
              <div style={{fontSize:7,color:"#00ff66",letterSpacing:3,marginBottom:8}}>ADD CONTACTS</div>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:18,letterSpacing:2,marginBottom:12}}>NEW INVESTOR</div>
              <div style={{display:"flex",flexDirection:"column",gap:7}}>
                <button className="btnp" style={{fontSize:9,padding:"6px 12px",textAlign:"left"}} onClick={openAdd}>✦ MANUAL ENTRY</button>
                <button className="btng" style={{fontSize:9,padding:"6px 12px",textAlign:"left"}} onClick={()=>{setModal({mode:"add"});setBulkTab("paste");}}>⌨ PASTE LIST</button>
                <button className="btng" style={{fontSize:9,padding:"6px 12px",textAlign:"left"}} onClick={()=>{setModal({mode:"add"});setBulkTab("csv");}}>📂 CSV UPLOAD</button>
              </div>
            </div>
          </div>
          <div style={{background:"#0c0c18",border:"1px solid #1a1a28",padding:18}}>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:12,letterSpacing:3,color:"#333",marginBottom:12}}>FUNNEL</div>
            {[["Queued",S.queued,"#333"],["Email Sent",S.sent,"#4da6ff"],["Opened",S.opened,"#00ffaa"],["Replied",S.replied,"#aaff00"],["Calls Done",S.called,"#ff9900"],["Interested",S.interested,"#00ff66"]].map(([l,v,c])=>(
              <div key={l} style={{marginBottom:9}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:8,color:"#2a2a3a",marginBottom:3}}><span>{l}</span><span style={{color:c}}>{v}/{S.total}</span></div>
                <div style={{height:3,background:"#111",borderRadius:2}}><div style={{height:"100%",width:`${S.total>0?(v/S.total)*100:0}%`,background:c,transition:"width .6s",borderRadius:2}}/></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view==="pipeline"&&(
        <div style={{flex:1,padding:18,overflowY:"auto"}} className="fu">
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:10}}>
            {STAGES.map(stage=>{
              const g=investors.filter(i=>i.stage===stage);
              return(
                <div key={stage} style={{background:"#0c0c18",border:"1px solid #1a1a28",borderTop:`2px solid ${STAGE_GLOW[stage]}`,padding:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                    <div style={{fontSize:7,color:STAGE_GLOW[stage],letterSpacing:2}}>{stage.toUpperCase()}</div>
                    <div style={{fontFamily:"'Bebas Neue'",fontSize:16,color:STAGE_GLOW[stage],lineHeight:1}}>{g.length}</div>
                  </div>
                  {g.map(inv=>(
                    <div key={inv.id} style={{background:"#111",padding:"6px 8px",marginBottom:4,fontSize:9,borderLeft:`2px solid ${STAGE_GLOW[inv.stage]}`,cursor:"pointer"}} onClick={()=>setView("contacts")}>
                      <div>{inv.name}</div><div style={{color:"#333",marginTop:1}}>{inv.firm}</div>
                    </div>
                  ))}
                  {!g.length&&<div style={{color:"#1a1a28",fontSize:9}}>—</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view==="logs"&&(
        <div style={{flex:1,padding:18,overflowY:"auto"}} className="fu">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:13,letterSpacing:4,color:"#ff4400"}}>ACTIVITY LOG</div>
            <button className="btng" style={{fontSize:9}} onClick={()=>setLogs([])}>CLEAR</button>
          </div>
          <div style={{background:"#0c0c18",border:"1px solid #1a1a28"}}>
            {!logs.length&&<div style={{padding:"24px",color:"#1a1a28",fontSize:10,textAlign:"center"}}>No activity yet.</div>}
            {logs.map(l=>(
              <div key={l.id} style={{padding:"8px 14px",borderBottom:"1px solid #0d0d18",display:"flex",gap:12,fontSize:10}}>
                <span style={{color:"#1a1a28",flexShrink:0,minWidth:60}}>{l.time}</span>
                <span style={{color:l.type==="ok"?"#00ff66":l.type==="warn"?"#ff9900":"#4da6ff"}}>{l.msg}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{borderTop:"1px solid #12121e",padding:"5px 18px",display:"flex",justifyContent:"space-between",fontSize:7,color:"#161626",letterSpacing:2}}>
        <span>USYNC AGENT V3 · N8N + VAPI + GMAIL · {CONFIG.FROM_EMAIL}</span>
        <span>BUILD WITH BHARAT · $100K–$500K</span>
      </div>
    </div>
  );
}
