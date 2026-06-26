// HistoryPage.jsx
// Lists past segmentation entries pulled from Supabase.
// Expanded rows render the same Segmented Text + BIESX Analysis views
// used on OutputPage, reusing the biesxColors utilities.

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchHistory } from '../services/historyApi'
import { groupTokensByWord, getTagLegend } from '../utils/biesxColors'

function HistoryPage() {
  const navigate = useNavigate()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [activeTab, setActiveTab] = useState('segments') // 'segments' | 'biesx'
  const legend = getTagLegend()

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const rows = await fetchHistory()
      if (!cancelled) {
        setEntries(rows)
        setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const formatDate = (iso) => {
    if (!iso) return ''
    try {
      return new Date(iso).toLocaleString()
    } catch {
      return iso
    }
  }

  const parseSegmentedOutput = (value) => {
    if (!value) return {}
    if (typeof value === 'string') {
      try {
        return JSON.parse(value)
      } catch {
        return {}
      }
    }
    return value
  }

  const tabStyle = (isActive) => ({
    padding: '0.5rem 1.15rem',
    fontSize: '0.85rem',
    fontWeight: isActive ? 700 : 500,
    color: isActive ? '#fff' : '#02343F',
    background: isActive
      ? 'linear-gradient(135deg, #02343F, #0A6C7A)'
      : 'rgba(10, 108, 122, 0.08)',
    border: isActive ? 'none' : '1px solid rgba(10, 108, 122, 0.15)',
    borderRadius: '50px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: isActive ? '0 3px 12px rgba(10, 108, 122, 0.3)' : 'none',
  })

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
        @keyframes shimmer { 0% { background-position:-200% center } 100% { background-position:200% center } }
        @keyframes spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }
        @keyframes popIn { from { opacity:0; transform:scale(0.85) } to { opacity:1; transform:scale(1) } }
        .hist-card:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(2,52,63,0.12) !important; }
        .biesx-pill { transition: all 0.2s ease; }
        .biesx-pill:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.12) !important; }
        .word-group { transition: all 0.25s ease; }
        .word-group:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(10,108,122,0.15) !important; }
      `}</style>

      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        minHeight: 'calc(100vh - 10rem)', padding: '1.5rem',
      }}>

        <img src="/uts-logo.png" alt="Logo" style={{
          width: '50px', height: '50px', borderRadius: '12px', objectFit: 'cover',
          marginBottom: '1.25rem',
          boxShadow: '0 6px 25px rgba(10, 108, 122, 0.35)',
          border: '3px solid rgba(240,237,204,0.4)',
          background: 'rgba(255,255,255,0.9)',
          animation: 'fadeUp 0.4s ease both',
        }} />

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

          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
            background: 'linear-gradient(90deg, #02343F, #0A6C7A, #065A68, #0A6C7A, #02343F)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 3s linear infinite',
          }} />

          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            fontWeight: 800,
            textAlign: 'center',
            marginBottom: '0.4rem',
            background: 'linear-gradient(135deg, #02343F, #0A6C7A)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Segmentation History
          </h2>
          <p style={{ textAlign: 'center', color: '#888', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
            {loading
              ? 'Loading your past segmentations…'
              : entries.length === 0
                ? 'No history yet — try segmenting some text first.'
                : `${entries.length} past ${entries.length === 1 ? 'entry' : 'entries'}`}
          </p>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
              <div style={{
                width: '40px', height: '40px',
                border: '4px solid rgba(10,108,122,0.15)',
                borderTopColor: '#0A6C7A',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
            </div>
          ) : entries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div style={{
                width: '70px', height: '70px', borderRadius: '50%',
                background: 'rgba(10,108,122,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1rem', fontSize: '1.8rem',
              }}>
                🕒
              </div>
              <button onClick={() => navigate('/segment')} style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #0A6C7A, #065A68)',
                color: '#fff', fontWeight: 600, fontSize: '0.95rem',
                border: 'none', borderRadius: '50px', cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(10, 108, 122, 0.3)',
              }}>
                ✏️ Start Segmenting
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {entries.map((row) => {
                const isOpen = expanded === row.number
                const out = parseSegmentedOutput(row.segmented_output)
                const segments = Array.isArray(out.segments) ? out.segments : []
                const tokens = Array.isArray(out.tokens) ? out.tokens : []
                const tags = Array.isArray(out.tags) ? out.tags : []
                const wordGroups = isOpen ? groupTokensByWord(tokens, tags) : []
                const hasBiesxData = tokens.length > 0 && tags.length === tokens.length

                return (
                  <div
                    key={row.number}
                    className="hist-card"
                    style={{
                      background: '#FAFAF5',
                      border: '1px solid #E8E5D0',
                      borderRadius: '0.85rem',
                      padding: '1rem 1.15rem',
                      transition: 'all 0.25s ease',
                      boxShadow: '0 2px 8px rgba(2,52,63,0.04)',
                    }}
                  >
                    <div
                      onClick={() => setExpanded(isOpen ? null : row.number)}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        gap: '0.75rem', cursor: 'pointer',
                      }}>
                      <span style={{
                        fontSize: '0.78rem', fontWeight: 700, color: '#0A6C7A',
                        background: 'rgba(10,108,122,0.1)',
                        padding: '0.2rem 0.55rem', borderRadius: '50px',
                        flexShrink: 0,
                      }}>
                        #{row.number}
                      </span>
                      <span style={{
                        flex: 1, color: '#02343F',
                        direction: 'rtl', textAlign: 'right',
                        fontSize: '0.95rem',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {row.input}
                      </span>
                      <span style={{ color: '#aaa', fontSize: '0.8rem', flexShrink: 0 }}>
                        {isOpen ? '▾' : '▸'}
                      </span>
                    </div>

                    {isOpen && (
                      <div style={{
                        marginTop: '0.85rem',
                        paddingTop: '0.85rem',
                        borderTop: '1px dashed #D8D5B0',
                        animation: 'fadeUp 0.25s ease both',
                      }}>
                        {/* Input */}
                        <div style={{ marginBottom: '0.85rem' }}>
                          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#888', marginBottom: '0.3rem', letterSpacing: '0.05em' }}>
                            INPUT
                          </div>
                          <div style={{
                            direction: 'rtl', textAlign: 'right',
                            color: '#02343F', fontSize: '0.95rem',
                            background: '#fff', padding: '0.6rem 0.8rem',
                            borderRadius: '0.5rem', border: '1px solid #E8E5D0',
                            whiteSpace: 'pre-wrap',
                          }}>
                            {row.input}
                          </div>
                        </div>

                        {/* Tab switcher */}
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#888', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>
                          SEGMENTED OUTPUT
                        </div>

                        {hasBiesxData && (
                          <div style={{
                            display: 'flex', justifyContent: 'center', gap: '0.5rem',
                            marginBottom: '0.85rem', flexWrap: 'wrap',
                          }}>
                            <button
                              type="button"
                              style={tabStyle(activeTab === 'segments')}
                              onClick={() => setActiveTab('segments')}>
                              📝 Segmented Text
                            </button>
                            <button
                              type="button"
                              style={tabStyle(activeTab === 'biesx')}
                              onClick={() => setActiveTab('biesx')}>
                              🏷️ BIESX Analysis
                            </button>
                          </div>
                        )}

                        {/* Tab content */}
                        <div style={{
                          background: '#fff',
                          border: '1px solid #E8E5D0',
                          borderRadius: '0.75rem',
                          padding: '1rem',
                          minHeight: '120px',
                        }}>
                          {(!hasBiesxData || activeTab === 'segments') ? (
                            /* ── Segmented Text View ── */
                            segments.length === 0 ? (
                              <div style={{ color: '#999', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>
                                No segments available.
                              </div>
                            ) : (
                              <div style={{
                                direction: 'rtl', textAlign: 'right',
                                fontSize: '1.1rem', lineHeight: 2.2,
                                color: '#02343F',
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
                                    }}>
                                      {seg}
                                    </span>
                                    {i < segments.length - 1 && (
                                      <span style={{
                                        color: '#0A6C7A', fontWeight: 300, opacity: 0.5,
                                        margin: '0 0.15rem', fontSize: '1.05rem',
                                      }}>|</span>
                                    )}
                                  </span>
                                ))}
                              </div>
                            )
                          ) : (
                            /* ── BIESX Analysis View ── */
                            <div>
                              {/* Legend */}
                              <div style={{
                                display: 'flex', flexWrap: 'wrap', gap: '0.4rem',
                                justifyContent: 'center', marginBottom: '1rem',
                                padding: '0.6rem', background: '#FAFAF5',
                                borderRadius: '0.6rem', border: '1px solid #E8E5D0',
                              }}>
                                {legend.map(({ tag, label, color, bg }) => (
                                  <span key={tag} style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                    padding: '0.2rem 0.55rem', borderRadius: '50px',
                                    fontSize: '0.72rem', fontWeight: 600,
                                    color, background: bg,
                                  }}>
                                    <span style={{
                                      width: '7px', height: '7px', borderRadius: '50%',
                                      background: color, display: 'inline-block',
                                    }} />
                                    {tag} = {label}
                                  </span>
                                ))}
                              </div>

                              {/* Word Groups */}
                              {wordGroups.length === 0 ? (
                                <div style={{ color: '#999', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>
                                  No tagged tokens to display.
                                </div>
                              ) : (
                                <div style={{
                                  display: 'flex', flexWrap: 'wrap', gap: '0.6rem',
                                  justifyContent: 'center', direction: 'rtl',
                                }}>
                                  {wordGroups.map((group, gi) => (
                                    <div key={gi} className="word-group" style={{
                                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                                      padding: '0.6rem',
                                      background: '#FAFAF5',
                                      borderRadius: '0.75rem',
                                      border: '1px solid #E0DFC8',
                                      boxShadow: '0 2px 6px rgba(2,52,63,0.05)',
                                      animation: `popIn 0.3s ease ${Math.min(gi * 0.03, 0.6)}s both`,
                                      minWidth: '46px',
                                    }}>
                                      <span style={{
                                        fontSize: '1.1rem', fontWeight: 700, color: '#02343F',
                                        marginBottom: '0.4rem', direction: 'rtl',
                                      }}>
                                        {group.word}
                                      </span>
                                      <div style={{ display: 'flex', gap: '3px', direction: 'rtl' }}>
                                        {group.chars.map((ch, ci) => (
                                          <div key={ci} className="biesx-pill" style={{
                                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                                            padding: '0.25rem 0.4rem',
                                            background: ch.style.bg,
                                            border: `1.5px solid ${ch.style.border}`,
                                            borderRadius: '5px',
                                            minWidth: '24px',
                                          }}>
                                            <span style={{
                                              fontSize: '0.95rem', fontWeight: 600,
                                              color: '#02343F', lineHeight: 1.2,
                                            }}>
                                              {ch.token}
                                            </span>
                                            <span style={{
                                              fontSize: '0.6rem', fontWeight: 700,
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
                              )}
                            </div>
                          )}
                        </div>

                        {row.created_at && (
                          <div style={{ fontSize: '0.72rem', color: '#aaa', textAlign: 'right', marginTop: '0.6rem' }}>
                            {formatDate(row.created_at)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default HistoryPage
