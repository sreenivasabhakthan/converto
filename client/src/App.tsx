import { useEffect } from 'react';
import Navbar from './components/Navbar';
import ConverterBox from './components/ConverterBox';
import Marquee from './components/Marquee';
import {
  Upload, Check, Download, Image as ImageIcon,
  FileText, Table, Presentation, Code2, ArrowRight
} from 'lucide-react';

// ─── Scroll Reveal Hook ──────────────────────────────────────
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.12 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

// ─── Data ────────────────────────────────────────────────────
const STEPS = [
  {
    num: '01',
    icon: <Upload size={20} />,
    iconBg: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    title: 'Upload Your File',
    desc: 'Drag & drop or click to browse. We support 50+ file formats up to 50 MB.',
  },
  {
    num: '02',
    icon: <Check size={20} />,
    iconBg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    title: 'Select Output Format',
    desc: 'We auto-detect your file type and show only the compatible output formats.',
  },
  {
    num: '03',
    icon: <Download size={20} />,
    iconBg: 'linear-gradient(135deg, #f97316, #ea580c)',
    title: 'Download Instantly',
    desc: 'Your converted file is ready in seconds. No sign-up. No watermarks. 100% free.',
  },
];

const FORMAT_CATEGORIES = [
  {
    title: 'Documents',
    icon: <FileText size={18} />,
    iconBg: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    formats: 'PDF, DOCX, TXT, RTF, HTML',
  },
  {
    title: 'Images',
    icon: <ImageIcon size={18} />,
    iconBg: 'linear-gradient(135deg, #ec4899, #db2777)',
    formats: 'JPG, PNG, WEBP, GIF, BMP, TIFF, SVG',
  },
  {
    title: 'Spreadsheets',
    icon: <Table size={18} />,
    iconBg: 'linear-gradient(135deg, #10b981, #059669)',
    formats: 'XLSX, XLS, CSV, ODS',
  },
  {
    title: 'Presentations',
    icon: <Presentation size={18} />,
    iconBg: 'linear-gradient(135deg, #f97316, #ea580c)',
    formats: 'PPTX, PPT, ODP, PDF',
  },
  {
    title: 'Data / Code',
    icon: <Code2 size={18} />,
    iconBg: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    formats: 'JSON, XML, YAML, CSV',
  },
];

const STATS = [
  { number: '50+', label: 'File Formats Supported' },
  { number: '100%', label: 'Free — Always' },
  { number: '0', label: 'Sign-ups Required' },
];

// ─── App ─────────────────────────────────────────────────────
export default function App() {
  useReveal();

  return (
    <>
      <Navbar />

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="hero" id="hero">
        <div className="hero-content">
          <div className="hero-tags">
            <span className="hero-tag">PDF</span>
            <span className="hero-tag light">DOCX</span>
            <span className="hero-tag">PNG</span>
            <span className="hero-tag light">JSON</span>
            <span className="hero-tag">CSV</span>
            <span className="hero-tag light">50+ formats</span>
          </div>

          <h1 className="hero-headline">
            Convert any file.<br />
            <span className="italic-word">Instantly.</span>
          </h1>

          <p className="hero-sub">
            A free, no-login tool to convert documents, images, and data files
            from any format to any other format — in seconds.
          </p>

          <ConverterBox />
        </div>

        <div className="hero-blob" aria-hidden="true" />
      </section>

      {/* ── Marquee ─────────────────────────────────────────── */}
      <Marquee />

      {/* ── How it Works ────────────────────────────────────── */}
      <section className="how-it-works reveal" id="how-it-works">
        <div className="section-tag">How it works</div>
        <h2 className="section-headline" style={{ marginLeft: 'auto', marginRight: 'auto', textAlign: 'center' }}>
          The <span className="italic-word" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400 }}>simplest</span> way<br />to convert files.
        </h2>
        <p className="section-sub" style={{ margin: '0 auto 0', textAlign: 'center' }}>
          Three steps. No complexity. No account needed.
        </p>

        <div className="steps-grid">
          {STEPS.map((step) => (
            <div key={step.num} className="step-card reveal" id={`step-${step.num}`}>
              <div className="step-number">Step {step.num}</div>
              <div className="step-icon" style={{ background: step.iconBg }}>
                {step.icon}
              </div>
              <div className="step-title">{step.title}</div>
              <p className="step-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Formats (Dark) ──────────────────────────────────── */}
      <section className="dark-section" id="formats">
        <div className="dark-bg-blob dark-bg-blob-1" aria-hidden="true" />
        <div className="dark-bg-blob dark-bg-blob-2" aria-hidden="true" />
        <div className="dark-section-inner reveal">
          <div className="section-tag">Supported Formats</div>
          <h2 className="section-headline">
            Everything you<br />need,{' '}
            <span className="italic-word" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400 }}>nothing</span> you don't.
          </h2>
          <p className="section-sub">
            Convert across documents, images, spreadsheets, presentations, and data formats — all in one place.
          </p>

          <div className="formats-grid">
            {FORMAT_CATEGORIES.map((cat) => (
              <div key={cat.title} className="format-card reveal">
                <div className="format-card-icon" style={{ background: cat.iconBg }}>
                  {cat.icon}
                </div>
                <div className="format-card-title">{cat.title}</div>
                <div className="format-card-formats">{cat.formats}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────── */}
      <section className="stats-section reveal" id="stats">
        <div className="section-tag">Why Converto?</div>
        <h2 className="section-headline" style={{ margin: '0 auto 12px', textAlign: 'center' }}>
          Built for everyone.<br />
          <span className="italic-word" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400 }}>Truly free.</span>
        </h2>
        <p className="section-sub" style={{ margin: '0 auto', textAlign: 'center' }}>
          No subscriptions, no watermarks, no file limits hidden behind a paywall.
        </p>

        <div className="stats-grid">
          {STATS.map((stat) => (
            <div key={stat.label} className="stat-item reveal">
              <div className="stat-number">{stat.number}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="cta-section reveal">
        <h2 className="cta-headline">
          Ready to convert?<br />
          <span className="italic-word" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400 }}>Start now.</span>
        </h2>
        <p className="cta-sub">
          Drop your file above and get your converted document in seconds. No sign-up required.
        </p>
        <a
          href="#hero"
          className="cta-btn"
          id="cta-start-btn"
          onClick={(e) => {
            e.preventDefault();
            document.querySelector('#hero')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          Start Converting <ArrowRight size={18} />
        </a>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="footer" role="contentinfo">
        <span className="footer-logo">Converto®</span>
        <span className="footer-copy">© {new Date().getFullYear()} Converto — Free forever.</span>
        <div className="footer-links">
          <a href="#how-it-works" id="footer-how">How it Works</a>
          <a href="#formats" id="footer-formats">Formats</a>
          <a href="#stats" id="footer-about">About</a>
        </div>
      </footer>
    </>
  );
}
