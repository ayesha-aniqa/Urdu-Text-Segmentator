// SegmentPage.jsx
// Single-page segmentation flow: input + inline results render on the same screen.
// Includes the on-screen UrduKeyboard. Supabase history logging is preserved.

import { useState, useEffect, useRef } from 'react'
import mammoth from 'mammoth'
import { segmentText } from '../services/segmentApi'
import { saveHistory } from '../services/historyApi'
import { groupTokensByWord, getTagLegend } from '../utils/biesxColors'
import UrduKeyboard from './UrduKeyboard'

function SegmentPage({ setSegmentedText }) {
  const textareaRef = useRef(null)

  const [visible, setVisible] = useState(false)
  const [inputText, setInputText] = useState('')
  const [fileName, setFileName] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const [urduError, setUrduError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')

  // Inline result state — replaces navigation to /output
  const [segmentedResult, setSegmentedResult] = useState(null)
  const [resultTab, setResultTab] = useState('segments')  // 'segments' | 'biesx'
  const [copyFeedback, setCopyFeedback] = useState('')

  // On-screen Urdu keyboard
  const [showKeyboard, setShowKeyboard] = useState(false)

  const legend = getTagLegend()

  useEffect(() => { setVisible(true) }, [])

  // Check if text is Urdu (Arabic script Unicode range)
  const isUrduText = (text) => {
    const cleaned = text.replace(/[\s\d.,!?؟،۔()\-\n\r]/g, '')
    if (!cleaned) return false
    const urduChars = (cleaned.match(/[\u0600-\u06FF]/g) || []).length
    return (urduChars / cleaned.length) >= 0.7
  }

  // ── On-screen keyboard handlers — operate at the active cursor position ──

  const insertAtCursor = (char) => {
    const ta = textareaRef.current
    if (!ta) {
      setInputText((prev) => prev + char)
      setUrduError('')
      return
    }
    const start = ta.selectionStart ?? inputText.length
    const end = ta.selectionEnd ?? inputText.length
    const next = inputText.slice(0, start) + char + inputText.slice(end)
    setInputText(next)
    setUrduError('')
    requestAnimationFrame(() => {
      const el = textareaRef.current
      if (!el) return
      el.focus()
      const pos = start + char.length
      el.setSelectionRange(pos, pos)
    })
  }

  const backspaceAtCursor = () => {
    const ta = textareaRef.current
    if (!ta) {
      setInputText((prev) => prev.slice(0, -1))
      return
    }
    const start = ta.selectionStart ?? inputText.length
    const end = ta.selectionEnd ?? inputText.length

    if (start !== end) {
      const next = inputText.slice(0, start) + inputText.slice(end)
      setInputText(next)
      requestAnimationFrame(() => {
        const el = textareaRef.current
        if (!el) return
        el.focus()
        el.setSelectionRange(start, start)
      })
    } else {
      if (start === 0) return
      const next = inputText.slice(0, start - 1) + inputText.slice(end)
      setInputText(next)
      requestAnimationFrame(() => {
        const el = textareaRef.current
        if (!el) return
        el.focus()
        const pos = start - 1
        el.setSelectionRange(pos, pos)
      })
    }
  }

  // Handle form submission — segments, saves history, renders inline (no navigation)
  const handleSegment = async (e) => {
    e.preventDefault()
    setUrduError('')
    if (!inputText.trim()) return

    if (!isUrduText(inputText)) {
      setUrduError('براہ کرم اردو میں لکھیں — Please write in Urdu script.')
      return
    }

    setIsLoading(true)
    setLoadingMsg('Segmenting text with BiLSTM+CRF model…')

    try {
      const result = await segmentText(inputText)
      // Keep App-level state in sync so /output continues to work if visited.
      setSegmentedText(result)

      // Spinner stays visible while we log to Supabase, per the new flow.
      setLoadingMsg('Saving to history…')
      await saveHistory(inputText, result)

      // Render inline — no router push.
      setSegmentedResult(result)
      setResultTab('segments')
    } catch (err) {
      console.error('[SegmentPage] Segmentation failed:', err)
      setUrduError(
        err.name === 'BackendUnreachableError'
          ? 'بیک اینڈ سرور دستیاب نہیں — Backend server is not reachable. Please start the Python server.'
          : err.message || 'Segmentation failed. Please try again.'
      )
    } finally {
      setIsLoading(false)
      setLoadingMsg('')
    }
  }

  // ── Inline result actions ──

  const handleCopy = () => {
    if (!segmentedResult) return
    const { tokens, tags, segments } = segmentedResult
    const text = resultTab === 'segments'
      ? segments.join(' | ')
      : tokens.map((t, i) => `${t}[${tags[i]}]`).join(' ')
    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedback('Copied!')
      setTimeout(() => setCopyFeedback(''), 2000)
    })
  }

  const handleDownload = () => {
    if (!segmentedResult) return
    const { tokens, tags, segments } = segmentedResult
    const lines = [
      '═══ Urdu Text Segmentor — Output ═══',
      '',
      '── Segmented Words ──',
      segments.join(' | '),
      '',
      '── BIESX Tags ──',
      tokens.map((t, i) => `${t}[${tags[i]}]`).join(' '),
      '',
      '── Stats ──',
      `Total characters: ${tokens.length}`,
      `Total segments: ${segments.length}`,
      `Tags: ${tags.filter((t) => t !== 'X').length} (excl. spaces)`,
    ].join('\n')
    const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'segmented_output.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleClearResult = () => {
    setSegmentedResult(null)
    setCopyFeedback('')
  }

  // Handle file upload (.txt and .docx)
  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    processFile(file)
  }

  const processFile = (file) => {
    const ext = file.name.split('.').pop().toLowerCase()
    setFileName(file.name)

    if (ext === 'txt') {
      const reader = new FileReader()
      reader.onload = (ev) => setInputText(ev.target.result)
      reader.readAsText(file)
    } else if (ext === 'docx') {
      const reader = new FileReader()
      reader.onload = (ev) => {
        mammoth.extractRawText({ arrayBuffer: ev.target.result })
          .then((result) => setInputText(result.value))
          .catch(() => alert('Could not read this Word file. Please try a .txt file instead.'))
      }
      reader.readAsArrayBuffer(file)
    } else {
      alert('Please upload a .txt or .docx file.')
      setFileName('')
    }
  }

  // Extract Urdu text from raw HTML string
  const extractUrduFromHTML = (html) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    doc.querySelectorAll('script, style, noscript, svg, img, video, audio, iframe, canvas').forEach((el) => el.remove())
    const allText = doc.body ? doc.body.textContent : ''
    const lines = allText.split(/\n/)
    const urduLines = lines
      .map((line) => line.trim())
      .filter((line) => {
        if (!line || line.length < 3) return false
        const urduChars = (line.match(/[\u0600-\u06FF]/g) || []).length
        return urduChars >= 3
      })
    return urduLines.join('\n')
  }

  // Fetch URL content — uses our local proxy (setupProxy.js) first, public proxies as fallback
  const fetchWithProxy = async (targetUrl) => {
    const proxies = [
      { name: 'local-proxy', buildUrl: (url) => `/api/fetch-url?url=${encodeURIComponent(url)}` },
      { name: 'corsproxy.io', buildUrl: (url) => `https://corsproxy.io/?${encodeURIComponent(url)}` },
      { name: 'allorigins', buildUrl: (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}` },
    ]
    for (const proxy of proxies) {
      try {
        console.log(`[URL Fetch] Trying: ${proxy.name}`)
        const response = await fetch(proxy.buildUrl(targetUrl), {
          headers: { 'Accept': 'text/html,application/xhtml+xml,*/*' },
        })
        if (!response.ok) {
          console.warn(`[URL Fetch] ${proxy.name} → status ${response.status}`)
          continue
        }
        const html = await response.text()
        if (html && html.length > 100) {
          console.log(`[URL Fetch] ✅ ${proxy.name} returned ${html.length} chars`)
          return html
        }
        console.warn(`[URL Fetch] ${proxy.name} → empty/short response`)
      } catch (err) {
        console.warn(`[URL Fetch] ${proxy.name} failed:`, err.message)
      }
    }
    return null
  }

  // Handle Paste URL — detects URLs, fetches page, extracts Urdu text
  const handlePasteURL = async () => {
    try {
      const clipText = (await navigator.clipboard.readText()).trim()
      const urlPattern = /^https?:\/\/.+/i
      if (!urlPattern.test(clipText)) {
        setInputText(clipText)
        return
      }
      setIsLoading(true)
      setLoadingMsg('Fetching content from URL…')
      setUrduError('')
      try {
        const html = await fetchWithProxy(clipText)
        if (!html) {
          setUrduError('URL سے مواد حاصل نہیں ہو سکا — All proxy servers failed. Try pasting the text directly.')
          return
        }
        setLoadingMsg('Extracting Urdu text…')
        const extractedText = extractUrduFromHTML(html)
        if (extractedText) {
          setInputText(extractedText)
          setFileName(`URL: ${clipText.substring(0, 50)}${clipText.length > 50 ? '…' : ''}`)
          console.log(`[URL Fetch] Extracted ${extractedText.length} chars of Urdu text`)
        } else {
          setUrduError('اس لنک میں اردو متن نہیں ملا — No Urdu text found at this URL.')
        }
      } catch (fetchErr) {
        console.error('[URL Fetch] Error:', fetchErr)
        setUrduError('URL سے مواد حاصل نہیں ہو سکا — Failed to fetch URL. Please check the link and try again.')
      } finally {
        setIsLoading(false)
        setLoadingMsg('')
      }
    } catch (err) {
      alert('Clipboard access denied. Please paste your URL manually into the text area.')
    }
  }

  // Drag and drop
  const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true) }
  const handleDragLeave = () => setIsDragOver(false)
  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  const btnStyle = {
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #0A6C7A, #065A68)',
    color: '#fff',
    fontWeight: 600,
    fontSize: '0.95rem',
    border: 'none',
    borderRadius: '50px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
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

  // Derived data for the inline result view
  const result = segmentedResult
  const segments = result?.segments ?? []
  const tokens = result?.tokens ?? []
  const tags = result?.tags ?? []
  const wordGroups = result ? groupTokensByWord(tokens, tags) : []

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(40px) } to { opacity:1; transform:translateY(0) } }
        @keyframes float { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-10px) } }
        @keyframes shimmer { 0% { background-position:-200% center } 100% { background-position:200% center } }
        @keyframes pulse-border { 0%,100% { border-color: rgba(10,108,122,0.2) } 50% { border-color: rgba(10,108,122,0.5) } }
        @keyframes spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }
        @keyframes blob1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(25px,-15px) scale(1.08)} 66%{transform:translate(-10px,12px) scale(0.95)} }
        @keyframes blob2 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-20px,18px) scale(0.92)} 66%{transform:translate(15px,-8px) scale(1.06)} }
        @keyframes popIn { from { opacity:0; transform:scale(0.85) } to { opacity:1; transform:scale(1) } }
        .seg-btn:hover { transform:translateY(-3px) !important; box-shadow:0 8px 25px rgba(10,108,122,0.45) !important; background:linear-gradient(135deg,#02343F,#054752) !important; }
        .seg-btn:active { transform:translateY(0) !important; }
        .seg-textarea:focus { border-color:#0A6C7A !important; box-shadow:0 0 0 4px rgba(10,108,122,0.1) !important; }
        .biesx-pill { transition: all 0.2s ease; }
        .biesx-pill:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.12) !important; }
        .word-group { transition: all 0.25s ease; }
        .word-group:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(10,108,122,0.15) !important; }
      `}</style>

      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: 'calc(100vh - 10rem)', padding: '1.5rem', position: 'relative', overflow: 'hidden',
      }}>

        {/* Animated background blobs */}
        <div style={{ position: 'absolute', top: '-60px', right: '-50px', width: '240px', height: '240px',
          borderRadius: '50%', background: 'rgba(10,108,122,0.06)', animation: 'blob1 8s ease-in-out infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-50px', left: '-30px', width: '200px', height: '200px',
          borderRadius: '50%', background: 'rgba(2,52,63,0.05)', animation: 'blob2 10s ease-in-out infinite', pointerEvents: 'none' }} />

        {/* Floating logo */}
        <div style={{
          animation: visible ? 'fadeUp 0.5s ease forwards, float 4s ease-in-out 0.5s infinite' : 'none',
          opacity: visible ? 1 : 0, marginBottom: '1.25rem',
        }}>
          <img src="/uts-logo.png" alt="Logo" style={{
            width: '55px', height: '55px', borderRadius: '12px', objectFit: 'cover',
            boxShadow: '0 6px 25px rgba(10, 108, 122, 0.35)',
            border: '3px solid rgba(240,237,204,0.4)',
            background: 'rgba(255,255,255,0.9)',
          }} />
        </div>

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
          animation: visible ? 'fadeUp 0.6s ease 0.15s both' : 'none',
        }}>

          {/* Decorative top gradient bar */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
            background: 'linear-gradient(90deg, #02343F, #0A6C7A, #065A68, #0A6C7A, #02343F)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 3s linear infinite',
          }} />

          {/* Loading overlay — covers card during segment + Supabase save */}
          {isLoading && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 10,
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(4px)',
              borderRadius: '1.5rem',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: '1rem',
            }}>
              <div style={{
                width: '44px', height: '44px',
                border: '4px solid rgba(10,108,122,0.15)',
                borderTopColor: '#0A6C7A',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
              <span style={{ color: '#02343F', fontWeight: 600, fontSize: '1rem', textAlign: 'center' }}>
                {loadingMsg}
              </span>
            </div>
          )}

          {/* Decorative corner circles */}
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '100px', height: '100px',
            borderRadius: '50%', background: 'rgba(10,108,122,0.04)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-30px', left: '-30px', width: '80px', height: '80px',
            borderRadius: '50%', background: 'rgba(2,52,63,0.03)', pointerEvents: 'none' }} />

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
            Upload or Paste Text
          </h2>
          <p style={{ textAlign: 'center', color: '#888', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Paste your Urdu text, upload a file, or drag &amp; drop
          </p>

          <form onSubmit={handleSegment}>
            {/* Textarea with drag-and-drop zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{
                position: 'relative',
                borderRadius: '1rem',
                padding: '3px',
                background: isDragOver
                  ? 'linear-gradient(135deg, #0A6C7A, #065A68)'
                  : 'linear-gradient(135deg, rgba(10,108,122,0.2), rgba(2,52,63,0.15))',
                transition: 'all 0.3s ease',
                animation: visible ? 'fadeUp 0.5s ease 0.3s both' : 'none',
              }}
            >
              <textarea
                ref={textareaRef}
                className="seg-textarea"
                value={inputText}
                onChange={(e) => { setInputText(e.target.value); setUrduError('') }}
                placeholder="...اپنا اردو متن یہاں پیسٹ کریں"
                style={{
                  width: '100%',
                  padding: '1.25rem',
                  border: 'none',
                  borderRadius: '0.85rem',
                  minHeight: '220px',
                  fontSize: '1.05rem',
                  color: '#02343F',
                  resize: 'vertical',
                  outline: 'none',
                  direction: 'rtl',
                  textAlign: 'right',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  background: isDragOver ? 'rgba(240,237,204,0.3)' : '#FAFAF5',
                  transition: 'all 0.3s ease',
                }}
              />
              {isDragOver && (
                <div style={{
                  position: 'absolute', inset: '3px', borderRadius: '0.85rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(10,108,122,0.08)', pointerEvents: 'none',
                }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 600, color: '#0A6C7A' }}>
                    📂 Drop your file here
                  </span>
                </div>
              )}
            </div>

            {/* Urdu validation error message */}
            {urduError && (
              <div style={{
                marginTop: '0.75rem', padding: '0.65rem 1rem',
                background: 'rgba(220, 53, 69, 0.08)', border: '1px solid rgba(220, 53, 69, 0.25)',
                borderRadius: '0.6rem', textAlign: 'center',
                animation: 'fadeUp 0.3s ease both',
              }}>
                <span style={{ color: '#dc3545', fontSize: '0.92rem', fontWeight: 600, direction: 'rtl' }}>
                  ⚠️ {urduError}
                </span>
              </div>
            )}

            {/* File name indicator */}
            {fileName && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                marginTop: '0.75rem', padding: '0.5rem 1rem',
                background: 'rgba(10,108,122,0.08)', borderRadius: '50px',
                width: 'fit-content', margin: '0.75rem auto 0',
              }}>
                <span style={{ fontSize: '0.85rem', color: '#0A6C7A', fontWeight: 600 }}>
                  📄 {fileName}
                </span>
                <button type="button" onClick={() => { setFileName(''); setInputText('') }}
                  style={{
                    background: 'none', border: 'none', color: '#999', cursor: 'pointer',
                    fontSize: '1rem', padding: '0 0.25rem', lineHeight: 1,
                  }}>✕</button>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{
              display: 'flex', justifyContent: 'center', gap: '1rem',
              marginTop: '1.5rem', flexWrap: 'wrap',
              animation: visible ? 'fadeUp 0.5s ease 0.45s both' : 'none',
            }}>
              <button type="button" onClick={handlePasteURL} className="seg-btn" style={{
                ...btnStyle,
                opacity: isLoading ? 0.6 : 1,
                pointerEvents: isLoading ? 'none' : 'auto',
              }} disabled={isLoading}>
                {isLoading ? '⏳ Fetching…' : '🔗 Paste URL'}
              </button>

              <label className="seg-btn" style={{ ...btnStyle, cursor: 'pointer' }}>
                📁 Browse
                <input type="file" accept=".txt,.docx" onChange={handleFileSelect} style={{ display: 'none' }} />
              </label>

              <button
                type="button"
                onClick={() => setShowKeyboard((v) => !v)}
                className="seg-btn"
                style={{
                  ...btnStyle,
                  background: showKeyboard
                    ? 'linear-gradient(135deg, #02343F, #054752)'
                    : 'linear-gradient(135deg, #0A6C7A, #065A68)',
                }}
                aria-pressed={showKeyboard}
              >
                ⌨️ {showKeyboard ? 'Hide Keyboard' : 'Keyboard'}
              </button>

              <button type="submit" className="seg-btn" style={{
                ...btnStyle,
                background: inputText.trim()
                  ? 'linear-gradient(135deg, #02343F, #054752)'
                  : 'linear-gradient(135deg, #0A6C7A, #065A68)',
                boxShadow: inputText.trim()
                  ? '0 6px 20px rgba(2,52,63,0.4)'
                  : '0 4px 15px rgba(10,108,122,0.3)',
                transform: inputText.trim() ? 'scale(1.02)' : 'scale(1)',
              }}>
                Segment Text ✏️
              </button>
            </div>
          </form>

          {/* Urdu on-screen keyboard */}
          {showKeyboard && (
            <UrduKeyboard onInsert={insertAtCursor} onBackspace={backspaceAtCursor} />
          )}

          {/* Helper hint */}
          <p style={{
            textAlign: 'center', color: '#aaa', fontSize: '0.78rem', marginTop: '1.25rem',
            animation: visible ? 'fadeUp 0.5s ease 0.6s both' : 'none',
          }}>
            Supports <strong>.txt</strong> and <strong>.docx</strong> files • Drag &amp; drop supported
          </p>

          {/* ── Inline Result Section ── */}
          {result && (
            <div style={{
              marginTop: '2rem',
              paddingTop: '1.5rem',
              borderTop: '1px dashed #D8D5B0',
              animation: 'fadeUp 0.5s ease both',
            }}>
              <h3 style={{
                fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
                fontWeight: 800,
                textAlign: 'center',
                marginBottom: '0.4rem',
                background: 'linear-gradient(135deg, #02343F, #0A6C7A)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Segmentation Results
              </h3>
              <p style={{ textAlign: 'center', color: '#888', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                {`${segments.length} segments detected from ${tokens.filter((t) => t.trim()).length} characters`}
              </p>

              {/* Tab Switcher */}
              <div style={{
                display: 'flex', justifyContent: 'center', gap: '0.75rem',
                marginBottom: '1rem',
              }}>
                <button type="button" style={tabStyle(resultTab === 'segments')} onClick={() => setResultTab('segments')}>
                  📝 Segmented Text
                </button>
                <button type="button" style={tabStyle(resultTab === 'biesx')} onClick={() => setResultTab('biesx')}>
                  🏷️ BIESX Analysis
                </button>
              </div>

              {/* Tab Content */}
              <div style={{
                background: '#FAFAF5',
                border: '1px solid #E8E5D0',
                borderRadius: '1rem',
                padding: '1.25rem',
                minHeight: '160px',
              }}>
                {resultTab === 'segments' ? (
                  <div style={{
                    direction: 'rtl', textAlign: 'right',
                    fontSize: '1.1rem', lineHeight: 2.2, color: '#02343F',
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
                ) : (
                  <div>
                    {/* Legend */}
                    <div style={{
                      display: 'flex', flexWrap: 'wrap', gap: '0.4rem',
                      justifyContent: 'center', marginBottom: '1rem',
                      padding: '0.6rem', background: '#fff',
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
                    <div style={{
                      display: 'flex', flexWrap: 'wrap', gap: '0.6rem',
                      justifyContent: 'center', direction: 'rtl',
                    }}>
                      {wordGroups.map((group, gi) => (
                        <div key={gi} className="word-group" style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center',
                          padding: '0.6rem',
                          background: '#fff',
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
                  </div>
                )}
              </div>

              {/* Stats bar */}
              <div style={{
                display: 'flex', justifyContent: 'center', gap: '1.25rem',
                marginTop: '1rem', flexWrap: 'wrap',
              }}>
                {[
                  { label: 'Characters', value: tokens.filter((t) => t.trim()).length },
                  { label: 'Segments', value: segments.length },
                  { label: 'B tags', value: tags.filter((t) => t === 'B').length },
                  { label: 'S tags', value: tags.filter((t) => t === 'S').length },
                ].map(({ label, value }) => (
                  <div key={label} style={{
                    textAlign: 'center', padding: '0.4rem 0.7rem',
                    background: 'rgba(10,108,122,0.05)', borderRadius: '0.5rem',
                  }}>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#02343F' }}>{value}</div>
                    <div style={{ fontSize: '0.7rem', color: '#888', fontWeight: 500 }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Result Action Buttons */}
              <div style={{
                display: 'flex', justifyContent: 'center', gap: '1rem',
                marginTop: '1.25rem', flexWrap: 'wrap',
              }}>
                <button type="button" className="seg-btn" onClick={handleDownload} style={{
                  ...btnStyle,
                  background: 'linear-gradient(135deg, #0A6C7A, #065A68)',
                }}>
                  ⬇️ Download
                </button>
                <button type="button" className="seg-btn" onClick={handleCopy} style={{
                  ...btnStyle,
                  background: copyFeedback ? 'rgba(46,125,50,0.15)' : 'rgba(10, 108, 122, 0.12)',
                  color: copyFeedback ? '#2E7D32' : '#02343F',
                  boxShadow: 'none',
                  border: '1px solid ' + (copyFeedback ? 'rgba(46,125,50,0.3)' : '#D8D5B0'),
                }}>
                  {copyFeedback ? '✅ ' + copyFeedback : '📋 Copy'}
                </button>
                <button type="button" className="seg-btn" onClick={handleClearResult} style={{
                  ...btnStyle,
                  background: 'linear-gradient(135deg, #02343F, #054752)',
                }}>
                  ✖ Clear Result
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default SegmentPage
