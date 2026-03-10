import { useState, useEffect } from "react";

const INVESTORS = [
  {
    id: 1, name: "Karthik Reddy", firm: "Blume Ventures", type: "Micro VC",
    focus: "Early-stage India startups, community platforms", tier: "A",
    email: "karthik@blume.vc", linkedin: "https://linkedin.com/in/karthikreddy",
    stage: "Pre-seed friendly", note: "Backed Unacademy, Dunzo — loves Bharat narrative",
    status: "Not Contacted", priority: "High"
  },
  {
    id: 2, name: "Sajith Pai", firm: "Blume Ventures", type: "Micro VC",
    focus: "Gen Z, consumer internet, India communities", tier: "A",
    email: "sajith@blume.vc", linkedin: "https://linkedin.com/in/sajithpai",
    stage: "Pre-seed friendly", note: "Deep Gen Z thesis, writes about Bharat internet",
    status: "Not Contacted", priority: "High"
  },
  {
    id: 3, name: "Prayank Swaroop", firm: "Accel India", type: "VC",
    focus: "Community, SaaS, developer tools", tier: "B",
    email: "prayank@accel.com", linkedin: "https://linkedin.com/in/prayank",
    stage: "Seed+", note: "Backed Clevertap, good for Series A later",
    status: "Not Contacted", priority: "Medium"
  },
  {
    id: 4, name: "Hemant Mohapatra", firm: "Lightspeed India", type: "VC",
    focus: "Consumer, community platforms, India", tier: "B",
    email: "hemant@lsvp.com", linkedin: "https://linkedin.com/in/hemantmohapatra",
    stage: "Seed", note: "Scout program active, good warm intro path",
    status: "Not Contacted", priority: "Medium"
  },
  {
    id: 5, name: "WTFund Team", firm: "WTFund", type: "Angel Fund",
    focus: "Young founders under 23, India", tier: "A",
    email: "apply@wtfund.in", linkedin: "https://wtfund.in",
    stage: "Pre-seed ($10K–$50K)", note: "Specifically for young founders, apply directly",
    status: "Not Contacted", priority: "High"
  },
  {
    id: 6, name: "Vani Kola", firm: "Kalaari Capital", type: "VC",
    focus: "Consumer internet, India-first", tier: "B",
    email: "vani@kalaari.com", linkedin: "https://linkedin.com/in/vanikola",
    stage: "Seed", note: "Strong India consumer thesis, community platforms",
    status: "Not Contacted", priority: "Medium"
  },
  {
    id: 7, name: "Arjun Sethi", firm: "Tribe Capital", type: "VC",
    focus: "Community-led growth, data-driven", tier: "B",
    email: "arjun@tribecap.co", linkedin: "https://linkedin.com/in/arjunsethi",
    stage: "Seed", note: "Invented community-led growth framework",
    status: "Not Contacted", priority: "Medium"
  },
  {
    id: 8, name: "Anand Lunia", firm: "India Quotient", type: "Micro VC",
    focus: "Bharat-first startups, vernacular, communities", tier: "A",
    email: "anand@indiaquotient.in", linkedin: "https://linkedin.com/in/anandlunia",
    stage: "Pre-seed friendly", note: "Best fit for 'Build with Bharat' narrative",
    status: "Not Contacted", priority: "High"
  },
  {
    id: 9, name: "Aprameya Radhakrishna", firm: "Angel / TaxiForSure founder", type: "Angel",
    focus: "Community, Gen Z, India startups", tier: "A",
    email: "aprameya@koo.in", linkedin: "https://linkedin.com/in/aprameya",
    stage: "Pre-seed ($25K–$100K)", note: "Active angel, Koo founder, loves community products",
    status: "Not Contacted", priority: "High"
  },
  {
    id: 10, name: "Kunal Shah", firm: "Angel / CRED founder", type: "Angel",
    focus: "Community, trust, India consumer", tier: "A",
    email: "kunal@cred.club", linkedin: "https://linkedin.com/in/kunalb11",
    stage: "Pre-seed angel checks", note: "Prolific angel, community evangelist, Gen Z focus",
    status: "Not Contacted", priority: "High"
  },
  {
    id: 11, name: "Antler India Team", firm: "Antler", type: "Accelerator + VC",
    focus: "Pre-idea to pre-seed, India founders", tier: "A",
    email: "india@antler.co", linkedin: "https://antler.co/india",
    stage: "Pre-seed ($100K–$250K)", note: "Apply to cohort, great for early-stage community",
    status: "Not Contacted", priority: "High"
  },
  {
    id: 12, name: "Venture Highway", firm: "Venture Highway", type: "Micro VC",
    focus: "Early India startups, consumer", tier: "B",
    email: "hello@venturehighway.vc", linkedin: "https://venturehighway.vc",
    stage: "Pre-seed friendly", note: "Mentioned in your roadmap, apply directly",
    status: "Not Contacted", priority: "Medium"
  },
  {
    id: 13, name: "100X.VC Team", firm: "100X.VC", type: "Micro VC",
    focus: "Indian startups, first check", tier: "A",
    email: "hello@100x.vc", linkedin: "https://100x.vc",
    stage: "Pre-seed ($25K–$150K)", note: "Specifically first-check India investors, fast process",
    status: "Not Contacted", priority: "High"
  },
  {
    id: 14, name: "Y Combinator", firm: "YC", type: "Accelerator",
    focus: "Global, any stage", tier: "S",
    email: "apply@ycombinator.com", linkedin: "https://ycombinator.com",
    stage: "Pre-seed ($500K for 7%)", note: "Apply for S25 batch. Community + Bharat = strong app",
    status: "Not Contacted", priority: "High"
  },
  {
    id: 15, name: "Peak XV Scout Program", firm: "Peak XV (Sequoia India)", type: "VC Scout",
    focus: "India, early signals", tier: "B",
    email: "scout@peakxv.com", linkedin: "https://peakxv.com",
    stage: "Seed+", note: "Scout network is the warm path. Find a scout first.",
    status: "Not Contacted", priority: "Medium"
  }
];

