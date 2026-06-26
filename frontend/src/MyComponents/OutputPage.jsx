// OutputPage.jsx
// Displays segmented Urdu text with two views:
//   1. Segmented Text — assembled words joined with | separators
//   2. BIESX Analysis — color-coded character-by-tag visualization
// Props: segmentedText → { tokens: string[], tags: string[], segments: string[] } | null

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { zipTokensWithTags, groupTokensByWord, getTagLegend, getTagStyle } from '../utils/biesxColors'

function OutputPage({ segmentedText }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('segments')  // 'segments' | 'biesx'
  const [copyFeedback, setCopyFeedback] = useState('')

  // Derived data
  const hasData = segmentedText && segmentedText.segments && segmentedText.segments.length > 0
  const segments = hasData ? segmentedText.segments : []
  const tokens = hasData ? segmentedText.tokens : []
  const tags = hasData ? segmentedText.tags : []
  const zipped = hasData ? zipTokensWithTags(tokens, tags) : []
  const wordGroups = hasData ? groupTokensByWord(tokens, tags) : []
  const legend = getTagLegend()

  // ── Copy handler ──
  const handleCopy = () => {
    const text = activeTab === 'segments'
      ? segments.join(' | ')
      : tokens.map((t, i) => `${t}[${tags[i]}]`).join(' ')

    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedback('Copied!')
      setTimeout(() => setCopyFeedback(''), 2000)
    })
  }

  // ── Download handler ──
  const handleDownload = () => {
    const lines = [
      '═══ Urdu Text Segmentor — Output ═══',
      '',
      '── Segmented Words ──',
      segments.join(' | '),
      '',
      '── BIESX Tags ──',
      tokens.map((t, i) => `${t}[${tags[i]}]`).join(' '),
      '',
      `── Stats ──`,
      `Total characters: ${tokens.length}`,
      `Total segments: ${segments.length}`,
      `Tags: ${tags.filter(t => t !== 'X').length} (excl. spaces)`,
    ].join('\n')

    const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'segmented_output.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Styles ──
  const buttonBase = {
    padding: '0.75rem 1.5rem',
    fontWeight: 600,
    fontSize: '0.95rem',
    border: 'none',
    borderRadius: '50px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(10, 108, 122, 0.3)',
  }

  const tabStyle = (isActive) => ({
    padding: '0.6rem 1.5rem',
    fontSize: '0.9rem',
    fontWeight: isActive ? 700 : 500,
    color: isActive ? '#fff' : '#02343F',
    background: isActive
      ? 'linear-gradient(135deg, #02343F, #0A6C7A)'
      : 'rgba(10, 108, 122, 0.08)',
    border: isActive ? 'none' : '1px solid rgba(10, 108, 122, 0.15)',
    borderRadius: '50px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: isActive ? '0 4px 15px rgba(10, 108, 122, 0.35)' : 'none',
  })

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(30px) } to { opacity:1; transform:translateY(0) } }
        @keyframes shimmer { 0% { background-position:-200% center } 100% { background-position:200% center } }
        @keyframes popIn { from { opacity:0; transform:scale(0.85) } to { opacity:1; transform:scale(1) } }
        .out-btn:hover { transform:translateY(-3px) !important; box-shadow:0 8px 25px rgba(10,108,122,0.45) !important; }
        .out-btn:active { transform:translateY(0) !important; }
        .biesx-pill { transition: all 0.2s ease; }
        .biesx-pill:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.12) !important; }
        .word-group { transition: all 0.25s ease; }
        .word-group:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(10,108,122,0.15) !important; }
      `}</style>

      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: 'calc(100vh - 10rem)', padding: '1.5rem',
        position: 'relative', overflow: 'hidden',
      }}>

        {/* Background decorations */}
        <div style={{ position:'absolute', top:'-50px', right:'-40px', width:'200px', height:'200px',
          borderRadius:'50%', background:'rgba(10,108,122,0.04)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'-40px', left:'-30px', width:'170px', height:'170px',
          borderRadius:'50%', background:'rgba(2,52,63,0.03)', pointerEvents:'none' }} />

        {/* Logo */}
        <img src="/uts-logo.png" alt="Logo" style={{
          width: '50px', height: '50px', borderRadius: '12px', objectFit: 'cover',
          marginBottom: '1.25rem',
          boxShadow: '0 6px 25px rgba(10, 108, 122, 0.35)',
          border: '3px solid rgba(240,237,204,0.4)',
          background: 'rgba(255,255,255,0.9)',
          animation: 'fadeUp 0.4s ease both',
        }} />

        {/* Main Card */}
        <div style={{
          background: '#fff',
          border: '1px solid #D8D5B0',
          boxShadow: '0 15px 50px rgba(2, 52, 63, 0.1)',
          padding: '2.5rem',
          borderRadius: '1.5rem',
          width: '100%',
          maxWidth: '52rem',
          position: 'relative',
          overflow: 'hidden',
          animation: 'fadeUp 0.5s ease 0.1s both',
        }}>

          {/* Decorative top gradient bar */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
            background: 'linear-gradient(90deg, #02343F, #0A6C7A, #065A68, #0A6C7A, #02343F)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 3s linear infinite',
          }} />

          {/* Title */}
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            fontWeight: 800,
            textAlign: 'center',
            marginBottom: '0.4rem',
            background: 'linear-gradient(135deg, #02343F, #0A6C7A)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Segmentation Results
          </h2>
          <p style={{ textAlign: 'center', color: '#888', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
            {hasData
              ? `${segments.length} segments detected from ${tokens.filter(t => t.trim()).length} characters`
              : 'No results to display yet'}
          </p>

          {hasData ? (
            <>
              {/* Tab Switcher */}
              <div style={{
                display: 'flex', justifyContent: 'center', gap: '0.75rem',
                marginBottom: '1.5rem',
                animation: 'fadeUp 0.4s ease 0.2s both',
              }}>
                <button style={tabStyle(activeTab === 'segments')}
                  onClick={() => setActiveTab('segments')}>
                  📝 Segmented Text
                </button>
                <button style={tabStyle(activeTab === 'biesx')}
                  onClick={() => setActiveTab('biesx')}>
                  🏷️ BIESX Analysis
                </button>
              </div>

              {/* ── Tab Content ── */}
              <div style={{
                background: '#FAFAF5',
                border: '1px solid #E8E5D0',
                borderRadius: '1rem',
                padding: '1.5rem',
                minHeight: '200px',
                animation: 'fadeUp 0.4s ease 0.3s both',
              }}>

                {activeTab === 'segments' ? (
                  /* ── Segmented Text View ── */
                  <div style={{
                    direction: 'rtl',
                    textAlign: 'right',
                    fontSize: '1.15rem',
                    lineHeight: 2.2,
                    color: '#02343F',
                    fontFamily: 'inherit',
                  }}>
                    {segments.map((seg, i) => (
                      <span key={i}>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.2rem 0.6rem',
                          margin: '0.15rem',
                          background: 'rgba(10, 108, 122, 0.08)',
                          borderRadius: '6px',
                          border: '1px solid rgba(10, 108, 122, 0.12)',
                          fontWeight: 600,
                          transition: 'all 0.2s ease',
                        }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(10, 108, 122, 0.18)'
                            e.currentTarget.style.transform = 'translateY(-1px)'
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(10, 108, 122, 0.08)'
                            e.currentTarget.style.transform = 'translateY(0)'
                          }}
                        >
                          {seg}
                        </span>
                        {i < segments.length - 1 && (
                          <span style={{
                            color: '#0A6C7A', fontWeight: 300, opacity: 0.5,
                            margin: '0 0.15rem', fontSize: '1.1rem',
                          }}>
                            |
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                ) : (
                  /* ── BIESX Analysis View ── */
                  <div>
                    {/* Legend */}
                    <div style={{
                      display: 'flex', flexWrap: 'wrap', gap: '0.5rem',
                      justifyContent: 'center', marginBottom: '1.25rem',
                      padding: '0.75rem', background: 'rgba(255,255,255,0.7)',
                      borderRadius: '0.75rem', border: '1px solid #E8E5D0',
                    }}>
                      {legend.map(({ tag, label, color, bg }) => (
                        <span key={tag} style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                          padding: '0.25rem 0.65rem', borderRadius: '50px',
                          fontSize: '0.78rem', fontWeight: 600,
                          color, background: bg,
                        }}>
                          <span style={{
                            width: '8px', height: '8px', borderRadius: '50%',
                            background: color, display: 'inline-block',
                          }} />
                          {tag} = {label}
                        </span>
                      ))}
                    </div>

                    {/* Word Groups — each word shown as a card with its characters */}
                    <div style={{
                      display: 'flex', flexWrap: 'wrap', gap: '0.75rem',
                      justifyContent: 'center', direction: 'rtl',
                    }}>
                      {wordGroups.map((group, gi) => (
                        <div key={gi} className="word-group" style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center',
                          padding: '0.75rem',
                          background: '#fff',
                          borderRadius: '0.85rem',
                          border: '1px solid #E0DFC8',
                          boxShadow: '0 2px 8px rgba(2,52,63,0.06)',
                          animation: `popIn 0.3s ease ${gi * 0.04}s both`,
                          minWidth: '50px',
                        }}>
                          {/* Assembled word */}
                          <span style={{
                            fontSize: '1.2rem', fontWeight: 700, color: '#02343F',
                            marginBottom: '0.5rem', direction: 'rtl',
                          }}>
                            {group.word}
                          </span>
                          {/* Character pills */}
                          <div style={{ display: 'flex', gap: '3px', direction: 'rtl' }}>
                            {group.chars.map((ch, ci) => (
                              <div key={ci} className="biesx-pill" style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                padding: '0.3rem 0.45rem',
                                background: ch.style.bg,
                                border: `1.5px solid ${ch.style.border}`,
                                borderRadius: '6px',
                                minWidth: '28px',
                              }}>
                                <span style={{
                                  fontSize: '1rem', fontWeight: 600,
                                  color: '#02343F', lineHeight: 1.2,
                                }}>
                                  {ch.token}
                                </span>
                                <span style={{
                                  fontSize: '0.65rem', fontWeight: 700,
                                  color: ch.style.color,
                                  letterSpacing: '0.05em',
                                  marginTop: '2px',
                                }}>
                                  {ch.tag}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Stats bar */}
              <div style={{
                display: 'flex', justifyContent: 'center', gap: '1.5rem',
                marginTop: '1rem', flexWrap: 'wrap',
                animation: 'fadeUp 0.4s ease 0.4s both',
              }}>
                {[
                  { label: 'Characters', value: tokens.filter(t => t.trim()).length },
                  { label: 'Segments', value: segments.length },
                  { label: 'B tags', value: tags.filter(t => t === 'B').length },
                  { label: 'S tags', value: tags.filter(t => t === 'S').length },
                ].map(({ label, value }) => (
                  <div key={label} style={{
                    textAlign: 'center', padding: '0.5rem 0.75rem',
                    background: 'rgba(10,108,122,0.05)', borderRadius: '0.5rem',
                  }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#02343F' }}>{value}</div>
                    <div style={{ fontSize: '0.72rem', color: '#888', fontWeight: 500 }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex', justifyContent: 'center', gap: '1rem',
                marginTop: '1.5rem', flexWrap: 'wrap',
                animation: 'fadeUp 0.4s ease 0.5s both',
              }}>
                <button className="out-btn" onClick={handleDownload} style={{
                  ...buttonBase,
                  background: 'linear-gradient(135deg, #0A6C7A, #065A68)',
                  color: '#fff',
                }}>
                  ⬇️ Download
                </button>

                <button className="out-btn" onClick={handleCopy} style={{
                  ...buttonBase,
                  background: copyFeedback ? 'rgba(46,125,50,0.15)' : 'rgba(10, 108, 122, 0.12)',
                  color: copyFeedback ? '#2E7D32' : '#02343F',
                  boxShadow: 'none',
                  border: '1px solid ' + (copyFeedback ? 'rgba(46,125,50,0.3)' : '#D8D5B0'),
                }}>
                  {copyFeedback ? '✅ ' + copyFeedback : '📋 Copy'}
                </button>

                <button className="out-btn" onClick={() => navigate('/segment')} style={{
                  ...buttonBase,
                  background: 'linear-gradient(135deg, #02343F, #054752)',
                  color: '#fff',
                }}>
                  ← Segment Again
                </button>
              </div>
            </>
          ) : (
            /* ── Empty State ── */
            <div style={{
              padding: '3rem 1rem',
              textAlign: 'center',
              animation: 'fadeUp 0.4s ease 0.2s both',
            }}>
              <div style={{
                width: '70px', height: '70px', borderRadius: '50%',
                background: 'rgba(10,108,122,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.25rem',
                fontSize: '1.8rem',
              }}>
                📝
              </div>
              <p style={{ color: '#666', fontSize: '1.05rem', marginBottom: '1rem' }}>
                No segmentation results available yet.
              </p>
              <p style={{ color: '#999', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Go to the Segment page, paste your Urdu text, and click "Segment Text".
              </p>
              <button className="out-btn" onClick={() => navigate('/segment')} style={{
                ...buttonBase,
                background: 'linear-gradient(135deg, #0A6C7A, #065A68)',
                color: '#fff',
              }}>
                ✏️ Go to Segment Page
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default OutputPage