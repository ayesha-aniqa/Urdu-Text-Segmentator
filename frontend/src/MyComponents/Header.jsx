// Header.jsx
// Context-aware header: shows different nav items on Home vs other pages

import { Link, useLocation } from 'react-router-dom'

function Header() {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      width: '100%',
      background: 'linear-gradient(135deg, #02343F, #064A56)',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      zIndex: 50,
      boxShadow: '0 4px 20px rgba(2, 52, 63, 0.4)'
    }}>

      {/* Logo + Title */}
      <Link to="/" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        textDecoration: 'none',
        transition: 'transform 0.3s ease'
      }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <img src="/uts-logo.png" alt="Logo" style={{
          width: '44px',
          height: '44px',
          borderRadius: '10px',
          objectFit: 'cover',
          border: '2px solid rgba(240, 237, 204, 0.3)',
          transition: 'box-shadow 0.3s ease',
          background: 'rgba(255,255,255,0.9)'
        }} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{
            color: '#fff',
            fontWeight: 800,
            fontSize: '1.15rem',
            lineHeight: 1.2,
            letterSpacing: '0.02em'
          }}>
            Urdu Text Segmentor
          </span>
          <span style={{
            color: '#F0EDCC',
            fontSize: '0.7rem',
            opacity: 0.8,
            letterSpacing: '0.05em'
          }}>
            Professional Text Processing
          </span>
        </div>
      </Link>

      {/* Navigation — changes based on current page */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>

        {/* History icon — always visible, small and unobtrusive */}
        <Link to="/history" title="View History" aria-label="View History" style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          background: location.pathname === '/history'
            ? '#0A6C7A'
            : 'rgba(10, 108, 122, 0.3)',
          textDecoration: 'none',
          fontSize: '1.05rem',
          transition: 'all 0.3s ease',
          border: '1px solid rgba(240, 237, 204, 0.2)',
        }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#0A6C7A'
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(10, 108, 122, 0.4)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = location.pathname === '/history'
              ? '#0A6C7A'
              : 'rgba(10, 108, 122, 0.3)'
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <span role="img" aria-hidden="true">🕒</span>
        </Link>

        {/* Home link — always visible */}
        <Link to="/" style={{
          padding: '0.4rem 1rem',
          color: '#fff',
          textDecoration: 'none',
          fontSize: '0.95rem',
          fontWeight: isHome ? 700 : 400,
          position: 'relative',
          transition: 'all 0.3s ease'
        }}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#F0EDCC'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = '#fff'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          Home
        </Link>

        {isHome ? (
          /* ── HOME PAGE: Show "Start Segmenting" button ── */
          <Link to="/segment" style={{
            padding: '0.5rem 1.25rem',
            color: '#fff',
            background: 'rgba(10, 108, 122, 0.5)',
            borderRadius: '50px',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: 600,
            transition: 'all 0.3s ease',
            border: '1px solid rgba(240, 237, 204, 0.2)',
            boxShadow: '0 2px 10px rgba(10, 108, 122, 0.3)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#0A6C7A'
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(10, 108, 122, 0.5)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(10, 108, 122, 0.5)'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 2px 10px rgba(10, 108, 122, 0.3)'
            }}
          >
            Start Segmenting
          </Link>
        ) : (
          /* ── OTHER PAGES: Show "About Us" + "Contact Us" pills ── */
          <>
            <Link to="/about" style={{
              padding: '0.5rem 1.25rem',
              color: '#fff',
              background: location.pathname === '/about'
                ? '#0A6C7A'
                : 'rgba(10, 108, 122, 0.3)',
              borderRadius: '50px',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 500,
              transition: 'all 0.3s ease',
              border: '1px solid rgba(240, 237, 204, 0.15)'
            }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#0A6C7A'
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(10, 108, 122, 0.4)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = location.pathname === '/about'
                  ? '#0A6C7A'
                  : 'rgba(10, 108, 122, 0.3)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              About Us
            </Link>

            <Link to="/contact" style={{
              padding: '0.5rem 1.25rem',
              color: '#fff',
              background: location.pathname === '/contact'
                ? '#0A6C7A'
                : 'rgba(10, 108, 122, 0.3)',
              borderRadius: '50px',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 500,
              transition: 'all 0.3s ease',
              border: '1px solid rgba(240, 237, 204, 0.15)'
            }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#0A6C7A'
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(10, 108, 122, 0.4)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = location.pathname === '/contact'
                  ? '#0A6C7A'
                  : 'rgba(10, 108, 122, 0.3)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              Contact Us
            </Link>
          </>
        )}
      </nav>

    </header>
  )
}

export default Header