const STATUS_OPTIONS = ["Not Contacted", "Researching", "Email Sent", "Replied", "Call Scheduled", "Call Done", "Interested", "Passed", "Term Sheet"];
const STATUS_COLORS = {
  "Not Contacted": "#444", "Researching": "#7c6f00", "Email Sent": "#005fa3",
  "Replied": "#006b45", "Call Scheduled": "#6b3fa0", "Call Done": "#8a4000",
  "Interested": "#1a7a2e", "Passed": "#7a1a1a", "Term Sheet": "#b8860b"
};

const METRICS = { users: 1240, weeklyGrowth: 18, wau: 24, ambassadors: 7, weeks: 6 };

function generateEmail(investor, metrics) {
  const subject = `Building India's Gen Z Builder Network — ${metrics.weeklyGrowth}% weekly growth`;
  const body = `Hi ${investor.name.split(" ")[0]},

I'm building Usync — a community for Gen Z builders across India who are crazy enough to actually build things.

Here's where we are:
• ${metrics.users.toLocaleString()} community members in ${metrics.weeks} weeks
• ${metrics.weeklyGrowth}% week-over-week growth
• ${metrics.wau}% weekly active users
• ${metrics.ambassadors} campus ambassadors across 6 colleges

The insight: India has 350M+ Gen Z individuals. Less than 1% find real builder communities. We're fixing that with "Build with Bharat" — where execution is the culture.

Given your work at ${investor.firm} — especially ${investor.note.split(",")[0]} — I think you'd find this interesting.

Would you be open to a 15-minute call this week or next? I'll send our deck + metrics dashboard ahead of time.

Building,
[Your Name]
Founder, Usync
usync.build | +91-XXXXXXXXXX`;
  return { subject, body };
}

