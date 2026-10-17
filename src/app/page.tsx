"use client";

import Link from "next/link";
import { useState } from "react";

const steps = [
  { n: "01", title: "Capture the physical", desc: "Upload a photo or use your camera. Perspective correction prepares the sketch for analysis.", tag: "CAPTURE" },
  { n: "02", title: "Reconstruct the circuit", desc: "Review detected symbols, confirm wire connections, and correct uncertain components before simulation.", tag: "COMPUTER VISION" },
  { n: "03", title: "Verify the result", desc: "Run deterministic circuit analysis, inspect voltages and currents, and export an editable model.", tag: "SIMULATION" },
];
const capabilities = [
  { icon: "⌗", title: "Perspective correction", desc: "Flatten a photographed page into a consistent working frame.", status: "AVAILABLE IN WORKSPACE" },
  { icon: "⌁", title: "Sketch understanding", desc: "A confidence-aware review flow for symbols, labels and connections.", status: "IN DEVELOPMENT" },
  { icon: "∿", title: "Circuit simulation", desc: "A deterministic solver for supported circuits, with explicit validation.", status: "NEXT PHASE" },
];
const examples = [
  { title: "Resistor + DC source", kind: "BASIC DC", description: "Start with a closed 9 V loop and a 100 Ω resistor.", circuit: "battery" },
  { title: "Series resistor network", kind: "NETWORK", description: "Explore current and voltage drops across a series path.", circuit: "series" },
  { title: "Unknown sketch", kind: "YOUR INPUT", description: "Bring your own hand-drawn circuit into the workspace.", circuit: "upload" },
];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  return <main className="landing">
    <header className="landing-nav">
      <Link href="/" className="landing-brand"><span className="landing-mark">P</span><span><strong>PAPERNET</strong><small>PHYSICAL → DIGITAL</small></span></Link>
      <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">☰</button>
      <nav className={menuOpen ? "landing-links open" : "landing-links"}>
        <a href="#workflow" onClick={() => setMenuOpen(false)}>Workflow</a>
        <a href="#capabilities" onClick={() => setMenuOpen(false)}>Capabilities</a>
        <a href="#examples" onClick={() => setMenuOpen(false)}>Examples</a>
        <a href="#research" onClick={() => setMenuOpen(false)}>Web research</a>
      </nav>
      <Link className="landing-cta" href="/workspace">Start with a sketch <span>↗</span></Link>
    </header>

    <section className="landing-hero">
      <div className="hero-copy">
        <p className="landing-eyebrow"><span className="eyebrow-dot" /> ENGINEERING WORKSPACE / DEVLYMPICS SHUNYA 2026</p>
        <h1>From a paper sketch<br/>to <em>something you can verify.</em></h1>
        <p className="hero-lede">PaperNet bridges physical drawings and digital engineering. Capture a hand-drawn circuit, review its reconstruction, and move toward a simulation you can trust.</p>
        <div className="hero-actions"><Link className="landing-cta large" href="/workspace">Open the workspace <span>↗</span></Link><a className="text-link" href="#workflow">Explore the workflow <span>↓</span></a></div>
        <div className="hero-stats"><div><strong>800 × 600</strong><span>CANONICAL CAPTURE</span></div><div><strong>Local-first</strong><span>IMAGE PROCESSING</span></div><div><strong>Human verified</strong><span>UNCERTAINTY VISIBLE</span></div></div>
      </div>
      <div className="hero-art" aria-label="Abstract circuit schematic illustration">
        <div className="art-grid" />
        <div className="art-label label-a">FIG 01 / SKETCH INPUT</div><div className="art-label label-b">NODE / 04</div>
        <svg className="hero-circuit" viewBox="0 0 560 480" role="img" aria-label="Glowing electrical circuit schematic">
          <defs><linearGradient id="wire" x1="0" x2="1"><stop offset="0" stopColor="#e94e2e"/><stop offset="1" stopColor="#ffb184"/></linearGradient><filter id="glow"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
          <g fill="none" stroke="#2d3b4d" strokeWidth="1"><path d="M70 85H220V150H410V85H490V350H410V405H150V330H70Z"/><path d="M100 110H200V175H385V110H465V325H385V380H175V305H100Z"/></g>
          <g fill="none" stroke="url(#wire)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)"><path d="M70 85H220V150H300"/><path d="M360 150H410V85H490V350H410V405H150V330H70Z"/><path d="M300 150l10 -14 14 28 14 -28 14 28 8 -14"/><path d="M70 85V180"/><path d="M52 180H88M57 191H83M70 191V330"/></g>
          <g fill="#ffb184" stroke="#0b0d11" strokeWidth="4"><circle cx="70" cy="85" r="7"/><circle cx="220" cy="150" r="7"/><circle cx="410" cy="85" r="7"/><circle cx="410" cy="350" r="7"/><circle cx="150" cy="405" r="7"/><circle cx="70" cy="330" r="7"/></g>
          <g fill="#d8e1eb" fontFamily="monospace" fontSize="12"><text x="232" y="133">R1 · 100Ω</text><text x="430" y="75">N1</text><text x="163" y="430">GND</text><text x="28" y="215">9V</text><text x="348" y="455" fill="#8190a2">CIRCUIT GRAPH / PREVIEW</text></g>
          <g fill="none" stroke="#91bfff" strokeWidth="1" strokeDasharray="3 6"><path d="M220 150L220 65H320"/><path d="M410 350L520 350"/></g>
          <g fill="#91bfff"><circle cx="320" cy="65" r="3"/><circle cx="520" cy="350" r="3"/></g>
        </svg>
        <div className="art-readout"><span className="readout-pulse" /> CIRCUIT GRAPH <strong>PREVIEW MODE</strong></div>
      </div>
      <div className="hero-bottom-note"><span>01 — CAPTURE</span><span>02 — RECONSTRUCT</span><span>03 — VERIFY</span></div>
    </section>

    <section className="manifesto" id="workflow">
      <div className="section-kicker">THE WORKFLOW <span>01 / 03</span></div>
      <div className="section-heading"><h2>One bridge.<br/><em>Three precise steps.</em></h2><p>Recognition is not the finish line. PaperNet is designed to make the path from an imperfect drawing to a validated digital model inspectable at every stage.</p></div>
      <div className="workflow-cards">{steps.map((step) => <article className="workflow-card" key={step.n}><div className="workflow-card-top"><span>{step.n}</span><span className="mini-cross">↗</span></div><div className="workflow-graphic"><div className={"workflow-symbol symbol-" + step.n}>{step.n === "01" ? <><i/><i/><i/><b>+</b></> : step.n === "02" ? <><b>R</b><i/><b>●</b><i/><b>GND</b></> : <><b>V</b><i/><b>I</b><i/><b>✓</b></>}</div></div><p className="card-tag">{step.tag}</p><h3>{step.title}</h3><p>{step.desc}</p></article>)}</div>
    </section>

    <section className="capabilities" id="capabilities">
      <div className="section-kicker">BUILT FOR REAL ENGINEERING <span>CAPABILITIES</span></div>
      <div className="section-heading"><h2>Clarity over<br/><em>black-box magic.</em></h2><p>Every stage should be explainable. When the system is unsure about a symbol or a wire, it should ask—not quietly invent a circuit.</p></div>
      <div className="capability-list">{capabilities.map((item, i) => <article className="capability-row" key={item.title}><span className="capability-index">0{i + 1}</span><span className="capability-icon">{item.icon}</span><div className="capability-copy"><h3>{item.title}</h3><p>{item.desc}</p></div><span className={"capability-status " + (i === 0 ? "available" : "")}><i/>{item.status}</span><span className="capability-arrow">↗</span></article>)}</div>
    </section>

    <section className="examples" id="examples">
      <div className="section-kicker">START SMALL. SCALE WITH CONFIDENCE <span>EXAMPLES</span></div>
      <div className="section-heading"><h2>From first circuit<br/><em>to your own sketch.</em></h2><p>Use a known example to understand the workflow, or jump straight into your own paper circuit.</p></div>
      <div className="example-grid">{examples.map((example) => <article className="example-card" key={example.title}><div className="example-drawing"><span className="example-kind">{example.kind}</span><svg viewBox="0 0 300 130" aria-hidden="true"><g stroke="#6e8298" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M45 35H105M155 35H250V100H45V35"/><path d="M105 35l7 -10 10 20 10 -20 10 20 7 -10"/><path d="M45 35V55M33 55H57M37 63H53M45 63V100"/></g><g fill="#ff7656"><circle cx="45" cy="35" r="4"/><circle cx="250" cy="35" r="4"/><circle cx="250" cy="100" r="4"/></g><g fill="#c6d1df" fontSize="10" fontFamily="monospace"><text x="108" y="17">R1</text><text x="20" y="48">V1</text></g></svg></div><div className="example-card-copy"><h3>{example.title}</h3><p>{example.description}</p><Link href="/workspace">{example.circuit === "upload" ? "Upload a sketch" : "Explore workspace"} <span>↗</span></Link></div></article>)}</div>
    </section>

    <section className="research-banner" id="research"><div className="research-copy"><p className="landing-eyebrow">RESEARCH LAYER / OPTIONAL</p><h2>Find context for<br/><em>what you recognize.</em></h2><p>Search for component references, datasheets and relevant pages after a component has been identified. TinyFish-powered search and fetch endpoints are optional and require your own API key.</p><Link href="/workspace#research" className="landing-cta">Open research workspace <span>↗</span></Link></div><div className="research-visual"><div className="research-orbit orbit-one"/><div className="research-orbit orbit-two"/><div className="research-chip"><span>R</span><small>100 Ω</small></div><div className="research-result result-one"><b>01</b><span>Resistor reference</span><small>WEB RESULT</small></div><div className="research-result result-two"><b>02</b><span>Component datasheet</span><small>FETCHED CONTENT</small></div></div></section>

    <footer className="landing-footer"><Link href="/" className="landing-brand"><span className="landing-mark">P</span><span><strong>PAPERNET</strong><small>PHYSICAL → DIGITAL</small></span></Link><p>Turn physical drawings into digital engineering models.</p><div className="footer-links"><a href="#workflow">Workflow</a><a href="#capabilities">Capabilities</a><Link href="/workspace">Workspace</Link><a href="https://github.com/Abhinavjs903/PaparNetAi" target="_blank" rel="noreferrer">GitHub ↗</a></div><span className="footer-legal">DEVLYMPICS SHUNYA 2026 · BUILT FOR VERIFIABLE RECONSTRUCTION</span></footer>
  </main>;
}
