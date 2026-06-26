// LandingPage.jsx
// Matches the original HTML design with all sections

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function LandingPage() {
  const navigate = useNavigate()

  // Typing effect
  const [displayText, setDisplayText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const fullText = "Urdu Text Segmentor"

  useEffect(() => {
    let timeout
    if (!isDeleting && displayText.length < fullText.length) {
      timeout = setTimeout(() => setDisplayText(fullText.slice(0, displayText.length + 1)), 90)
    } else if (!isDeleting && displayText.length === fullText.length) {
      timeout = setTimeout(() => setIsDeleting(true), 2000)
    } else if (isDeleting && displayText.length > 0) {
      timeout = setTimeout(() => setDisplayText(fullText.slice(0, displayText.length - 1)), 40)
    } else if (isDeleting && displayText.length === 0) {
      timeout = setTimeout(() => setIsDeleting(false), 500)
    }
    return () => clearTimeout(timeout)
  }, [displayText, isDeleting])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

      {/* ===== HERO SECTION ===== */}
      <section style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', width: '100%', minHeight: 'calc(100vh - 10rem)' }}>
        <div style={{
          background: '#fff',
          border: '1px solid #D8D5B0',
          boxShadow: '0 10px 40px rgba(2, 52, 63, 0.08)',
          padding: '3rem 2rem',
          borderRadius: '1.5rem',
          width: '100%',
          maxWidth: '72rem',
          textAlign: 'center'
        }}>

          {/* Typing effect heading */}
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
            fontWeight: 800,
            marginBottom: '1rem',
            backgroundImage: 'linear-gradient(45deg, #02343F, #0A6C7A)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1.2
          }}>
            {displayText}<span style={{ animation: 'pulse 1s infinite' }}>|</span>
          </h1>

          <h2 style={{
            fontSize: '1.5rem', fontWeight: 600, color: '#02343F', marginBottom: '1.5rem'
          }}>
            Professional Text Processing Made Simple
          </h2>

          <p style={{
            color: '#555', maxWidth: '48rem', margin: '0 auto 2.5rem',
            lineHeight: 1.8, fontSize: '1.05rem'
          }}>
            Transform your Urdu text with our advanced AI-powered segmentation engine.
            Get precise word boundaries, sentence structure analysis, and professional
            formatting in seconds. Perfect for linguists, researchers, and content creators.
          </p>

          <button
            onClick={() => navigate('/segment')}
            style={{
              padding: '0.9rem 2.5rem',
              background: 'linear-gradient(135deg, #0A6C7A, #065A68)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '1.1rem',
              border: 'none',
              borderRadius: '50px',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(10, 108, 122, 0.4)',
              transition: 'all 0.3s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #02343F, #054752)'
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(2, 52, 63, 0.4)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #0A6C7A, #065A68)'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(10, 108, 122, 0.4)'
            }}
          >
            Click Here to Start <span>→</span>
          </button>

          {/* Feature badges */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '2rem',
            marginTop: '2.5rem', flexWrap: 'wrap'
          }}>
            {[
              { icon: '⚡', label: 'Real-Time Processing', color: '#065A68' },
              { icon: '✅', label: 'High Accuracy', color: '#4CAF50' },
              { icon: '⬇️', label: 'Instant Download', color: '#065A68' }
            ].map((badge, i) => (
              <span key={i} style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                fontSize: '0.95rem', fontWeight: 500, color: '#02343F'
              }}>
                <span style={{ color: badge.color }}>{badge.icon}</span> {badge.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== POWERFUL FEATURES SECTION ===== */}
      <section id="features" style={{ padding: '4rem 2rem', width: '100%', maxWidth: '72rem' }}>
        <h2 style={{
          fontSize: 'clamp(2rem, 4vw, 3.5rem)',
          fontWeight: 800,
          textAlign: 'center',
          marginBottom: '0.5rem',
          backgroundImage: 'linear-gradient(45deg, #02343F, #0A6C7A)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1.2
        }}>
          Powerful Features
        </h2>
        <p style={{
          textAlign: 'center', color: '#666', fontSize: '1.1rem', marginBottom: '3rem'
        }}>
          Everything you need for professional Urdu text processing
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem'
        }}>
          {[
            {
              icon: (
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#065A68" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              ),
              title: 'Lightning Fast',
              desc: 'Process thousands of words in seconds with our optimized segmentation engine powered by advanced algorithms.'
            },
            {
              icon: (
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              ),
              title: 'High Accuracy',
              desc: '99% accuracy in word boundary detection and sentence segmentation using state-of-the-art NLP models.'
            },
            {
              icon: (
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#065A68" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              ),
              title: 'Easy Export',
              desc: 'Download your segmented text instantly in multiple formats ready for your research or publication.'
            }
          ].map((feature, index) => (
            <div key={index} style={{
              background: '#fff',
              border: '1px solid #D8D5B0',
              padding: '2rem',
              borderRadius: '1rem',
              boxShadow: '0 4px 15px rgba(2, 52, 63, 0.06)',
              transition: 'all 0.3s ease',
              cursor: 'default'
            }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-5px)'
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(2, 52, 63, 0.12)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(2, 52, 63, 0.06)'
              }}
            >
              <div style={{ marginBottom: '1rem' }}>{feature.icon}</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#02343F', marginBottom: '0.75rem' }}>
                {feature.title}
              </h3>
              <p style={{ color: '#666', lineHeight: 1.7, fontSize: '0.95rem' }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== HOW IT WORKS SECTION ===== */}
      <section id="how-it-works" style={{
        padding: '4rem 2rem', width: '100%', maxWidth: '72rem'
      }}>
        <h2 style={{
          fontSize: 'clamp(2rem, 4vw, 3.5rem)',
          fontWeight: 800,
          textAlign: 'center',
          marginBottom: '0.5rem',
          backgroundImage: 'linear-gradient(45deg, #02343F, #0A6C7A)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1.2
        }}>
          How It Works
        </h2>
        <p style={{
          textAlign: 'center', color: '#666', fontSize: '1.1rem', marginBottom: '3rem'
        }}>
          Simple, fast, and professional in three steps
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2.5rem',
          textAlign: 'center'
        }}>
          {[
            {
              step: '1',
              title: 'Input Text',
              desc: 'Paste or type your Urdu text into our intuitive editor. No formatting required.'
            },
            {
              step: '2',
              title: 'Process',
              desc: 'Our AI engine analyzes and segments your text with precision in real-time.'
            },
            {
              step: '3',
              title: 'Download',
              desc: 'Get your professionally segmented text ready for immediate use.'
            }
          ].map((item, index) => (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #02343F, #054752)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 800,
                marginBottom: '1.25rem',
                boxShadow: '0 6px 20px rgba(2, 52, 63, 0.3)'
              }}>
                {item.step}
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#02343F', marginBottom: '0.5rem' }}>
                {item.title}
              </h3>
              <p style={{ color: '#666', lineHeight: 1.7, fontSize: '0.95rem', maxWidth: '300px' }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== WHO USES THIS SECTION ===== */}
      <section id="use-cases" style={{
        padding: '4rem 2rem 5rem', width: '100%', maxWidth: '72rem'
      }}>
        <h2 style={{
          fontSize: 'clamp(2rem, 4vw, 3.5rem)',
          fontWeight: 800,
          textAlign: 'center',
          marginBottom: '0.5rem',
          backgroundImage: 'linear-gradient(45deg, #02343F, #0A6C7A)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1.2
        }}>
          Who Uses This?
        </h2>
        <p style={{
          textAlign: 'center', color: '#666', fontSize: '1.1rem', marginBottom: '3rem'
        }}>
          Trusted by professionals across industries
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem'
        }}>
          {[
            {
              icon: (
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#065A68" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  <line x1="9" y1="7" x2="15" y2="7" />
                  <line x1="9" y1="11" x2="15" y2="11" />
                </svg>
              ),
              title: 'Researchers',
              desc: 'Academic research and linguistic analysis'
            },
            {
              icon: (
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#065A68" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 19l7-7 3 3-7 7-3-3z" />
                  <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                  <path d="M2 2l7.586 7.586" />
                  <circle cx="11" cy="11" r="2" />
                </svg>
              ),
              title: 'Content Writers',
              desc: 'Professional content creation and editing'
            },
            {
              icon: (
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#065A68" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c0 0 3 3 6 3s6-3 6-3v-5" />
                </svg>
              ),
              title: 'Educators',
              desc: 'Teaching materials and curriculum development'
            },
            {
              icon: (
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#065A68" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              ),
              title: 'Publishers',
              desc: 'Book and publication preparation'
            }
          ].map((item, index) => (
            <div key={index} style={{
              background: '#fff',
              border: '1px solid #D8D5B0',
              padding: '2rem 1.5rem',
              borderRadius: '1rem',
              textAlign: 'center',
              boxShadow: '0 4px 15px rgba(2, 52, 63, 0.06)',
              transition: 'all 0.3s ease',
              cursor: 'default'
            }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(2, 52, 63, 0.12)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(2, 52, 63, 0.06)'
              }}
            >
              <div style={{ marginBottom: '1rem' }}>{item.icon}</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#02343F', marginBottom: '0.4rem' }}>
                {item.title}
              </h3>
              <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: 1.5 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}

export default LandingPage