function generateCallScript(investor, metrics) {
  return `📞 CALL SCRIPT — ${investor.name} (${investor.firm})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OPENING (30 sec)
"Hi ${investor.name.split(" ")[0]}, thanks for taking the call. I'm [Name], founder of Usync.
Quick context: we're building India's largest Gen Z builder community.
I'll keep this to 15 minutes — does that still work for you?"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE PITCH (2 min)
"Here's the insight: India has 350M Gen Z people. 
Most want to build things. Almost none have a real community to do it with.
We built Usync — and in ${metrics.weeks} weeks, ${metrics.users.toLocaleString()} people joined.
We're growing ${metrics.weeklyGrowth}% week-over-week with ${metrics.wau}% weekly actives.
That's not signups — those are people showing up every week."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INVESTOR-SPECIFIC HOOK
"I reached out specifically because ${investor.note}.
I think the 'Build with Bharat' thesis maps directly to what you look for."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE ASK
"We're raising a small pre-seed — $100K–$500K — to fuel our campus 
ambassador program and the 'Build with Bharat' hackathon series.
I'm not looking for a decision today — just your perspective on the thesis."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KEY QUESTIONS TO ASK THEM
1. "What do you look for in community-first businesses at this stage?"
2. "Who else in your network do you think should see this?"
3. "What would make you excited about this in 60 days?"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CLOSE
"Can I send you our deck and metrics after this call?
And would it be okay to follow up in 2 weeks with a growth update?"`;
}

