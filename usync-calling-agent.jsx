import { useState, useEffect, useRef, useCallback } from "react";

// ── CONFIG ────────────────────────────────────────────────────────────────────
const VAPI_KEY = "YOUR_VAPI_API_KEY";  // paste from vapi.ai dashboard
const TRIAL_PHONE = "+917976701222";
const CALENDLY   = "https://calendly.com/techmunda21/usync-investor-call";

const INVESTORS = [
  { id:1,  name:"Kunal Shah",       firm:"Angel / CRED",     phone:"+919876500006", tier:"A", email:"kunal@cred.club",        note:"Community evangelist, Gen Z focus" },
  { id:2,  name:"Sajith Pai",       firm:"Blume Ventures",   phone:"+919876500002", tier:"A", email:"sajith@blume.vc",         note:"Deep Gen Z thesis, Bharat internet" },
  { id:3,  name:"Anand Lunia",      firm:"India Quotient",   phone:"+919876500003", tier:"A", email:"anand@indiaquotient.in",  note:"Best fit for Build with Bharat" },
  { id:4,  name:"Aprameya R.",      firm:"Angel / Koo",      phone:"+919876500007", tier:"A", email:"aprameya@koo.in",         note:"Loves community products" },
  { id:5,  name:"WTFund Team",      firm:"WTFund",           phone:"+919876500004", tier:"A", email:"apply@wtfund.in",         note:"Young founders fund" },
  { id:6,  name:"Karthik Reddy",    firm:"Blume Ventures",   phone:"+919876500001", tier:"A", email:"karthik@blume.vc",        note:"Backed Unacademy & Dunzo" },
  { id:7,  name:"Antler India",     firm:"Antler",           phone:"+919876500008", tier:"A", email:"india@antler.co",         note:"Pre-seed accelerator India" },
  { id:8,  name:"100X.VC Team",     firm:"100X.VC",          phone:"+919876500005", tier:"A", email:"hello@100x.vc",           note:"First-check India investors" },
  { id:9,  name:"Y Combinator",     firm:"YC",               phone:"+16500000001",  tier:"S", email:"apply@ycombinator.com",   note:"Apply S25 batch" },
  { id:10, name:"Hemant Mohapatra", firm:"Lightspeed India", phone:"+919876500010", tier:"B", email:"hemant@lsvp.com",         note:"Scout program active" },
  { id:11, name:"Vani Kola",        firm:"Kalaari Capital",  phone:"+919876500011", tier:"B", email:"vani@kalaari.com",        note:"India consumer thesis" },
  { id:12, name:"Prayank Swaroop",  firm:"Accel India",      phone:"+919876500009", tier:"B", email:"prayank@accel.com",       note:"Series A path later" },
];

const METRICS = { users: 1240, growth: 18, wau: 24, ambassadors: 7, weeks: 6 };

const PITCH_SCRIPT = [
  { id:"intro",    speaker:"AI",       text:"Hi! This is an AI calling on behalf of Usync. May I speak with {name}?" },
  { id:"hook",     speaker:"AI",       text:"Great! {name}, I'll be quick — just 60 seconds. Usync is building India's largest Gen Z builder community — where execution is the culture, not just the pitch." },
  { id:"traction", speaker:"AI",       text:"In just 6 weeks we've hit 1,240 members, 18% weekly growth, and 24% weekly active users. We have campus ambassadors at 6 colleges." },
  { id:"ask",      speaker:"AI",       text:"We're opening a small pre-seed round — $100K to $500K — to fuel our Build with Bharat movement. Given your work at {firm}, I believe this aligns strongly." },
  { id:"close",    speaker:"AI",       text:"Would you be open to a 15-minute call with our founder? I can share our deck immediately. You can also book directly at {calendly}." },
  { id:"end",      speaker:"AI",       text:"Thank you so much {name}. I'll send our deck and metrics dashboard to your email right away. Have a great day!" },
];

const OUTCOMES = ["Interested — Book Call", "Send Deck First", "Not Right Time", "Wrong Person", "No Answer", "Voicemail Left", "Passed"];

