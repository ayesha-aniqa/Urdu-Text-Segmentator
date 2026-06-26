// Footer.jsx — Detailed footer on Home page only, copyright bar on all pages

import { Link, useNavigate, useLocation } from 'react-router-dom'

function Footer() {
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/'

  // Scroll to a section on the landing page
  const scrollToSection = (sectionId) => {
    navigate('/')
    setTimeout(() => {
      const el = document.getElementById(sectionId)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  }

  const linkStyle = {
    color: '#666',
    textDecoration: 'none',
    fontSize: '0.9rem',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    padding: 0,
    fontFamily: 'inherit',
    transition: 'color 0.2s ease'
  }

  return (
    <footer style={{ width: '100%' }}>

      {/* ===== DETAILED FOOTER — only on Home page ===== */}
      {isHome && (
        <div style={{
          background: '#F0EDCC',
          padding: '3rem 2rem 2rem',
          width: '100%'
        }}>
          <div style={{
            maxWidth: '72rem',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '2rem'
          }}>

            {/* Brand Column */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <img src="/uts-logo.png" alt="Logo" style={{
                  width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover', background: 'rgba(255,255,255,0.9)'
                }} />
                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#02343F' }}>
                  Urdu Segmentor
                </span>
              </div>
              <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Professional text processing for the modern age.
              </p>
            </div>

            {/* Product Column — scrolls to landing page sections */}
            <div>
              <h4 style={{ fontWeight: 700, color: '#02343F', marginBottom: '0.75rem', fontSize: '1rem' }}>
                Product
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li><button onClick={() => scrollToSection('features')} style={linkStyle}>Features</button></li>
                <li><button onClick={() => scrollToSection('how-it-works')} style={linkStyle}>How It Works</button></li>
                <li><button onClick={() => scrollToSection('use-cases')} style={linkStyle}>Use Cases</button></li>
              </ul>
            </div>

            {/* Company Column — navigates to pages */}
            <div>
              <h4 style={{ fontWeight: 700, color: '#02343F', marginBottom: '0.75rem', fontSize: '1rem' }}>
                Company
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li><Link to="/about" style={linkStyle}>About Us</Link></li>
                <li><Link to="/contact" style={linkStyle}>Contact Us</Link></li>
                <li><Link to="/privacy-policy" style={linkStyle}>Privacy Policy</Link></li>
              </ul>
            </div>

            {/* Connect Column — FAQ, Documentation, Support */}
            <div>
              <h4 style={{ fontWeight: 700, color: '#02343F', marginBottom: '0.75rem', fontSize: '1rem' }}>
                Resources
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li><Link to="/faq" style={linkStyle}>FAQ</Link></li>
                <li>
                  <a href="https://drive.google.com/file/d/1PfUdsikDlJ5pUfjJwj0877V6LxwKdLtk/view?usp=sharingf" target="_blank" rel="noopener noreferrer" style={linkStyle}>
                    Documentation ↗
                  </a>
                </li>
                <li>
                  <a href="mailto:support@urdusegmentor.com" style={linkStyle}>
                    Support
                  </a>
                </li>
              </ul>
            </div>

          </div>
        </div>
      )}

      {/* ===== COPYRIGHT BAR — always visible ===== */}
      <div style={{
        width: '100%',
        background: 'linear-gradient(135deg, #02343F, #064A56)',
        padding: '1rem',
        textAlign: 'center'
      }}>
        <p style={{ color: '#fff', fontSize: '0.85rem', margin: 0 }}>
          © 2026 Urdu Text Segmentor. All rights reserved.
        </p>
      </div>

    </footer>
  )
}

export default Footer