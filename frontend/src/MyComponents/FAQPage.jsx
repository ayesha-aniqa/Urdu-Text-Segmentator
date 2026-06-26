// FAQPage.jsx — Frequently Asked Questions with accordion-style toggles

import { useState, useEffect } from 'react'

function FAQPage() {
  const [visible, setVisible] = useState(false)
  const [openIndex, setOpenIndex] = useState(null)
  useEffect(() => { setVisible(true) }, [])

  const faqs = [
    {
      q: 'What is Urdu Text Segmentor?',
      a: 'Urdu Text Segmentor is a web-based tool that automatically segments (separates) Urdu text into individual words and tokens. It uses advanced NLP techniques to identify word boundaries in Urdu script.'
    },
    {
      q: 'What file formats are supported?',
      a: 'You can upload .txt (plain text) and .docx (Microsoft Word) files. You can also paste text directly into the input area or use the Paste URL feature to paste content from your clipboard.'
    },
    {
      q: 'Is my data stored on your servers?',
      a: 'No. All text processing happens in your browser. We do not store, log, or transmit your text data to any external server. Your privacy is our priority.'
    },
    {
      q: 'How accurate is the segmentation?',
      a: 'Our segmentation engine achieves high accuracy on standard Urdu text. However, results may vary depending on the complexity of the text, use of diacritics, and the presence of mixed-language content.'
    },
    {
      q: 'Can I use this tool for other Arabic-script languages?',
      a: 'The tool is optimized specifically for Urdu. While it may partially work with other Arabic-script languages like Arabic, Persian, or Pashto, the results may not be optimal.'
    },
    {
      q: 'Is this tool free to use?',
      a: 'Yes! Urdu Text Segmentor is completely free and open-source. It was developed as a Final Year Project (FYP) by students passionate about Urdu language processing.'
    },
    {
      q: 'How do I download the segmented output?',
      a: 'After segmentation, you will be redirected to the Output page. From there, you can click the "Download" button to save the segmented text as a .txt file, or use the "Copy" button to copy it to your clipboard.'
    }
  ]

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i)

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(30px) } to { opacity:1; transform:translateY(0) } }
        .faq-item:hover { box-shadow: 0 8px 25px rgba(2,52,63,0.1) !important; }
      `}</style>

      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        minHeight: 'calc(100vh - 10rem)', padding: '2rem'
      }}>
        <div style={{
          width: '100%', maxWidth: '52rem',
          animation: visible ? 'fadeUp 0.6s ease both' : 'none'
        }}>
          <h1 style={{
            fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 800, textAlign: 'center', marginBottom: '0.5rem',
            background: 'linear-gradient(135deg,#02343F,#0A6C7A)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>Frequently Asked Questions</h1>
          <p style={{ textAlign: 'center', color: '#666', fontSize: '1.05rem', marginBottom: '2.5rem' }}>
            Everything you need to know about Urdu Text Segmentor
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {faqs.map((faq, i) => (
              <div key={i} className="faq-item" onClick={() => toggle(i)} style={{
                background: '#fff', border: '1px solid #D8D5B0', borderRadius: '1rem',
                padding: '1.25rem 1.5rem', cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(2,52,63,0.04)',
                transition: 'all 0.3s ease',
                animation: visible ? `fadeUp 0.5s ease ${0.1 + i * 0.07}s both` : 'none'
              }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#02343F', margin: 0 }}>
                    {faq.q}
                  </h3>
                  <span style={{
                    fontSize: '1.4rem', color: '#0A6C7A', fontWeight: 300,
                    transform: openIndex === i ? 'rotate(45deg)' : 'rotate(0)',
                    transition: 'transform 0.3s ease', flexShrink: 0, marginLeft: '1rem'
                  }}>+</span>
                </div>
                <div style={{
                  maxHeight: openIndex === i ? '200px' : '0',
                  overflow: 'hidden', transition: 'max-height 0.4s ease, opacity 0.3s ease',
                  opacity: openIndex === i ? 1 : 0
                }}>
                  <p style={{
                    color: '#666', lineHeight: 1.7, fontSize: '0.95rem',
                    marginTop: '0.75rem', paddingTop: '0.75rem',
                    borderTop: '1px solid #E8E5C8'
                  }}>
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default FAQPage