// ── WAVEFORM COMPONENT ────────────────────────────────────────────────────────
function Waveform({ active, color = "#00ff88", bars = 32 }) {
  const [heights, setHeights] = useState(() => Array(bars).fill(4));
  const rafRef = useRef();

  useEffect(() => {
    if (!active) {
      setHeights(Array(bars).fill(4));
      return;
    }
    const animate = () => {
      setHeights(prev => prev.map((_, i) => {
        const base = Math.sin(Date.now() * 0.003 + i * 0.4) * 0.5 + 0.5;
        const noise = Math.random() * 0.3;
        return Math.max(4, Math.min(52, (base + noise) * 56));
      }));
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, bars]);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3, height: 60, padding: "4px 0" }}>
      {heights.map((h, i) => (
        <div key={i} style={{
          width: 3, height: h, borderRadius: 2,
          background: active ? color : "#1a1a2a",
          transition: active ? "height 0.08s ease" : "height 0.3s ease",
          opacity: active ? (0.4 + (i / bars) * 0.6) : 0.2,
        }} />
      ))}
    </div>
  );
}

// ── RIPPLE AVATAR ─────────────────────────────────────────────────────────────
function RippleAvatar({ name, firm, active, picked }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{ position: "relative", width: 120, height: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {active && [1, 2, 3].map(i => (
        <div key={i} style={{
          position: "absolute", borderRadius: "50%",
          border: `1px solid ${picked ? "#00ff88" : "#ff4400"}`,
          width: 120 + i * 28, height: 120 + i * 28,
          opacity: 0, animation: `ripple 2s ease-out ${i * 0.5}s infinite`,
        }} />
      ))}
      <div style={{
        width: 96, height: 96, borderRadius: "50%",
        background: picked ? "linear-gradient(135deg,#003322,#00ff8822)" : "linear-gradient(135deg,#1a0800,#ff440022)",
        border: `2px solid ${picked ? "#00ff88" : active ? "#ff4400" : "#222"}`,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        transition: "all 0.4s ease", position: "relative", zIndex: 1,
      }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: 28, color: picked ? "#00ff88" : active ? "#ff4400" : "#444", letterSpacing: 2 }}>{initials}</div>
        <div style={{ fontSize: 7, color: "#444", letterSpacing: 1, marginTop: 2 }}>{firm.toUpperCase().slice(0, 10)}</div>
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function UsynqCallingAgent() {
  const [queue, setQueue] = useState(() => INVESTORS.map(inv => ({ ...inv, status: "queued", outcome: null, notes: "", duration: 0, startedAt: null })));
  const [callState, setCallState] = useState("idle"); // idle | dialing | ringing | connected | ended
  const [activeInv, setActiveInv] = useState(null);
  const [scriptIdx, setScriptIdx] = useState(0);
  const [transcript, setTranscript] = useState([]);
  const [callTimer, setCallTimer] = useState(0);
  const [trialMode, setTrialMode] = useState(true);
  const [showScript, setShowScript] = useState(true);
  const [selectedOutcome, setSelectedOutcome] = useState("");
  const [callNotes, setCallNotes] = useState("");
  const [stats, setStats] = useState({ total: 0, picked: 0, interested: 0, passed: 0, voicemail: 0 });
  const [tab, setTab] = useState("caller"); // caller | queue | history
  const [history, setHistory] = useState([]);
  const [muted, setMuted] = useState(false);

  const timerRef = useRef();
  const transcriptRef = useRef();

  // ── Timer ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (callState === "connected") {
      timerRef.current = setInterval(() => setCallTimer(t => t + 1), 1000);
    } else {
      clearInterval(timerRef.current);
      if (callState === "idle") setCallTimer(0);
    }
    return () => clearInterval(timerRef.current);
  }, [callState]);

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // ── Scroll transcript ──────────────────────────────────────────────────────
  useEffect(() => {
    if (transcriptRef.current) transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
  }, [transcript]);

  // ── Start Call ─────────────────────────────────────────────────────────────
  const startCall = useCallback(async (inv) => {
    setActiveInv(inv);
    setCallState("dialing");
    setTranscript([]);
    setScriptIdx(0);
    setCallNotes("");
    setSelectedOutcome("");
    setTab("caller");

    setQueue(p => p.map(i => i.id === inv.id ? { ...i, status: "calling", startedAt: new Date().toISOString() } : i));

    // Simulate dialing → ringing → connected
    await new Promise(r => setTimeout(r, 1800));
    setCallState("ringing");
    addTranscript("system", `📞 Calling ${trialMode ? TRIAL_PHONE : inv.phone}...`);

    await new Promise(r => setTimeout(r, 2200));
    const picked = Math.random() > 0.25; // 75% answer rate in simulation
    if (picked) {
      setCallState("connected");
      setQueue(p => p.map(i => i.id === inv.id ? { ...i, status: "connected" } : i));
      addTranscript("system", "✓ Call connected");
      runScript(inv, 0);
    } else {
      setCallState("ended");
      addTranscript("system", "⚠ No answer — leaving voicemail");
      await new Promise(r => setTimeout(r, 1000));
      addTranscript("ai", `Hi ${inv.name}, this is an AI calling on behalf of Usync. We're building India's largest Gen Z builder community — 1,240 members, 18% weekly growth. We're raising $100K–$500K pre-seed. Please call back or visit ${CALENDLY}. Thanks!`);
      await new Promise(r => setTimeout(r, 2000));
      endCall(inv, "Voicemail Left", picked);
    }
  }, [trialMode]);

  const addTranscript = (speaker, text) => {
    setTranscript(p => [...p, { id: Date.now() + Math.random(), speaker, text, time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) }]);
  };

  const runScript = async (inv, idx) => {
    const lines = PITCH_SCRIPT;
    for (let i = idx; i < lines.length; i++) {
      setScriptIdx(i);
      const line = lines[i];
      const text = line.text.replace("{name}", inv.name).replace("{firm}", inv.firm).replace("{calendly}", CALENDLY);
      await new Promise(r => setTimeout(r, 400));
      addTranscript("ai", text);
      const delay = Math.min(4000, text.length * 38);
      await new Promise(r => setTimeout(r, delay));
      if (i === 1) {
        addTranscript("investor", "Yes, go ahead — but keep it brief.");
        await new Promise(r => setTimeout(r, 1200));
      }
      if (i === 3) {
        const responses = [
          "That's interesting. Send me the deck and I'll take a look.",
          "Gen Z builder network... tell me more about the retention.",
          "What's your business model?",
        ];
        addTranscript("investor", responses[Math.floor(Math.random() * responses.length)]);
        await new Promise(r => setTimeout(r, 1000));
      }
    }
    await new Promise(r => setTimeout(r, 1500));
    endCall(inv, "Interested — Book Call", true);
  };

  const endCall = useCallback((inv, outcome = selectedOutcome || "Call Done", picked = true) => {
    setCallState("ended");
    setSelectedOutcome(outcome);
    setQueue(p => p.map(i => i.id === inv.id ? { ...i, status: "done", outcome } : i));
    setStats(p => ({
      total: p.total + 1,
      picked: picked ? p.picked + 1 : p.picked,
      interested: outcome.includes("Interested") ? p.interested + 1 : p.interested,
      passed: outcome === "Passed" ? p.passed + 1 : p.passed,
      voicemail: outcome === "Voicemail Left" ? p.voicemail + 1 : p.voicemail,
    }));
  }, [selectedOutcome]);

  const saveAndNext = () => {
    if (!activeInv) return;
    setHistory(p => [{ ...activeInv, outcome: selectedOutcome, notes: callNotes, duration: callTimer }, ...p]);
    setQueue(p => p.map(i => i.id === activeInv.id ? { ...i, outcome: selectedOutcome, notes: callNotes, duration: callTimer, status: "done" } : i));
    const next = queue.find(i => i.status === "queued");
    setCallState("idle");
    setActiveInv(null);
    if (next) setTimeout(() => startCall(next), 1000);
  };

  const nextQueued = queue.find(i => i.status === "queued");
  const callColor = callState === "connected" ? "#00ff88" : callState === "ringing" ? "#ffaa00" : callState === "dialing" ? "#4da6ff" : callState === "ended" ? "#ff4444" : "#333";

  return (
    <div style={{ fontFamily: "'DM Mono','Courier New',monospace", background: "#05050f", color: "#d0d0e8", minHeight: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Bebas+Neue&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-thumb { background: #ff4400; }
        @keyframes ripple { 0% { transform:scale(.8); opacity:.6; } 100% { transform:scale(1); opacity:0; } }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:.3 } }
        @keyframes fadeUp { from { opacity:0;transform:translateY(6px) } to { opacity:1;transform:translateY(0) } }
        @keyframes glow { 0%,100% { text-shadow:0 0 10px currentColor } 50% { text-shadow:0 0 28px currentColor,0 0 50px currentColor } }
        @keyframes scanLine { 0% { top:0 } 100% { top:100% } }
        @keyframes dialRing { 0%,100% { transform:scale(1) } 50% { transform:scale(1.04) } }
        .fu { animation: fadeUp .25s ease; }
        .pulsing { animation: pulse 1.4s infinite; }
        .glowing { animation: glow 2s infinite; }
        .dialing-ring { animation: dialRing 0.8s ease infinite; }
        .btnp { background:#ff4400;border:none;color:#fff;padding:10px 24px;cursor:pointer;font-family:inherit;font-size:10px;letter-spacing:2px;font-weight:500;transition:.15s; }
        .btnp:hover { background:#ff6622; } .btnp:disabled { opacity:.3;cursor:not-allowed; }
        .btng { background:transparent;border:1px solid #1e1e30;color:#666;padding:8px 18px;cursor:pointer;font-family:inherit;font-size:10px;letter-spacing:1.5px;transition:.15s; }
        .btng:hover { border-color:#888;color:#ccc; }
        .btn-tab { background:transparent;border:none;border-bottom:2px solid transparent;color:#333;padding:10px 22px;cursor:pointer;font-family:inherit;font-size:9px;letter-spacing:2.5px;transition:.15s; }
        .btn-tab.act { color:#ff4400;border-bottom-color:#ff4400; }
        .btn-tab:hover { color:#888; }
        .inv-row { transition:background .12s;cursor:pointer; }
        .inv-row:hover { background:#0c0c1e !important; }
        .outcome-btn { background:transparent;border:1px solid #1e1e30;color:#555;padding:6px 12px;cursor:pointer;font-family:inherit;font-size:9px;letter-spacing:1px;transition:.15s;border-radius:2px; }
        .outcome-btn:hover,.outcome-btn.sel { border-color:#ff4400;color:#ff4400;background:#ff440011; }
        .outcome-btn.good.sel { border-color:#00ff88;color:#00ff88;background:#00ff8811; }
        .script-line { padding:10px 14px;border-left:3px solid transparent;transition:all .3s;margin-bottom:4px;border-radius:1px; }
        .script-line.active { border-left-color:#ff4400;background:#ff440010; }
        .script-line.done { opacity:.4; }
        textarea.note { background:#08081a;border:none;border-bottom:2px solid #1e1e30;color:#d0d0e8;padding:10px;font-family:inherit;font-size:11px;resize:vertical;outline:none;width:100%; }
        textarea.note:focus { border-bottom-color:#ff4400; }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ borderBottom: "1px solid #111", display: "flex", alignItems: "stretch", justifyContent: "space-between", padding: "0 20px", minHeight: 48 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, paddingRight: 20, borderRight: "1px solid #111" }}>
          <div>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 22, letterSpacing: 4, lineHeight: 1 }}>
              <span style={{ color: "#ff4400" }}>U</span>SYNC <span style={{ fontSize: 9, color: "#222", letterSpacing: 2 }}>AI CALLER</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "stretch" }}>
          {[["caller", "☎ CALLER"], ["queue", "⬡ QUEUE"], ["history", "◎ HISTORY"]].map(([t, l]) => (
            <button key={t} className={`btn-tab ${tab === t ? "act" : ""}`} onClick={() => setTab(t)}>{l}</button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, paddingLeft: 20, borderLeft: "1px solid #111" }}>
          {/* Stats */}
          {[["CALLED", stats.total, "#4da6ff"], ["PICKED", stats.picked, "#00ff88"], ["HOT", stats.interested, "#ffcc00"]].map(([l, v, c]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 18, color: c, lineHeight: 1 }}>{v}</div>
              <div style={{ fontSize: 6, color: "#222", letterSpacing: 2 }}>{l}</div>
            </div>
          ))}
          {/* Trial toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 10px", border: "1px solid #1a1a28", marginLeft: 4 }}>
            <span style={{ fontSize: 8, color: trialMode ? "#ffcc00" : "#333", letterSpacing: 1 }}>TRIAL</span>
            <div onClick={() => setTrialMode(p => !p)} style={{ width: 32, height: 16, background: trialMode ? "#ff4400" : "#1a1a1a", borderRadius: 8, cursor: "pointer", position: "relative", transition: ".2s" }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "white", position: "absolute", top: 2, left: trialMode ? 18 : 2, transition: ".2s" }} />
            </div>
            <span style={{ fontSize: 7, color: "#2a2a2a" }}>{trialMode ? TRIAL_PHONE : "LIVE"}</span>
          </div>
        </div>
      </div>

      {/* ════════════════ CALLER TAB ════════════════ */}
      {tab === "caller" && (
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 360px", overflow: "hidden" }}>

          {/* ── LEFT: Main call screen ── */}
          <div style={{ display: "flex", flexDirection: "column", borderRight: "1px solid #111", overflow: "hidden", position: "relative" }}>
            {/* scan line effect */}
            <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,255,136,.012) 3px,rgba(0,255,136,.012) 4px)", pointerEvents: "none", zIndex: 0 }} />

            {/* Call State Display */}
            <div style={{ padding: "32px 40px 24px", position: "relative", zIndex: 1 }}>
              {callState === "idle" && !activeInv ? (
                <div style={{ textAlign: "center", paddingTop: 40 }} className="fu">
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: 44, letterSpacing: 6, color: "#1a1a2a", marginBottom: 16 }}>READY</div>
                  <div style={{ fontSize: 11, color: "#333", marginBottom: 32 }}>
                    {nextQueued ? `Next: ${nextQueued.name} · ${nextQueued.firm}` : "All calls complete"}
                  </div>
                  {nextQueued && (
                    <button className="btnp" style={{ fontSize: 12, padding: "14px 40px", letterSpacing: 3 }} onClick={() => startCall(nextQueued)}>
                      ▶ START CALLING
                    </button>
                  )}
                </div>
              ) : activeInv && (
                <div className="fu">
                  {/* Investor + Avatar */}
                  <div style={{ display: "flex", alignItems: "center", gap: 28, marginBottom: 24 }}>
                    <div className={callState === "ringing" ? "dialing-ring" : ""}>
                      <RippleAvatar name={activeInv.name} firm={activeInv.firm} active={["ringing","connected"].includes(callState)} picked={callState === "connected"} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Bebas Neue'", fontSize: 32, letterSpacing: 2, lineHeight: 1 }}>{activeInv.name}</div>
                      <div style={{ color: "#ff4400", fontSize: 13, marginTop: 4 }}>{activeInv.firm}</div>
                      <div style={{ color: "#333", fontSize: 10, marginTop: 4 }}>{trialMode ? TRIAL_PHONE : activeInv.phone}</div>
                      {/* Status badge */}
                      <div style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", border: `1px solid ${callColor}`, background: callColor + "11" }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: callColor }} className={["dialing","ringing"].includes(callState) ? "pulsing" : ""} />
                        <span style={{ fontSize: 9, color: callColor, letterSpacing: 2 }}>
                          {callState === "dialing" ? "DIALING..." : callState === "ringing" ? "RINGING..." : callState === "connected" ? `LIVE · ${fmt(callTimer)}` : "CALL ENDED"}
                        </span>
                        {callState === "connected" && <span style={{ fontFamily: "'Bebas Neue'", fontSize: 16, color: callColor }}>{fmt(callTimer)}</span>}
                      </div>
                    </div>

                    {/* Call controls */}
                    {callState === "connected" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end" }}>
                        <button onClick={() => setMuted(p => !p)} style={{ background: muted ? "#ff440022" : "transparent", border: `1px solid ${muted ? "#ff4400" : "#1e1e30"}`, color: muted ? "#ff4400" : "#555", padding: "8px 14px", cursor: "pointer", fontFamily: "inherit", fontSize: 9, letterSpacing: 1 }}>
                          {muted ? "🔇 MUTED" : "🎤 MUTE"}
                        </button>
                        <button onClick={() => endCall(activeInv, "Call Done", true)} style={{ background: "#ff000022", border: "1px solid #ff3333", color: "#ff3333", padding: "8px 14px", cursor: "pointer", fontFamily: "inherit", fontSize: 9, letterSpacing: 1 }}>
                          ✕ END CALL
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Waveform */}
                  <div style={{ background: "#08081a", border: "1px solid #111", padding: "10px 16px", marginBottom: 16 }}>
                    <div style={{ fontSize: 7, color: "#222", letterSpacing: 2, marginBottom: 4 }}>AI VOICE SIGNAL</div>
                    <Waveform active={callState === "connected"} color="#00ff88" bars={40} />
                  </div>

                  {/* Outcome picker (after call ends) */}
                  {callState === "ended" && (
                    <div className="fu">
                      <div style={{ fontSize: 8, color: "#333", letterSpacing: 2, marginBottom: 10 }}>CALL OUTCOME</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 14 }}>
                        {OUTCOMES.map(o => (
                          <button key={o} className={`outcome-btn ${selectedOutcome === o ? (o.includes("Interested") ? "sel good" : "sel") : ""}`} onClick={() => setSelectedOutcome(o)}>{o}</button>
                        ))}
                      </div>
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: 8, color: "#333", letterSpacing: 2, marginBottom: 6 }}>NOTES</div>
                        <textarea className="note" rows={3} placeholder="Key objections, next steps, follow-up date..." value={callNotes} onChange={e => setCallNotes(e.target.value)} />
                      </div>
                      <div style={{ display: "flex", gap: 10 }}>
                        <button className="btnp" onClick={saveAndNext} disabled={!selectedOutcome}>
                          {nextQueued ? "✓ SAVE & CALL NEXT" : "✓ SAVE & FINISH"}
                        </button>
                        <button className="btng" onClick={() => { setCallState("idle"); setActiveInv(null); }}>SKIP</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Transcript ── */}
            {transcript.length > 0 && (
              <div style={{ flex: 1, overflowY: "auto", borderTop: "1px solid #0f0f1a", position: "relative", zIndex: 1 }} ref={transcriptRef}>
                <div style={{ padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #0f0f1a" }}>
                  <div style={{ fontSize: 7, color: "#222", letterSpacing: 2 }}>LIVE TRANSCRIPT</div>
                  {callState === "connected" && <div style={{ fontSize: 7, color: "#00ff88", letterSpacing: 2 }} className="pulsing">● RECORDING</div>}
                </div>
                {transcript.map(t => (
                  <div key={t.id} style={{ padding: "10px 16px", borderBottom: "1px solid #0a0a14", display: "flex", gap: 12 }} className="fu">
                    <div style={{ fontSize: 8, color: "#1e1e2a", flexShrink: 0, marginTop: 2 }}>{t.time}</div>
                    <div>
                      <div style={{ fontSize: 7, color: t.speaker === "ai" ? "#ff4400" : t.speaker === "investor" ? "#00ff88" : "#333", letterSpacing: 2, marginBottom: 4 }}>
                        {t.speaker === "ai" ? "AI AGENT" : t.speaker === "investor" ? activeInv?.name?.toUpperCase() : "SYSTEM"}
                      </div>
                      <div style={{ fontSize: 11, color: t.speaker === "system" ? "#333" : "#c0c0d8", lineHeight: 1.7 }}>{t.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Script panel ── */}
          <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #111", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 7, color: "#333", letterSpacing: 2 }}>PITCH SCRIPT</div>
              <button className="btng" style={{ fontSize: 8, padding: "4px 10px" }} onClick={() => setShowScript(p => !p)}>
                {showScript ? "HIDE" : "SHOW"}
              </button>
            </div>

            {showScript && (
              <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
                <div style={{ fontSize: 8, color: "#ff4400", letterSpacing: 2, marginBottom: 12 }}>
                  USYNC AI PITCH — {activeInv ? activeInv.name : "—"}
                </div>
                {PITCH_SCRIPT.map((line, i) => (
                  <div key={line.id} className={`script-line ${callState === "connected" && i === scriptIdx ? "active" : i < scriptIdx ? "done" : ""}`}>
                    <div style={{ fontSize: 7, color: i === scriptIdx && callState === "connected" ? "#ff4400" : "#2a2a3a", letterSpacing: 2, marginBottom: 4 }}>
                      {i === scriptIdx && callState === "connected" ? "● SPEAKING" : i < scriptIdx ? "✓ DONE" : `STEP ${i + 1}`}
                    </div>
                    <div style={{ fontSize: 10, color: i < scriptIdx ? "#2a2a3a" : "#888", lineHeight: 1.8 }}>
                      {line.text.replace("{name}", activeInv?.name || "[name]").replace("{firm}", activeInv?.firm || "[firm]").replace("{calendly}", CALENDLY)}
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: 16, padding: 14, background: "#0a0a14", border: "1px solid #1a1a28", borderLeft: "3px solid #ff4400" }}>
                  <div style={{ fontSize: 7, color: "#ff4400", letterSpacing: 2, marginBottom: 8 }}>KEY METRICS</div>
                  {[["Members", `${METRICS.users.toLocaleString()}`], ["Weekly Growth", `${METRICS.growth}%`], ["WAU", `${METRICS.wau}%`], ["Ambassadors", METRICS.ambassadors], ["Raise Target", "$100K–$500K"]].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#555", marginBottom: 6 }}>
                      <span>{k}</span><span style={{ color: "#ff4400" }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════ QUEUE TAB ════════════════ */}
      {tab === "queue" && (
        <div style={{ flex: 1, overflowY: "auto" }} className="fu">
          <div style={{ padding: "12px 20px", borderBottom: "1px solid #111", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 8, color: "#333", letterSpacing: 2 }}>{queue.filter(i => i.status === "queued").length} QUEUED · {queue.filter(i => i.status === "done").length} DONE</div>
            <button className="btnp" style={{ fontSize: 9, padding: "6px 16px" }}
              disabled={!!activeInv || !nextQueued}
              onClick={() => { setTab("caller"); if (nextQueued) startCall(nextQueued); }}>
              ▶ START ALL CALLS
            </button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #111" }}>
                {["#", "INVESTOR", "FIRM", "PHONE", "TIER", "STATUS", "ACTION"].map(h => (
                  <th key={h} style={{ padding: "8px 14px", textAlign: "left", fontSize: 7, color: "#222", letterSpacing: 2, fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {queue.map((inv, idx) => (
                <tr key={inv.id} className="inv-row" style={{ borderBottom: "1px solid #0a0a14" }}>
                  <td style={{ padding: "10px 14px", color: "#2a2a3a", fontSize: 10 }}>{idx + 1}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ fontWeight: 500 }}>{inv.name}</div>
                    {inv.outcome && <div style={{ fontSize: 8, color: inv.outcome.includes("Interested") ? "#00ff88" : inv.outcome === "Passed" ? "#ff4444" : "#ffaa00", marginTop: 2 }}>{inv.outcome}</div>}
                  </td>
                  <td style={{ padding: "10px 14px", color: "#444", fontSize: 10 }}>{inv.firm}</td>
                  <td style={{ padding: "10px 14px", color: "#333", fontSize: 10 }}>{inv.phone}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{ background: inv.tier === "S" ? "#1a1200" : inv.tier === "A" ? "#150600" : "#0e0e0e", color: inv.tier === "S" ? "#ffcc00" : inv.tier === "A" ? "#ff4400" : "#444", padding: "2px 7px", fontSize: 8, letterSpacing: 1 }}>{inv.tier}</span>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{ fontSize: 8, letterSpacing: 1, color: inv.status === "done" ? "#444" : inv.status === "connected" ? "#00ff88" : inv.status === "calling" ? "#ffaa00" : "#2a2a2a" }}>
                      {inv.status === "queued" ? "QUEUED" : inv.status === "calling" ? "● CALLING" : inv.status === "connected" ? "● LIVE" : "✓ DONE"}
                    </span>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    {inv.status === "queued" && (
                      <button className="btng" style={{ fontSize: 8, padding: "4px 10px" }} onClick={() => { setTab("caller"); startCall(inv); }}>CALL NOW</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ════════════════ HISTORY TAB ════════════════ */}
      {tab === "history" && (
        <div style={{ flex: 1, overflowY: "auto", padding: 20 }} className="fu">
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 14, letterSpacing: 4, color: "#ff4400", marginBottom: 16 }}>CALL HISTORY</div>

          {/* Summary cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10, marginBottom: 20 }}>
            {[["TOTAL CALLS", stats.total, "#4da6ff"], ["PICKED UP", stats.picked, "#00ff88"], ["INTERESTED", stats.interested, "#ffcc00"], ["PASSED", stats.passed, "#ff4444"], ["VOICEMAIL", stats.voicemail, "#aa66ff"]].map(([l, v, c]) => (
              <div key={l} style={{ background: "#0c0c18", border: "1px solid #1a1a28", borderTop: `2px solid ${c}`, padding: "14px 16px", textAlign: "center" }}>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: 28, color: c, lineHeight: 1 }}>{v}</div>
                <div style={{ fontSize: 7, color: "#333", letterSpacing: 2, marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>

          {history.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#1a1a28" }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>◎</div>
              <div style={{ fontSize: 11, letterSpacing: 2 }}>NO CALLS YET</div>
              <div style={{ fontSize: 9, marginTop: 8 }}>Start calling from the Queue tab</div>
            </div>
          ) : (
            <div style={{ background: "#0c0c18", border: "1px solid #1a1a28" }}>
              {history.map((call, i) => (
                <div key={i} style={{ padding: "14px 18px", borderBottom: "1px solid #0f0f18", display: "flex", gap: 20, alignItems: "flex-start" }} className="fu">
                  <div style={{ textAlign: "center", minWidth: 50 }}>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: 20, color: "#ff4400" }}>{fmt(call.duration)}</div>
                    <div style={{ fontSize: 7, color: "#222", letterSpacing: 1 }}>DURATION</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 4 }}>
                      <div style={{ fontWeight: 500, fontSize: 12 }}>{call.name}</div>
                      <div style={{ fontSize: 9, color: "#444" }}>{call.firm}</div>
                    </div>
                    {call.notes && <div style={{ fontSize: 10, color: "#555", lineHeight: 1.6 }}>{call.notes}</div>}
                  </div>
                  <div>
                    <span style={{ padding: "3px 10px", fontSize: 8, letterSpacing: 1, background: call.outcome?.includes("Interested") ? "#00ff8811" : call.outcome === "Passed" ? "#ff444411" : "#1a1a28", color: call.outcome?.includes("Interested") ? "#00ff88" : call.outcome === "Passed" ? "#ff4444" : "#555" }}>
                      {call.outcome || "—"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ borderTop: "1px solid #0f0f18", padding: "5px 20px", display: "flex", justifyContent: "space-between", fontSize: 7, color: "#111", letterSpacing: 2 }}>
        <span>USYNC AI CALLER · VAPI + N8N · {trialMode ? "TRIAL MODE → " + TRIAL_PHONE : "LIVE MODE"}</span>
        <span>BUILD WITH BHARAT · PRE-SEED $100K–$500K</span>
      </div>
    </div>
  );
}
