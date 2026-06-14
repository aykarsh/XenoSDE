import { useState, useEffect, useRef } from "react";
import {
  ArrowUpRight, Play, ChevronRight, Zap, CheckCircle,
  Trash2, Edit3, Sparkles, Globe, Activity, Shield,
  Database, Cpu, BarChart3, Users, Send, Eye, RefreshCw
} from "lucide-react";
import "./index.css";
import api from "./utils/api";


// ─── Constant Data ──────────────────────────────────────────────────

const MARQUEE_TOKENS = [
  "FastAPI", "PostgreSQL", "Celery", "Redis Task Queue",
  "Structured Groq Parsing", "WhatsApp Business Engine",
  "SMS Gateway", "RCS Routing", "Closed-Loop Webhooks",
  "Idempotency Guards", "Real-time Cohort SQL",
  "llama-3.1-8b-instant", "Campaign State Machine", "Dynamic Segmentation",
];

const RETAILER_EVENTS = [
  { id: 1, title: "Air Jordan 1 Retro Drop", date: "June 18", tag: "Sneakerheads, Ages 18-35" },
  { id: 2, title: "Summer Sale Event", date: "June 25", tag: "All Customers" },
  { id: 3, title: "VIP Early Access", date: "June 15", tag: "High-LTV Customers" },
];

const PROPOSALS = [
  {
    id: 1,
    title: "Churn Risk x Jordan Drop",
    channel: "STUB",
    targeting: "1,420 lapsed users (Inactive > 90 Days, High LTV)",
    reasoning: "Targeting customers who have gone cold in the past 90 days but match high-tier spend profiles for footwear launches.",
    copy: "Hey {{first_name}}! The exclusive Air Jordan 1 Retro drops in 48h. We saved your size. Claim early access: [link]",
    status: "DRAFT",
  },
  {
    id: 2,
    title: "New Collection Launch",
    channel: "STUB",
    targeting: "890 VIP customers (LTV > $2,000, Last order < 30d)",
    reasoning: "Top-tier spenders who engaged within the last 30 days — prime targets for exclusive first-look campaigns.",
    copy: "{{first_name}}, you're on the VIP list. New collection drops tomorrow. Shop first: [link]",
    status: "DRAFT",
  },
  {
    id: 3,
    title: "Summer Flash Sale Alert",
    channel: "STUB",
    targeting: "5,200 active subscribers (All segments)",
    reasoning: "Broad reach campaign timed to the Summer Sale Event on June 25. Urgency-driven copy to maximise conversions.",
    copy: "The Summer Sale is LIVE! Up to 40% off — don't miss your window. Shop now: [link]",
    status: "DRAFT",
  }
];

const SPEC_GRID = [
  {
    icon: <Shield size={20} />,
    title: "Idempotency Guards",
    desc: "Strict validation checks on the webhook /receipt listener to prevent out-of-order callback states or duplicate packet network contamination.",
  },
  {
    icon: <Activity size={20} />,
    title: "Saturation Controls",
    desc: "Automated marketing fatigue boundaries tracking transaction logs and imposing cooling thresholds to protect target recipient nodes.",
  },
  {
    icon: <Database size={20} />,
    title: "Relational Integrity",
    desc: "Clean PostgreSQL structures with comprehensive connection pooling limits and indexed lookups on campaign tracking identifiers.",
  },
  {
    icon: <Cpu size={20} />,
    title: "Async Processing Architecture",
    desc: "Fully distributed asynchronous worker topology built using Celery and Redis to handle continuous communication delivery workloads reliably.",
  },
];

const NAV_LINKS = ["Analytics", "Cohort Studio", "AI Proposer", "Manual Campaign" , "Sandbox"];

const CHANNEL_COLORS = {
  WHATSAPP: "bg-green-500/10 text-green-400 border-green-500/40",
  SMS: "bg-blue-500/10  text-blue-400  border-blue-500/40",
  EMAIL: "bg-amber-500/10 text-amber-400 border-amber-500/40",
  RCS: "bg-purple-500/10 text-purple-400 border-purple-500/40",
};

// ─── Logo SVG ───────────────────────────────────────────────────────

function Logo() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="flex-shrink-0">
      <circle cx="24" cy="24" r="20" stroke="#FFF8F0" strokeWidth="1.2" />
      <path d="M14 24 L20 18 L26 24 L32 18" stroke="#C08552" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 30 L20 24 L26 30 L32 24" stroke="#FFF8F0" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
      <circle cx="32" cy="18" r="2.5" fill="#C08552" />
    </svg>
  );
}

// ─── Navigation ─────────────────────────────────────────────────────

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("Analytics");

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 150);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // 🧠 2. Modern scroll handler with fallback safety check parameters
  const handleNavigation = (linkName) => {
    setActive(linkName);

    // Formats mapping: "Cohort Studio" -> "cohort-studio"
    const targetId = linkName ? linkName.toLowerCase().replace(/\s+/g, "-") : "";
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <nav 
      className={`fixed top-4 left-1 right-20 z-50 flex items-center justify-between px-6 transition-all duration-500
        ${scrolled 
          ? "opacity-100 pointer-events-auto translate-y-0" 
          : "opacity-0 pointer-events-none -translate-y-4"
        }`}
    >
      {/* Placeholder fallback for Logo element if context isn't globally imported */}
      {scrolled && <div className="text-[#FFF8F0] font-heading text-sm tracking-widest">XENO</div>}
      
      {/* Center pill */}
      {/* 💡 Note: Removed translate-x-[-485px] and added mx-auto so it centers automatically */}
      <div className="liquid-glass rounded-full px-5 py-2.5 flex justify-center gap-6 mx-auto">
        {NAV_LINKS.map(link => (
          <button
            key={link}
            onClick={() => handleNavigation(link)} // 👈 Triggers our smooth navigation engine
            className={`text-xs font-body font-medium tracking-wide transition-all duration-200
              ${active === link ? "text-[#C08552]" : "text-[#FFF8F0]/60 hover:text-[#FFF8F0]"}`}
          >
            {link}
          </button>
        ))}
      </div>
    </nav>
  );
}
// ─── Hero ────────────────────────────────────────────────────────────

