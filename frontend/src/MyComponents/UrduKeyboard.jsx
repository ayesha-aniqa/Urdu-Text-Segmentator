// UrduKeyboard.jsx
// Reusable on-screen Urdu keyboard.
// Emits two callbacks — onInsert(char) and onBackspace() — and lets the
// parent own cursor/selection logic, so it works with any controlled input.

const ROWS = [
  ['ا','آ','ب','پ','ت','ٹ','ث','ج','چ','ح','خ','د','ڈ','ذ'],
  ['ر','ڑ','ز','ژ','س','ش','ص','ض','ط','ظ','ع','غ','ف','ق'],
  ['ک','گ','ل','م','ن','ں','و','ہ','ھ','ء','ی','ے','ؤ','ئ','ۂ'],
  ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹','؟','،','۔','!',':'],
]

const DIACRITICS = ['َ','ِ','ُ','ً','ٍ','ٌ','ّ','ْ','ٰ','ٔ']

const keyStyle = {
  minWidth: '36px',
  height: '38px',
  padding: '0 0.5rem',
  background: '#fff',
  border: '1px solid #D8D5B0',
  borderRadius: '8px',
  fontSize: '1rem',
  fontWeight: 600,
  color: '#02343F',
  cursor: 'pointer',
  fontFamily: 'inherit',
  transition: 'all 0.15s ease',
  boxShadow: '0 1px 3px rgba(2,52,63,0.06)',
  userSelect: 'none',
}

const specialKeyStyle = {
  ...keyStyle,
  background: 'linear-gradient(135deg, #0A6C7A, #065A68)',
  color: '#fff',
  border: 'none',
  fontWeight: 700,
  letterSpacing: '0.02em',
}

function UrduKeyboard({ onInsert, onBackspace }) {
  // preventDefault on mousedown stops the textarea from losing focus,
  // which is required so the parent can read selectionStart/End reliably.
  const stealMouseDown = (e) => e.preventDefault()

  const renderKey = (ch, extra = {}) => (
    <button
      key={ch}
      type="button"
      className="urdu-key"
      style={{ ...keyStyle, ...extra }}
      onMouseDown={stealMouseDown}
      onClick={() => onInsert(ch)}
    >
      {ch}
    </button>
  )

  return (
    <div
      dir="rtl"
      onMouseDown={stealMouseDown}
      style={{
        marginTop: '1rem',
        padding: '0.85rem',
        background: '#FAFAF5',
        border: '1px solid #E8E5D0',
        borderRadius: '0.85rem',
        boxShadow: '0 4px 18px rgba(2,52,63,0.08)',
        animation: 'fadeUp 0.3s ease both',
      }}
    >
      <style>{`
        .urdu-key:hover { background: rgba(10,108,122,0.08) !important; transform: translateY(-1px); border-color: #0A6C7A !important; }
        .urdu-key:active { transform: translateY(0); }
        .urdu-special:hover { filter: brightness(1.1); transform: translateY(-1px); }
        .urdu-special:active { transform: translateY(0); }
      `}</style>

      {ROWS.map((row, ri) => (
        <div
          key={ri}
          style={{
            display: 'flex', flexWrap: 'wrap', gap: '5px',
            justifyContent: 'center', marginBottom: '5px',
          }}
        >
          {row.map((ch) => renderKey(ch))}
        </div>
      ))}

      {/* Diacritics (small dotted-circle hint helps users see floating marks) */}
      <div
        style={{
          display: 'flex', flexWrap: 'wrap', gap: '5px',
          justifyContent: 'center', marginBottom: '6px',
        }}
      >
        {DIACRITICS.map((ch) => renderKey(ch, { fontSize: '1.1rem' }))}
      </div>

      {/* Action row */}
      <div
        style={{
          display: 'flex', flexWrap: 'wrap', gap: '6px',
          justifyContent: 'center',
        }}
      >
        <button
          type="button"
          className="urdu-special"
          style={{ ...specialKeyStyle, minWidth: '180px' }}
          onMouseDown={stealMouseDown}
          onClick={() => onInsert(' ')}
        >
          Space
        </button>
        <button
          type="button"
          className="urdu-special"
          style={{ ...specialKeyStyle, minWidth: '70px' }}
          onMouseDown={stealMouseDown}
          onClick={onBackspace}
          aria-label="Backspace"
        >
          ⌫
        </button>
      </div>
    </div>
  )
}

export default UrduKeyboard