export default function UsynqInvestorAgent() {
  const [investors, setInvestors] = useState(INVESTORS);
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState("email");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [metrics, setMetrics] = useState(METRICS);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);

  const filtered = investors.filter(inv => {
    const matchFilter = filter === "All" || inv.priority === filter || inv.tier === filter || inv.status === filter;
    const matchSearch = search === "" || inv.name.toLowerCase().includes(search.toLowerCase()) || inv.firm.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const updateStatus = (id, status) => {
    setInvestors(prev => prev.map(inv => inv.id === id ? { ...inv, status } : inv));
    if (selected?.id === id) setSelected(prev => ({ ...prev, status }));
  };

  const handleGenerate = async (investor) => {
    setIsGenerating(true);
    setGeneratedContent(null);
    await new Promise(r => setTimeout(r, 900));
    if (activeTab === "email") {
      setGeneratedContent(generateEmail(investor, metrics));
    } else {
      setGeneratedContent({ script: generateCallScript(investor, metrics) });
    }
    setIsGenerating(false);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stats = {
    total: investors.length,
    contacted: investors.filter(i => i.status !== "Not Contacted").length,
    interested: investors.filter(i => i.status === "Interested" || i.status === "Term Sheet").length,
    calls: investors.filter(i => i.status === "Call Scheduled" || i.status === "Call Done").length,
  };

  return (
    <div style={{ fontFamily: "'Space Mono', 'Courier New', monospace", background: "#0a0a0f", color: "#e8e8f0", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;700;800&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #111; } ::-webkit-scrollbar-thumb { background: #ff4d00; }
        .inv-row:hover { background: #14141f !important; cursor: pointer; }
        .tab-btn:hover { background: #ff4d0022 !important; }
        .action-btn:hover { opacity: 0.85; }
        .status-sel { background: #1a1a2e; border: 1px solid #333; color: #e8e8f0; padding: 4px 8px; border-radius: 4px; font-family: inherit; font-size: 11px; cursor: pointer; }
        .copy-btn { background: #ff4d00; border: none; color: white; padding: 8px 20px; border-radius: 4px; cursor: pointer; font-family: inherit; font-weight: 700; font-size: 12px; letter-spacing: 1px; }
        .copy-btn:hover { background: #ff6622; }
        .gen-btn { background: transparent; border: 2px solid #ff4d00; color: #ff4d00; padding: 10px 24px; border-radius: 4px; cursor: pointer; font-family: inherit; font-weight: 700; font-size: 12px; letter-spacing: 2px; transition: all 0.2s; }
        .gen-btn:hover { background: #ff4d00; color: #000; }
        .metric-input { background: #0a0a0f; border: 1px solid #333; border-bottom: 2px solid #ff4d00; color: #ff4d00; font-family: inherit; font-size: 18px; font-weight: 700; width: 80px; text-align: center; outline: none; padding: 4px; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes slideIn { from{transform:translateX(20px);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        .generating { animation: pulse 1s infinite; }
        .slide-in { animation: slideIn 0.3s ease; }
        .cursor::after { content:"_"; animation: blink 1s infinite; }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: "1px solid #1e1e30", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, letterSpacing: "-1px" }}>
            <span style={{ color: "#ff4d00" }}>U</span>SYNC
            <span style={{ color: "#555", fontWeight: 400, fontSize: 12, marginLeft: 8, letterSpacing: 2 }}>INVESTOR AGENT</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 24, fontSize: 11, color: "#666" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "#ff4d00", fontSize: 20, fontFamily: "'Syne',sans-serif", fontWeight: 800 }}>{stats.total}</div>
            <div>TARGETS</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "#ff4d00", fontSize: 20, fontFamily: "'Syne',sans-serif", fontWeight: 800 }}>{stats.contacted}</div>
            <div>CONTACTED</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "#ff4d00", fontSize: 20, fontFamily: "'Syne',sans-serif", fontWeight: 800 }}>{stats.calls}</div>
            <div>CALLS</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "#ffd700", fontSize: 20, fontFamily: "'Syne',sans-serif", fontWeight: 800 }}>{stats.interested}</div>
            <div>INTERESTED</div>
          </div>
        </div>
        <button onClick={() => setShowMetrics(!showMetrics)} style={{ background: "transparent", border: "1px solid #333", color: "#888", padding: "8px 16px", cursor: "pointer", fontFamily: "inherit", fontSize: 11, letterSpacing: 1 }}>
          {showMetrics ? "▲ HIDE" : "▼ METRICS"}
        </button>
      </div>

      {/* Metrics Editor */}
      {showMetrics && (
        <div style={{ background: "#0d0d18", borderBottom: "1px solid #1e1e30", padding: "16px 24px" }} className="slide-in">
          <div style={{ fontSize: 10, color: "#555", letterSpacing: 2, marginBottom: 12 }}>YOUR CURRENT METRICS (USED IN ALL OUTREACH)</div>
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            {[
              { key: "users", label: "MEMBERS" },
              { key: "weeklyGrowth", label: "WK GROWTH %" },
              { key: "wau", label: "WAU %" },
              { key: "ambassadors", label: "AMBASSADORS" },
              { key: "weeks", label: "WEEKS LIVE" }
            ].map(m => (
              <div key={m.key} style={{ textAlign: "center" }}>
                <input
                  className="metric-input"
                  value={metrics[m.key]}
                  onChange={e => setMetrics(prev => ({ ...prev, [m.key]: e.target.value }))}
                  type="number"
                />
                <div style={{ fontSize: 9, color: "#555", letterSpacing: 2, marginTop: 4 }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Investor List */}
        <div style={{ width: selected ? "45%" : "100%", borderRight: "1px solid #1e1e30", display: "flex", flexDirection: "column", transition: "width 0.3s ease" }}>
          {/* Filters */}
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #1a1a2a", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <input
              placeholder="Search investor or firm..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ background: "#111", border: "1px solid #222", borderBottom: "2px solid #ff4d00", color: "#e8e8f0", padding: "6px 12px", fontFamily: "inherit", fontSize: 11, outline: "none", flex: 1, minWidth: 150 }}
            />
            {["All", "High", "Medium", "S", "A", "B"].map(f => (
              <button key={f} className="tab-btn" onClick={() => setFilter(f)}
                style={{ background: filter === f ? "#ff4d00" : "transparent", border: `1px solid ${filter === f ? "#ff4d00" : "#333"}`, color: filter === f ? "#000" : "#666", padding: "5px 12px", cursor: "pointer", fontFamily: "inherit", fontSize: 10, letterSpacing: 1, fontWeight: 700 }}>
                {f === "All" ? "ALL" : f === "High" ? "🔴 HIGH" : f === "Medium" ? "🟡 MED" : `TIER-${f}`}
              </button>
            ))}
          </div>

          {/* Table */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #1e1e30", color: "#444", fontSize: 10, letterSpacing: 2 }}>
                  <th style={{ padding: "8px 16px", textAlign: "left", fontWeight: 700 }}>INVESTOR</th>
                  <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 700 }}>FIRM</th>
                  {!selected && <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 700 }}>FOCUS</th>}
                  <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 700 }}>TIER</th>
                  <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 700 }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(inv => (
                  <tr key={inv.id} className="inv-row"
                    onClick={() => { setSelected(inv); setGeneratedContent(null); }}
                    style={{ borderBottom: "1px solid #12121e", background: selected?.id === inv.id ? "#14141f" : "transparent" }}>
                    <td style={{ padding: "10px 16px" }}>
                      <div style={{ fontWeight: 700, color: inv.priority === "High" ? "#e8e8f0" : "#999" }}>{inv.name}</div>
                      <div style={{ color: "#555", fontSize: 10 }}>{inv.type}</div>
                    </td>
                    <td style={{ padding: "10px 12px", color: "#888" }}>{inv.firm}</td>
                    {!selected && <td style={{ padding: "10px 12px", color: "#555", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{inv.focus}</td>}
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{ background: inv.tier === "S" ? "#ffd70022" : inv.tier === "A" ? "#ff4d0022" : "#33333322", color: inv.tier === "S" ? "#ffd700" : inv.tier === "A" ? "#ff4d00" : "#666", padding: "2px 8px", borderRadius: 2, fontSize: 10, fontWeight: 700 }}>{inv.tier}</span>
                    </td>
                    <td style={{ padding: "10px 12px" }} onClick={e => e.stopPropagation()}>
                      <select className="status-sel" value={inv.status} onChange={e => updateStatus(inv.id, e.target.value)}
                        style={{ color: STATUS_COLORS[inv.status] || "#888" }}>
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Panel */}
        {selected && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" }} className="slide-in">
            {/* Investor Header */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #1e1e30", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800 }}>{selected.name}</div>
                <div style={{ color: "#ff4d00", fontSize: 13, marginTop: 2 }}>{selected.firm} · {selected.type}</div>
                <div style={{ color: "#555", fontSize: 11, marginTop: 6, maxWidth: 400 }}>{selected.focus}</div>
                <div style={{ marginTop: 8, padding: "6px 12px", background: "#14141f", border: "1px solid #1e1e30", borderLeft: "3px solid #ff4d00", fontSize: 11, color: "#aaa", maxWidth: 400 }}>
                  💡 {selected.note}
                </div>
                <div style={{ marginTop: 8, fontSize: 11, color: "#555" }}>
                  📧 {selected.email} &nbsp; · &nbsp; Stage: <span style={{ color: "#888" }}>{selected.stage}</span>
                </div>
              </div>
              <button onClick={() => { setSelected(null); setGeneratedContent(null); }}
                style={{ background: "transparent", border: "1px solid #333", color: "#666", padding: "6px 12px", cursor: "pointer", fontFamily: "inherit", fontSize: 12 }}>✕</button>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid #1e1e30" }}>
              {["email", "call", "profile"].map(tab => (
                <button key={tab} className="tab-btn"
                  onClick={() => { setActiveTab(tab); setGeneratedContent(null); }}
                  style={{ background: activeTab === tab ? "#ff4d0015" : "transparent", borderBottom: activeTab === tab ? "2px solid #ff4d00" : "2px solid transparent", border: "none", borderBottom: activeTab === tab ? "2px solid #ff4d00" : "2px solid transparent", color: activeTab === tab ? "#ff4d00" : "#555", padding: "12px 24px", cursor: "pointer", fontFamily: "inherit", fontSize: 11, letterSpacing: 2, fontWeight: 700 }}>
                  {tab === "email" ? "📧 EMAIL" : tab === "call" ? "📞 CALL SCRIPT" : "👤 PROFILE"}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div style={{ padding: 24, flex: 1 }}>
              {activeTab === "profile" && (
                <div className="slide-in">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                    {[
                      { label: "INVESTMENT STAGE", value: selected.stage },
                      { label: "PRIORITY", value: selected.priority },
                      { label: "TIER", value: selected.tier },
                      { label: "INVESTOR TYPE", value: selected.type },
                    ].map(item => (
                      <div key={item.label} style={{ background: "#0d0d18", border: "1px solid #1e1e30", padding: 16 }}>
                        <div style={{ fontSize: 9, color: "#444", letterSpacing: 2, marginBottom: 6 }}>{item.label}</div>
                        <div style={{ fontSize: 14, color: "#e8e8f0", fontWeight: 700 }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: "#0d0d18", border: "1px solid #1e1e30", padding: 20, marginBottom: 16 }}>
                    <div style={{ fontSize: 9, color: "#444", letterSpacing: 2, marginBottom: 10 }}>INVESTMENT FOCUS</div>
                    <div style={{ color: "#aaa", lineHeight: 1.8 }}>{selected.focus}</div>
                  </div>
                  <div style={{ background: "#0d0d18", border: "1px solid #1a1a2a", borderLeft: "3px solid #ff4d00", padding: 20 }}>
                    <div style={{ fontSize: 9, color: "#444", letterSpacing: 2, marginBottom: 10 }}>WHY USYNC FITS</div>
                    <div style={{ color: "#ccc", lineHeight: 1.8 }}>{selected.note}</div>
                  </div>
                  <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
                    <select className="status-sel" value={selected.status} onChange={e => updateStatus(selected.id, e.target.value)}
                      style={{ padding: "10px 16px", fontSize: 12, color: STATUS_COLORS[selected.status] }}>
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {(activeTab === "email" || activeTab === "call") && !generatedContent && (
                <div style={{ textAlign: "center", paddingTop: 60 }}>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, color: "#555", marginBottom: 8 }}>
                    {activeTab === "email" ? "GENERATE PERSONALIZED EMAIL" : "GENERATE CALL SCRIPT"}
                  </div>
                  <div style={{ color: "#333", fontSize: 11, marginBottom: 32, maxWidth: 360, margin: "0 auto 32px" }}>
                    Customized for {selected.name} at {selected.firm} using your current metrics ({metrics.users.toLocaleString()} members, {metrics.weeklyGrowth}% growth)
                  </div>
                  <button className="gen-btn cursor" onClick={() => handleGenerate(selected)}>
                    {isGenerating ? "GENERATING..." : `▶ GENERATE ${activeTab === "email" ? "EMAIL" : "CALL SCRIPT"}`}
                  </button>
                  {isGenerating && (
                    <div style={{ marginTop: 20, color: "#ff4d00", fontSize: 11, letterSpacing: 2 }} className="generating">
                      CRAFTING YOUR MESSAGE...
                    </div>
                  )}
                </div>
              )}

              {activeTab === "email" && generatedContent?.subject && (
                <div className="slide-in">
                  <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 10, color: "#555", letterSpacing: 2 }}>PERSONALIZED EMAIL FOR {selected.name.toUpperCase()}</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="copy-btn" onClick={() => handleCopy(`Subject: ${generatedContent.subject}\n\n${generatedContent.body}`)}>
                        {copied ? "✓ COPIED" : "COPY ALL"}
                      </button>
                      <button className="gen-btn" style={{ padding: "6px 14px", fontSize: 10 }} onClick={() => setGeneratedContent(null)}>↺ REGEN</button>
                    </div>
                  </div>
                  <div style={{ background: "#0d0d18", border: "1px solid #1e1e30", padding: 20, marginBottom: 12 }}>
                    <div style={{ fontSize: 9, color: "#555", letterSpacing: 2, marginBottom: 8 }}>SUBJECT LINE</div>
                    <div style={{ color: "#ff4d00", fontSize: 14, fontWeight: 700 }}>{generatedContent.subject}</div>
                  </div>
                  <div style={{ background: "#0d0d18", border: "1px solid #1e1e30", padding: 20 }}>
                    <div style={{ fontSize: 9, color: "#555", letterSpacing: 2, marginBottom: 12 }}>EMAIL BODY</div>
                    <pre style={{ color: "#ccc", fontSize: 12, lineHeight: 1.8, whiteSpace: "pre-wrap", fontFamily: "inherit", margin: 0 }}>
                      {generatedContent.body}
                    </pre>
                  </div>
                  <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                    <button style={{ background: "#1a7a2e", border: "none", color: "white", padding: "8px 16px", cursor: "pointer", fontFamily: "inherit", fontSize: 11, letterSpacing: 1, fontWeight: 700 }}
                      onClick={() => updateStatus(selected.id, "Email Sent")}>
                      ✓ MARK AS SENT
                    </button>
                    <a href={`mailto:${selected.email}?subject=${encodeURIComponent(generatedContent.subject)}&body=${encodeURIComponent(generatedContent.body)}`}
                      style={{ background: "#005fa3", color: "white", padding: "8px 16px", textDecoration: "none", fontFamily: "inherit", fontSize: 11, letterSpacing: 1, fontWeight: 700 }}>
                      📧 OPEN IN MAIL
                    </a>
                  </div>
                </div>
              )}

              {activeTab === "call" && generatedContent?.script && (
                <div className="slide-in">
                  <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 10, color: "#555", letterSpacing: 2 }}>CALL SCRIPT FOR {selected.name.toUpperCase()}</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="copy-btn" onClick={() => handleCopy(generatedContent.script)}>
                        {copied ? "✓ COPIED" : "COPY SCRIPT"}
                      </button>
                      <button className="gen-btn" style={{ padding: "6px 14px", fontSize: 10 }} onClick={() => setGeneratedContent(null)}>↺ REGEN</button>
                    </div>
                  </div>
                  <div style={{ background: "#0d0d18", border: "1px solid #1e1e30", padding: 20 }}>
                    <pre style={{ color: "#ccc", fontSize: 11.5, lineHeight: 1.9, whiteSpace: "pre-wrap", fontFamily: "inherit", margin: 0 }}>
                      {generatedContent.script}
                    </pre>
                  </div>
                  <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                    <button style={{ background: "#6b3fa0", border: "none", color: "white", padding: "8px 16px", cursor: "pointer", fontFamily: "inherit", fontSize: 11, letterSpacing: 1, fontWeight: 700 }}
                      onClick={() => updateStatus(selected.id, "Call Scheduled")}>
                      📅 MARK CALL SCHEDULED
                    </button>
                    <button style={{ background: "#8a4000", border: "none", color: "white", padding: "8px 16px", cursor: "pointer", fontFamily: "inherit", fontSize: 11, letterSpacing: 1, fontWeight: 700 }}
                      onClick={() => updateStatus(selected.id, "Call Done")}>
                      ✓ MARK CALL DONE
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid #1e1e30", padding: "10px 24px", display: "flex", justifyContent: "space-between", fontSize: 10, color: "#333" }}>
        <span>USYNC INVESTOR AGENT — PRE-SEED RAISE $100K–$500K</span>
        <span>BUILD WITH BHARAT · {new Date().getFullYear()}</span>
      </div>
    </div>
  );
}