function Hero() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  return (
    <section className="relative min-h-[900px] flex flex-col items-center justify-center overflow-hidden bg-[#0B0706]">

      {/* Ambient noise layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* radial gradient blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px]
          bg-[#4B2E2B] rounded-full blur-[120px] animate-pulse-glow opacity-20" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[200px]
          bg-[#C08552] rounded-full blur-[100px] opacity-8 animate-pulse-glow" style={{ animationDelay: "1s" }} />
        {/* SVG noise grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#FFF8F0" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        {/* Mask fade at top */}
        <div className="absolute inset-x-0 top-0 h-[20%] bg-gradient-to-b from-[#0B0706] to-transparent" />
        {/* Mask fade at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-[20%] bg-gradient-to-t from-[#0B0706] to-transparent" />
      </div>

      <div className={`relative z-10 flex flex-col items-center text-center px-6 max-w-4xl mx-auto
        transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>

        {/* Heading */}
        <h1 className="font-heading italic text-[#FFF8F0] text-6xl md:text-7xl tracking-tight leading-[0.95] mb-7">
          Code that segments.<br />
          <span className="text-gradient">Systems that convert.</span>
        </h1>

        {/* Subtext */}
        <p className="text-[#FFF8F0]/60 font-body font-light text-base tracking-wide mb-12 max-w-2xl leading-relaxed">
          An AI-native CRM built to orchestrate high-throughput, multi-channel messaging loops
          over reliable, closed-loop state machines.
        </p>

        {/* CTAs */}
        <div className="flex items-center gap-5">
          
        </div>

        {/* Floating metric cards */}
        <div className="mt-20 flex gap-4 flex-wrap justify-center">
          {[
            { label: "Messages Processed", value: "24.8K", delta: "+12.6%" },
            { label: "Avg Delivery Rate", value: "92%", delta: "Healthy" },
            { label: "Active Campaigns", value: "7", delta: "Running" },
          ].map((m) => (
            <div key={m.label} className="liquid-glass rounded-2xl px-5 py-4 text-left min-w-[150px]">
              <div className="text-[#FFF8F0]/40 text-[10px] font-body tracking-widest uppercase mb-1">{m.label}</div>
              <div className="text-[#FFF8F0] text-2xl font-heading">{m.value}</div>
              <div className="text-[#C08552] text-[10px] font-body font-medium mt-0.5">{m.delta}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Marquee ─────────────────────────────────────────────────────────

function MarqueeSection() {
  const tokens = [...MARQUEE_TOKENS, ...MARQUEE_TOKENS];
  return (
    <section className="relative py-5 bg-[#0B0706] border-y border-[#8C5A3C]/20 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap gap-0" style={{ width: "max-content" }}>
        {tokens.map((t, i) => (
          <span key={i} className="inline-flex items-center gap-3 px-5">
            <span className="text-[#FFF8F0]/40 text-xs font-body tracking-wider uppercase">{t}</span>
            <span className="w-1 h-1 rounded-full bg-[#C08552]/50" />
          </span>
        ))}
      </div>
    </section>
  );
}

// ─── Analytics Engine ─────────────────────────────────────────────────

function AnalyticsEngine() {
  const [bars, setBars] = useState(
    Array.from({ length: 24 }, () => Math.floor(Math.random() * 80) + 10)
  );
  const [overview, setOverview] = useState({ queued: 0, sent: 0, delivered: 0, read: 0, clicked: 0, delivery_rate: 0 });
  const [isRefreshing, setIsRefreshing] = useState(false); // Tracks spinner animation state

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      const response = await api.get("/api/analytics/overview");
      setOverview(response.data);
      setBars(Array.from({ length: 24 }, (_, index) => {
        const base = response.data.delivered / 300;
        return Math.max(10, Math.min(90, base + ((index % 6) * 4) + Math.round(Math.random() * 10)));
      }));
    } catch (error) {
      console.error("Failed to refresh analytics overview", error);
    } finally {
      // Small timeout to give the visual spinner transition a satisfying weight
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  // Run exactly once when the dashboard section mounts to pull initial statistics
  useEffect(() => {
    refresh();
  }, []);

  const statuses = [
    { label: "QUEUED", val: `${(overview.queued / 1000).toFixed(1)}K`, color: "#C08552" },
    { label: "SENT", val: `${(overview.sent / 1000).toFixed(1)}K`, color: "#8C5A3C" },
    { label: "DELIVERED", val: `${(overview.delivered / 1000).toFixed(1)}K`, color: "#FFF8F0" },
    { label: "READ", val: `${(overview.read / 1000).toFixed(1)}K`, color: "#C08552" },
    { label: "CLICKED", val: `${(overview.clicked / 1000).toFixed(1)}K`, color: "#8C5A3C" },
  ];

  return (
    <section className="relative py-28 bg-[#0B0706] overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">

        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-6">
          <div>
            <h2 className="font-heading italic text-[#FFF8F0] text-5xl tracking-tight leading-[0.95] mb-4">
              The Live Analytics Engine
            </h2>
            <p className="text-[#FFF8F0]/50 font-body font-light text-sm tracking-wide max-w-2xl leading-relaxed">
              Closed-loop attribution system processing real-time webhooks (QUEUED → SENT → DELIVERED → READ → CLICKED)
              paired with automated lookback window attribution matching incoming sales data directly to sent marketing tokens.
            </p>
            <div className="flex items-center gap-3 mt-3 text-[#FFF8F0]/30 text-xs font-body">
              <span className="flex items-center gap-1"><Cpu size={11} /> Python FastAPI</span>
              <span>·</span>
              <span className="flex items-center gap-1"><Activity size={11} /> Celery</span>
              <span>·</span>
              <span className="flex items-center gap-1"><Database size={11} /> Redis Event Streams</span>
            </div>
          </div>

          {/* ➕ Manual Refresh Sync Trigger Anchor */}
          <button
            onClick={refresh}
            disabled={isRefreshing}
            className="liquid-glass hover:bg-[#FFF8F0]/5 text-[#FFF8F0]/80 hover:text-[#FFF8F0] px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-body tracking-wider transition-all duration-300 disabled:opacity-50 self-start md:self-auto"
          >
            <RefreshCw size={13} className={`text-[#C08552] ${isRefreshing ? "animate-spin" : ""}`} />
            SYNC REALTIME TELEMETRY
          </button>
        </div>

        {/* Main dashboard preview */}
        <div className="liquid-glass-strong rounded-3xl p-6 overflow-hidden">
          <div className="grid grid-cols-6 gap-4 mb-5">
            {statuses.map(s => (
              <div key={s.label} className="liquid-glass rounded-xl p-4">
                <div className="text-[10px] text-[#FFF8F0]/40 font-body tracking-widest uppercase mb-1">{s.label}</div>
                <div className="text-[#FFF8F0] text-xl font-heading">{s.val}</div>
                <div className="w-full h-0.5 rounded-full mt-2" style={{ background: `linear-gradient(to right, ${s.color}80, transparent)` }} />
              </div>
            ))}
            {/* Donut metric */}
            <div className="liquid-glass rounded-xl p-4 flex flex-col items-center justify-center">
              <div className="relative w-14 h-14">
                <svg viewBox="0 0 56 56" className="w-full h-full -rotate-90">
                  <circle cx="28" cy="28" r="22" fill="none" stroke="#4B2E2B" strokeWidth="5" />
                  <circle cx="28" cy="28" r="22" fill="none" stroke="#C08552" strokeWidth="5"
                    /* 🧠 Dynamically binds the circular stroke ring math using the real delivery rate percentage value */
                    strokeDasharray={`${2 * Math.PI * 22 * (Math.min(100, Math.max(0, overview.delivery_rate)) / 100)} ${2 * Math.PI * 22}`} 
                    strokeLinecap="round" 
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[#FFF8F0] text-xs font-heading">{overview.delivery_rate}%</div>
              </div>
              <div className="text-[10px] text-[#FFF8F0]/40 font-body tracking-wider mt-1 uppercase">Delivery Rate</div>
            </div>
          </div>

          {/* Real-time bar chart */}
          <div className="liquid-glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#FFF8F0]/60 text-xs font-body font-medium tracking-widest uppercase">Message Volume History</span>
              <span className="flex items-center gap-1 text-[#C08552] text-xs font-body font-medium tracking-wide">
                <span className={`w-1.5 h-1.5 rounded-full bg-[#C08552] ${isRefreshing ? "animate-ping" : "opacity-80"}`} />
                {isRefreshing ? "SYNCING..." : "SNAPSHOT CURRENT"}
              </span>
            </div>
            <div className="flex items-end gap-1 h-32">
              {bars.map((h, i) => (
                <div key={i} className="flex-1 rounded-sm transition-all duration-700 ease-in-out"
                  style={{
                    height: `${h}%`,
                    background: i % 4 === 0
                      ? `rgba(192,133,82,${0.5 + h / 200})`
                      : `rgba(255,248,240,${0.08 + h / 400})`,
                  }}
                />
              ))}
            </div>
            {/* State pipeline flow */}
            <div className="flex items-center gap-2 mt-5 overflow-x-auto no-scrollbar">
              {["QUEUED", "SENT", "DELIVERED", "READ", "CLICKED"].map((s, i, arr) => (
                <div key={s} className="flex items-center gap-2 flex-shrink-0">
                  <div className={`text-[10px] font-body font-medium px-2.5 py-1 rounded-full
                    ${i === 0 ? "bg-[#C08552]/20 text-[#C08552]" : i === 4 ? "bg-[#FFF8F0]/10 text-[#FFF8F0]/70" : "bg-[#8C5A3C]/20 text-[#FFF8F0]/50"}`}>
                    {s}
                  </div>
                  {i < arr.length - 1 && <span className="text-[#FFF8F0]/20 text-[10px]">→</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Natural Language Cohort Studio ──────────────────────────────────

function CohortStudio() {
  const [query, setQuery] = useState("VIP customers from past 90 days with spend > $1000");
  const [loading, setLoading] = useState(false);
  const [segmentResult, setSegmentResult] = useState({ sql: "", total_count: 0, samples: [] });

  const handleParse = async () => {
    setLoading(true);
    try {
      const response = await api.post("/api/segments/parse-nl", { text: query },{
        params: {
          _cb: new Date().getTime() // 👈 Forces the browser network layer to treat this call as a completely new pipeline event
        },
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
    setSegmentResult(response.data);
      setSegmentResult(response.data);
    } catch (error) {
      console.error("Failed to parse segment prompt", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative py-24 bg-[#0B0706]">
      <div className="max-w-6xl mx-auto px-6">

        <div className="mb-10">
          <span className="text-[#C08552] text-xs font-body tracking-widest uppercase font-medium">Sub-Module 01</span>
          <h2 className="font-heading italic text-[#FFF8F0] text-5xl tracking-tight leading-[0.95] mt-2 mb-3">
            Natural Language Cohort Studio
          </h2>
          <p className="text-[#FFF8F0]/40 font-body font-light text-sm tracking-wide">
            Context-Aware Audience Segmentation
          </p>
        </div>

        {/* Studio card */}
        <div className="liquid-glass-strong rounded-3xl p-8" style={{ boxShadow: "inset 0 0 0 1px rgba(192,133,82,0.15), 4px 4px 12px rgba(11,7,6,0.5)" }}>

          <label className="text-[#FFF8F0]/40 text-xs font-body tracking-widest uppercase block mb-3">
            Describe your audience in natural language
          </label>

          {/* Input */}
          <div className="relative rounded-xl overflow-hidden mb-5"
            style={{ boxShadow: "0 0 0 1.5px #C08552, 0 0 24px rgba(192,133,82,0.15)" }}>
            <input
              id="nl-segment-input"
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleParse()}
              className="w-full bg-[#0B0706]/80 text-[#FFF8F0]/80 font-mono text-sm px-5 py-4
                focus:outline-none placeholder:text-[#FFF8F0]/20 tracking-wide"
              placeholder='e.g. "Churned users from India inactive for 60+ days"'
            />
            <button onClick={handleParse}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C08552] hover:scale-110 transition-transform">
              <Zap size={16} />
            </button>
          </div>

          <p className="text-[#FFF8F0]/30 font-body font-light text-xs leading-relaxed mb-6">
            Replaces rigid regex layers with a Groq SDK wrapper running structured json_object parsing pipelines.
            Generates sanitized PostgreSQL dynamic WHERE queries instantly alongside a visible tabular dataset sample preview.
          </p>

          {/* Table */}
          <div className="overflow-hidden rounded-xl">
            <table className="w-full text-xs font-body">
              <thead>
                <tr className="border-b border-[#8C5A3C]/20">
                  {["Customer ID", "Segment", "Spend", "Status"].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-[#C08552] font-medium tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {segmentResult.samples.map((row, i) => (
                  <tr key={row.id} className={`border-b border-[#FFF8F0]/5 hover:bg-[#FFF8F0]/3 transition-colors
                    ${loading ? "opacity-40" : "opacity-100"} transition-opacity duration-300`}>
                    <td className="py-3 px-4 text-[#FFF8F0]/70 font-mono">{row.id}</td>
                    <td className="py-3 px-4 text-[#FFF8F0]/60">{row.email}</td>
                    <td className="py-3 px-4 text-[#FFF8F0]/70 font-mono">{row.lifetime_spend}</td>
                    <td className="py-3 px-4">
                      <span className="bg-[#C08552]/15 text-[#C08552] border border-[#C08552]/30
                        text-[10px] px-2.5 py-0.5 rounded-full font-medium">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* SQL preview */}
          <div className="mt-5 bg-[#0B0706]/60 rounded-xl p-4 border border-[#8C5A3C]/15">
            <div className="text-[#FFF8F0]/20 text-[10px] font-body tracking-widest uppercase mb-2">Generated SQL Preview</div>
            <code className="text-[#C08552]/70 text-[11px] font-mono leading-relaxed block">
              {segmentResult.sql || `SELECT * FROM customers\n  WHERE lifetime_spend >= 1000\n    AND last_order_at >= NOW() - INTERVAL '90 days'\n  ORDER BY lifetime_spend DESC\n  LIMIT 100;`}
            </code>
          </div>
          <div className="mt-4 text-[#FFF8F0]/40 text-xs font-body">
            Total Cohort Nodes: <span className="text-[#FFF8F0]">{segmentResult.total_count || 0}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Proposal Card ────────────────────────────────────────────────────

function ProposalCard({ proposal, onApprove, onDiscard }) {
  const [copy, setCopy] = useState(proposal.generated_copy || proposal.copy || "");
  const [status, setStatus] = useState(proposal.status);
  const [submitting, setSubmitting] = useState(false);

  if (status === "DISCARDED") return null;
  if (status === "APPROVED") {
    return (
      <div className="liquid-glass rounded-2xl p-6 flex flex-col items-center justify-center gap-2 min-h-[120px]">
        <CheckCircle size={22} className="text-[#C08552]" />
        <p className="text-[#FFF8F0]/60 text-xs font-body text-center">
          Campaign <strong className="text-[#FFF8F0]/80">"{proposal.campaign_name || proposal.title}"</strong> approved & enqueued.
        </p>
      </div>
    );
  }

  // ⚡ Handles execution sync directly across the API layer

  const handleDiscardClick = async () => {
    setSubmitting(true);
    try {
      // 1. Fire the database removal command to your router
      await api.delete(`/api/campaigns/v2/proposals/${proposal.id}`);
      
      // 2. Hide the element visually right away
      setStatus("DISCARDED");
      
      // 3. Notify the parent loop filter state if provided
      if (typeof onDiscard === "function") {
        onDiscard(proposal.id);
      }
    } catch (error) {
      console.error("Failed to drop campaign record from backend persistence:", error);
      alert("Failed to drop campaign record from backend tables.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="liquid-glass-strong rounded-2xl overflow-hidden" style={{ borderTop: "2px solid #C08552" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#8C5A3C]/20">
        <h3 className="font-heading italic text-[#FFF8F0] text-base flex items-center gap-2">
          <Sparkles size={14} className="text-[#C08552]" />
          AI PROPOSAL: {proposal.campaign_name || proposal.title}
        </h3>
        <span className={`text-xs px-2 py-0.5 rounded-full border font-body font-medium
          ${CHANNEL_COLORS[proposal.selected_channel || proposal.channel] || "bg-[#8C5A3C]/30 text-[#FFF8F0] border-[#8C5A3C]/60"}`}>
          {proposal.selected_channel || proposal.channel}
        </span>
      </div>

      <div className="px-5 py-4">
        {/* Targeting */}
        <p className="text-[#FFF8F0]/50 text-xs font-body mb-1">
          <span className="font-medium text-[#FFF8F0]/70">Targeting:</span> {proposal.targeting}
        </p>
        {/* Reasoning */}
        <p className="text-[#FFF8F0]/40 font-body font-light text-xs leading-relaxed mb-4">
          {proposal.target_reasoning || proposal.reasoning}
        </p>

        {/* Editable textarea */}
        <div className="mb-1">
          <label className="text-[#FFF8F0]/30 text-[10px] font-body tracking-widest uppercase block mb-1.5">
            Message Template (Editable)
          </label>
          <textarea
            id={`msg-${proposal.id}`}
            rows={3}
            value={copy}
            onChange={e => setCopy(e.target.value)}
            className="w-full bg-[#0B0706]/40 border border-[#8C5A3C]/20 rounded-xl p-3
              font-mono text-xs text-[#FFF8F0]/80 focus:border-[#C08552] focus:outline-none
              transition-all duration-200 resize-none leading-relaxed"
          />
        </div>
      </div>

      {/* Action tray */}
      <div className="flex items-center justify-between px-5 pb-5 gap-3">
        <button
          onClick={handleDiscardClick} // ⚡ CONNECTED TO THE ASYNC DATABASE CLEANER
          disabled={submitting}
          className="text-[#FFF8F0]/40 hover:text-red-400 hover:bg-red-500/10
            text-xs px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-1.5 font-body disabled:opacity-50"
        >
          <Trash2 size={12} /> {submitting ? "Scrubbing..." : "Discard"}
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              setSubmitting(true);
              try {
                await api.post("/api/campaigns/approve", {
                  proposal_id: proposal.id,
                  custom_copy: copy,
                });
                setStatus("APPROVED");
              } catch (error) {
                console.error("Failed to approve campaign", error);
              } finally {
                setSubmitting(false);
              }
            }}
            disabled={submitting}
            className="bg-[#FFF8F0] text-[#4B2E2B] font-body font-medium text-xs px-4 py-2
              rounded-full hover:bg-[#C08552] hover:text-[#FFF8F0] transition-all duration-300
              shadow-md flex items-center gap-1.5 disabled:opacity-60"
          >
            <CheckCircle size={12} /> {submitting ? "APPROVING..." : "APPROVE & LAUNCH"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Retailer Event Copilot ──────────────────────────────────────────

function RetailerCopilot() {
  // 🧠 Initialize the state directly with your local list so something is visible immediately
  const [proposals, setProposals] = useState(PROPOSALS);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get("/api/campaigns/v2/proposals");
        
        // 🧠 Check if the backend actually returned data
        if (response.data && response.data.length > 0) {
          setProposals(
            response.data.map((proposal) => ({
              ...proposal,
              targeting:
                proposal.targeting ||
                proposal.target_segment_summary?.title ||
                proposal.target_segment_summary?.rule ||
                "Audience defined by backend proposal data",
            }))
          );
        } else {
          // 🧠 Fallback to local proposals if backend returns an empty array
          console.log("Backend returned 0 proposals. Displaying pre-seeded local strategy assets.");
          setProposals(PROPOSALS);
        }
      } catch (error) {
        console.error("Failed to load proposals from backend, using local fallbacks.", error);
        // 🧠 Fallback if the network or endpoint errors out entirely
        setProposals(PROPOSALS);
      }


      const handleManualProposalAdded = (newCard) => {
    setProposals((prevProposals) => [newCard, ...prevProposals]);
      };


      const handleDiscardProposal = async (proposalId) => {
        try {
    // 1. Send the DELETE command across the network bridge to the database
          await api.delete(`/api/campaigns/v2/proposals/${proposalId}`);
    
    // 2. Clear it from local React layout state array upon server validation success
          setProposals((prevProposals) => prevProposals.filter((p) => p.id !== proposalId));
    
          console.log(`Successfully scrubbed proposal ${proposalId} from persistence.`);
        } catch (error) {
          console.error("Failed to sync discard parameter execution to database engine:", error);
          alert("Failed to drop campaign record from backend tables.");
        }
      };
    };

    load();
  }, []);

  return (
    <section className="relative py-24 bg-[#0B0706]">
      <div className="max-w-6xl mx-auto px-6">

        <div className="mb-10">
          <span className="text-[#C08552] text-xs font-body tracking-widest uppercase font-medium">Sub-Module 02</span>
          <h2 className="font-heading italic text-[#FFF8F0] text-5xl tracking-tight leading-[0.95] mt-2 mb-3">
            Retailer Event-Aware AI Copilot
          </h2>
          <p className="text-[#FFF8F0]/40 font-body font-light text-sm tracking-wide">
            Mixed-Initiative Campaign Orchestration (Human-in-the-Loop AI)
          </p>
        </div>

        <div className="grid grid-cols-5 gap-6">

          {/* Left 40% — brand milestones */}
          <div className="col-span-2 flex flex-col gap-4">
            <h3 className="text-[#FFF8F0]/60 font-body font-medium text-xs tracking-widest uppercase">
              Brand Milestones & Context
            </h3>
            {/* 🧠 Quick Safety Check: Ensuring RETAILER_EVENTS exists or falls back to an empty array so it won't crash */}
            {(typeof RETAILER_EVENTS !== 'undefined' ? RETAILER_EVENTS : []).map(evt => (
              <div key={evt.id} className="liquid-glass rounded-2xl p-5 hover:bg-[#4B2E2B]/20 transition-all duration-200 cursor-pointer group">
                <div className="flex items-start justify-between mb-2">
                  <span className="font-heading italic text-[#FFF8F0] text-sm group-hover:text-[#C08552] transition-colors">{evt.title}</span>
                </div>
                <div className="text-[#FFF8F0]/30 font-body text-xs mb-3">{evt.date}</div>
                <span className="bg-[#C08552]/10 text-[#C08552]/70 text-[10px] font-body
                  px-2.5 py-1 rounded-full border border-[#C08552]/20">{evt.tag}</span>
              </div>
            ))}

            {/* Add event stub */}
            <div className="liquid-glass rounded-2xl p-5 border-dashed cursor-pointer hover:border-[#C08552]/40 transition-all duration-200
              flex items-center gap-3 text-[#FFF8F0]/20 hover:text-[#FFF8F0]/40">
              <span className="text-xl leading-none">+</span>
              <span className="font-body text-xs">Add Retailer Event</span>
            </div>
          </div>

          {/* Right 60% — proposal stream */}
          <div className="col-span-3 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[#FFF8F0]/60 font-body font-medium text-xs tracking-widest uppercase">
                Autonomous Campaign Proposals
              </h3>
              <span className="flex items-center gap-1 text-[#C08552] text-[10px] font-body">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C08552] animate-pulse" />
                GROQ WORKER ACTIVE
              </span>
            </div>
            {proposals.map(p => (
              <ProposalCard key={p.id} proposal={p} 
              onDiscard={(discardedId) => {
              setProposals((prev) => prev.filter(item => item.id !== discardedId));
            }}/>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ---Manual Campaign Card ----------------------------------------------

function ManualCampaignForge({ onProposalCreated }) {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    channel: 'whatsapp',
    message_template: '',
    min_spend: '',
    inactive_days: '',
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

// 🧠 Inside your Manual Campaign Form component (e.g., in App.jsx or ManualCampaignForge.jsx)
const handleFormSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);

  const submitPayload = {
    name: formData.name,
    channel: formData.channel || "whatsapp",
    message_template: formData.message_template,
    segment_filters: {
      min_spend: formData.min_spend ? parseFloat(formData.min_spend) : 0,
      max_spend: 0,
      min_orders: 0,
      max_orders: 0,
      inactive_days: formData.inactive_days ? parseInt(formData.inactive_days) : 0,
      last_order_before: new Date().toISOString(),
      last_order_after: new Date().toISOString(),
      countries: ["all"],
      acquisition_sources: ["all"],
      search_text: "",
      limit: 100,
      offset: 0,
      sort_by: "created_at",
      sort_order: "asc"
    },
    customer_ids: [0],
    dry_run: false
  };

  try {
    const response = await api.post("/api/campaigns/v2/manual-proposals", submitPayload);
    const responseData = response.data || response;

    if (!responseData) {
      throw new Error("Empty execution payload returned from the network middleware.");
    }
    
    // 🧠 Map the backend response keys to match what your expanded <ProposalCard /> templates expect
    const newlyCreatedCard = {
      id: responseData.id || Date.now(),
      title: responseData.campaign_name || formData.name,
      channel: responseData.selected_channel || formData.channel || "whatsapp",
      targeting: `Min Spend: ₹${formData.min_spend || '0'} | Dormancy: ${formData.inactive_days || '0'} Days`,
      reasoning: responseData.target_reasoning || "Manually drafted customer segment marketing protocol.",
      copy: responseData.generated_copy || formData.message_template,
      status: responseData.status || 'DRAFT'
    };

    // ⚡ THE FIX: Pass the newly built card up to the parent layer instead of calling setProposals here
    if (typeof onProposalCreated === "function") {
      onProposalCreated(newlyCreatedCard);
    }
    
    if (typeof setIsModalOpen === "function") setIsModalOpen(false);
    setFormData({ name: '', channel: 'whatsapp', message_template: '', min_spend: '', inactive_days: '' });
    alert("⚡ Manual Campaign Proposal compiled and committed successfully!");

  } catch (error) {
    console.error("UI Core Mapping Processing Failure:", error);
    alert(`Failed to process server response: ${error.message}`);
  } finally {
    setSubmitting(false);
  }
};

  return (
    <section className="relative py-16 bg-[#0B0706] border-t border-[#FFF8F0]/10">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Section Heading matching Sub-Module Typography layouts */}
        <div className="mb-8">
          <span className="text-[#C08552] text-xs font-body tracking-widest uppercase font-medium">Sub-Module 03</span>
          <h2 className="font-heading italic text-[#FFF8F0] text-4xl tracking-tight mt-1 mb-2">
            Manual Campaign Builder Override
          </h2>
          <p className="text-[#FFF8F0]/40 font-body font-light text-xs tracking-wide">
            Direct database schema serialization ingestion engine (Bypasses LLM Generation pipeline)
          </p>
        </div>

        {/* Form Core built over liquid-glass architecture */}
        <div className="liquid-glass rounded-2xl p-8 max-w-3xl mx-auto border border-[#FFF8F0]/5 bg-[#FFF8F0]/[0.01]">
          <form onSubmit={handleFormSubmit} className="flex flex-col gap-5">
            
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#FFF8F0]/40 mb-1.5 font-body font-medium">Campaign Configuration Name</label>
              <input 
                required 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleInputChange} 
                className="w-full bg-[#0B0706]/60 border border-[#FFF8F0]/10 rounded-xl px-4 py-3 text-xs text-[#FFF8F0] focus:outline-none focus:border-[#C08552] font-body transition-colors" 
                placeholder="e.g., Q2 Chennai High-Value In-Store Push" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#FFF8F0]/40 mb-1.5 font-body font-medium">Target Broadcast Channel</label>
                <select 
                  name="channel" 
                  value={formData.channel} 
                  onChange={handleInputChange} 
                  className="w-full bg-[#0B0706]/60 border border-[#FFF8F0]/10 rounded-xl px-4 py-3 text-xs text-[#FFF8F0] focus:outline-none focus:border-[#C08552] font-body transition-colors"
                >
                  <option value="whatsapp" className="bg-[#0B0706]">WhatsApp Business Protocol</option>
                  <option value="sms" className="bg-[#0B0706]">SMS Transactional Gateway</option>
                  <option value="email" className="bg-[#0B0706]">Enterprise Email Engine</option>
                  <option value="rcs" className="bg-[#0B0706]">RCS Rich Business Messaging</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#FFF8F0]/40 mb-1.5 font-body font-medium">Cohort Minimum Spend Threshold (LTV)</label>
                <input 
                  type="number" 
                  name="min_spend" 
                  value={formData.min_spend} 
                  onChange={handleInputChange} 
                  className="w-full bg-[#0B0706]/60 border border-[#FFF8F0]/10 rounded-xl px-4 py-3 text-xs text-[#FFF8F0] focus:outline-none focus:border-[#C08552] font-body transition-colors" 
                  placeholder="e.g., 15000" 
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#FFF8F0]/40 mb-1.5 font-body font-medium">Target Dormancy Window (Days Inactive)</label>
              <input 
                type="number" 
                name="inactive_days" 
                value={formData.inactive_days} 
                onChange={handleInputChange} 
                className="w-full bg-[#0B0706]/60 border border-[#FFF8F0]/10 rounded-xl px-4 py-3 text-xs text-[#FFF8F0] focus:outline-none focus:border-[#C08552] font-body transition-colors" 
                placeholder="e.g., 90" 
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#FFF8F0]/40 mb-1.5 font-body font-medium">Message Copy Template Payload</label>
              <textarea 
                required 
                name="message_template" 
                rows="4" 
                value={formData.message_template} 
                onChange={handleInputChange} 
                className="w-full bg-[#0B0706]/60 border border-[#FFF8F0]/10 rounded-xl px-4 py-3 text-xs text-[#FFF8F0] font-mono focus:outline-none focus:border-[#C08552] transition-colors leading-relaxed" 
                placeholder="Hey {{first_name}}! Your curated collection is waiting. Claim free early access token here: [link]"
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              className="mt-2 w-full bg-[#C08552] text-[#FFF8F0] font-body text-xs font-semibold py-3.5 rounded-xl hover:bg-[#a67243] transition-all duration-200 uppercase tracking-widest disabled:opacity-40"
            >
              {submitting ? "Pushing Ingestion Record..." : "⚡ Serialize & Inject Manual Proposal"}
            </button>

          </form>
        </div>

      </div>
    </section>
  );
}

// ─── Spec Grid ────────────────────────────────────────────────────────

function SpecGrid() {
  return (
    <section className="relative py-24 bg-[#0B0706]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-12 text-center">
          <h2 className="font-heading italic text-[#FFF8F0] text-5xl tracking-tight leading-[0.95] mb-3">
            Infrastructure Rigor & Fault Tolerance
          </h2>
          <p className="text-[#FFF8F0]/40 font-body font-light text-sm max-w-xl mx-auto leading-relaxed">
            High-reliability system choices made across the application stack.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-5">
          {SPEC_GRID.map((item) => (
            <div key={item.title} className="liquid-glass-strong rounded-2xl p-7 hover:bg-[#4B2E2B]/30 transition-all duration-300 group">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-[#C08552] group-hover:scale-110 transition-transform duration-200">{item.icon}</div>
                <h3 className="font-heading italic text-[#FFF8F0] text-xl">{item.title}</h3>
              </div>
              <p className="text-[#FFF8F0]/50 font-body font-light text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Simulation Terminal ──────────────────────────────────────────────

const EVENT_TYPES = ["QUEUED", "SENT", "DELIVERED", "READ", "CLICKED", "FAILED"];
const TOKENS = Array.from({ length: 8 }, (_, i) => `tok_${Math.random().toString(36).slice(2, 10)}`);

function SimulationTerminal() {
  const [count, setCount] = useState("50");
  const [jitter, setJitter] = useState("200");
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const logRef = useRef(null);
  const timersRef = useRef([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, []);

  const runSim = async () => {
    if (running) return;
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setLogs([]);
    setRunning(true);
    try {
      const response = await api.post("/api/simulation/trigger", {
        event_count: Number(count) || 10,
        delay_jitter: Number(jitter) || 200,
      });
      const eventCount = Math.max(1, Number(response.data.event_count) || 1);
      const baseDelay = Math.max(120, Number(response.data.delay_jitter) || 200);
      const statuses = ["QUEUED", "SENT", "DELIVERED", "READ", "CLICKED"];
      const tokens = Array.from({ length: Math.min(eventCount, 8) }, (_, index) => `event-${String(index + 1).padStart(2, "0")}`);

      tokens.forEach((token, tokenIndex) => {
        statuses.forEach((status, statusIndex) => {
          const timer = setTimeout(() => {
            const ts = new Date().toISOString().split("T")[1].split(".")[0];
            setLogs((current) => [...current, { ts, tok: token, st: status }]);
          }, tokenIndex * baseDelay * 1.2 + statusIndex * baseDelay);
          timersRef.current.push(timer);
        });
      });

      const completionTimer = setTimeout(() => {
        setRunning(false);
      }, tokens.length * baseDelay * 1.2 + statuses.length * baseDelay + baseDelay);
      timersRef.current.push(completionTimer);
    } catch (error) {
      console.error("Failed to trigger simulation", error);
      setRunning(false);
    }
  };

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  return (
    <section className="relative py-24 bg-[#0B0706]">
      <div className="max-w-4xl mx-auto px-6">
        <div className="liquid-glass-strong rounded-3xl p-10" style={{ background: "rgba(75,46,43,0.20)" }}>
          <div className="text-center mb-8">
            <h2 className="font-heading italic text-[#FFF8F0] text-4xl tracking-tight leading-[0.95] mb-3">
              Initiate real-time message stream simulation.
            </h2>
            <p className="text-[#FFF8F0]/40 font-body font-light text-sm">
              Simulate the full QUEUED → CLICKED state machine pipeline against live infrastructure.
            </p>
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[
              { label: "Simulated Event Count", val: count, set: setCount, id: "sim-count" },
              { label: "Network Jitter Delay (ms)", val: jitter, set: setJitter, id: "sim-jitter" },
            ].map(f => (
              <div key={f.label}>
                <label htmlFor={f.id} className="block text-[#FFF8F0]/40 text-[10px] font-body tracking-widest uppercase mb-2">{f.label}</label>
                <input
                  id={f.id}
                  type="number"
                  value={f.val}
                  onChange={e => f.set(e.target.value)}
                  className="w-full bg-[#4B2E2B]/30 border border-[#8C5A3C]/40 text-[#FFF8F0] font-body text-sm
                    px-4 py-3 rounded-xl focus:outline-none focus:border-[#C08552] transition-colors"
                />
              </div>
            ))}
          </div>

          {/* Log output */}
          <div ref={logRef} className="bg-[#0B0706]/80 rounded-2xl p-5 h-64 overflow-y-auto no-scrollbar font-mono
            text-xs leading-relaxed border border-[#8C5A3C]/20 mb-6">
            {logs.length === 0 && (
              <span className="text-[#FFF8F0]/20">
                {`> `}<span className="animate-blink">_</span>
                {` Awaiting simulation trigger...`}
              </span>
            )}
            {logs.map((l, i) => (
              <div key={i} className="mb-0.5">
                <span className="text-[#FFF8F0]/25">[{l.ts}]</span>
                {" "}
                <span className="text-[#FFF8F0]/50">token:</span>
                <span className="text-[#C08552]/80"> {l.tok}</span>
                {" → "}
                <span className={
                  l.st === "CLICKED" ? "text-green-400" :
                    l.st === "FAILED" ? "text-red-400" :
                      l.st === "DELIVERED" ? "text-[#C08552]" :
                        "text-[#FFF8F0]/60"
                }>{l.st}</span>
              </div>
            ))}
          </div>

          {/* Execute button */}
          <div className="flex justify-center">
            <button
              id="execute-simulation"
              onClick={runSim}
              disabled={running}
              className="flex items-center gap-2 bg-[#FFF8F0] text-[#4B2E2B] font-body font-semibold
                text-sm px-8 py-4 rounded-full hover:bg-[#C08552] hover:text-[#FFF8F0]
                transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
              <Play size={15} fill={running ? "currentColor" : "none"} />
              {running ? "Simulating…" : "Execute Sandbox Loop"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────

function Footer() {
  const links = [

    { label: "Backend Deployment", href: "https://xenosde.onrender.com/docs" },
    { label: "GitHub Codebase", href: "https://github.com/aykarsh/XenoSDE" },

  ];
  return (
    <footer className="relative pt-24 pb-10 overflow-hidden" style={{ background: "#0B0706" }}>
      {/* Deep radial fade */}
      <div className="absolute inset-x-0 top-0 h-[240px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(75,46,43,0.35) 0%, #0B0706 70%)" }} />

      <div className="relative max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Logo />
            <div>
              <div className="text-[#FFF8F0] font-heading italic text-lg">Xeno AI Engine</div>
              <div className="text-[#FFF8F0]/25 font-body text-[11px] mt-0.5">
                © 2026 Xeno AI Engine. Engineered for resilient, high-conversion communication architectures.
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {links.map(l => (
              <a key={l.label} href={l.href}
                className="text-[#FFF8F0]/30 hover:text-[#C08552] font-body text-xs tracking-wide transition-colors duration-200">
                {l.label}
              </a>
            ))}
          </div>
        </div>
        <div className="mt-10 border-t border-[#FFF8F0]/5 pt-6 flex items-center justify-between">
          <span className="text-[#FFF8F0]/10 font-body text-[10px] tracking-widest uppercase">
            v0.1.0 · FastAPI · PostgreSQL · Redis · Celery · Groq LLM
          </span>
          <span className="flex items-center gap-1.5 text-[#C08552]/50 text-[10px] font-body">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400/60 animate-pulse" />
            All Systems Operational
          </span>
        </div>
      </div>
    </footer>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────

export default function App() {
  const [active, setActive] = useState("Analytics");

  // Your navigation handler function
  const handleNavigation = (linkName) => {
    setActive(linkName);

    const targetId = linkName ? linkName.toLowerCase().replace(/\s+/g, "-") : "";
    console.log("👉 Looking for an element with id:", `"${targetId}"`);
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    else {
    // This warning will trigger if the ID is missing from your markup
    console.error(`❌ COULD NOT FIND ELEMENT: You need to add id="${targetId}" to a section component.`);
    }
  };
  return (
    <div className="min-h-screen" style={{ background: "#0B0706" }}>
      <Nav active={active} handleNavigation={handleNavigation} />
      <Hero />
      <MarqueeSection />
      
      {/* 🧠 Match these IDs exactly to the formatting strings used inside NAV_LINKS */}
      <section id="analytics" className="scroll-mt-24">
        <AnalyticsEngine />
      </section>

      <section id="cohort-studio" className="scroll-mt-34">
        <CohortStudio />
      </section>

      <section id="ai-proposer" className="scroll-mt-24">
        <RetailerCopilot />
      </section>
      
      <section id="manual-campaign" className="scroll-mt-24">
        <ManualCampaignForge />
      </section>

      <section id="sandbox" className="scroll-mt-24">
        <SimulationTerminal />
      </section>

      <Footer />
    </div>
  );
}
