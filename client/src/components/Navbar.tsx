import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Home', href: '#hero' },
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'Formats', href: '#formats' },
  { label: 'About', href: '#stats' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleLink = (href: string) => {
    setOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} role="navigation">
        <a href="#hero" className="navbar-logo" onClick={() => handleLink('#hero')}>
          Convert<span>o</span>®
        </a>
        <button
          id="menu-toggle"
          className="menu-btn"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label="Toggle menu"
        >
          {open ? 'Close' : 'Menu'} {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </nav>

      <div
        className={`menu-overlay ${open ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="menu-overlay-header">
          <span className="navbar-logo">Convert<span style={{ color: 'var(--accent-blue)' }}>o</span>®</span>
          <button className="menu-btn" onClick={() => setOpen(false)} aria-label="Close menu">
            Close <ChevronUp size={14} />
          </button>
        </div>

        <nav className="menu-nav">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              id={`menu-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={(e) => { e.preventDefault(); handleLink(link.href); }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <p className="menu-copyright">© {new Date().getFullYear()} Converto® — Free Document Converter</p>
      </div>
    </>
  );
}
