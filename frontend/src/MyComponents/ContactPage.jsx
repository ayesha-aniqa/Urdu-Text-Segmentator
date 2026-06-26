// ContactPage.jsx — Beautifully animated contact page
import { useState, useEffect } from 'react'

function ContactPage() {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setVisible(true) }, [])

  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    setSent(true)
    setTimeout(() => { setSent(false); setFormData({ name: '', email: '', subject: '', message: '' }) }, 3000)
  }

  const inputStyle = {
    width: '100%',
    padding: '0.9rem 1rem',
    border: '2px solid rgba(240,237,204,0.2)',
    borderRadius: '0.75rem',
    fontSize: '0.95rem',
    color: '#02343F',
    outline: 'none',
    background: 'rgba(255,255,255,0.95)',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease'
  }

  const labelStyle = {
    display: 'block',
    fontSize: '0.88rem',
    fontWeight: 600,
    color: '#F0EDCC',
    marginBottom: '0.4rem',
    letterSpacing: '0.02em'
  }

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(40px) } to { opacity:1; transform:translateY(0) } }
        @keyframes float { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-12px) } }
        @keyframes shimmer { 0% { background-position:-200% center } 100% { background-position:200% center } }
        @keyframes slideLeft { from { opacity:0; transform:translateX(-30px) } to { opacity:1; transform:translateX(0) } }
        @keyframes slideRight { from { opacity:0; transform:translateX(30px) } to { opacity:1; transform:translateX(0) } }
        @keyframes blob1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(30px,-20px) scale(1.1)} 66%{transform:translate(-15px,15px) scale(0.95)} }
        @keyframes blob2 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-25px,20px) scale(0.9)} 66%{transform:translate(20px,-10px) scale(1.08)} }
        @keyframes successPop { 0%{transform:scale(0.5);opacity:0} 60%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
        .contact-input:focus { border-color:#F0EDCC !important; box-shadow:0 0 0 3px rgba(240,237,204,0.2) !important; }
        .send-btn:hover { transform:translateY(-3px) !important; box-shadow:0 12px 30px rgba(10,108,122,0.5) !important; }
        .send-btn:active { transform:translateY(0) !important; }
      `}</style>

      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        minHeight: 'calc(100vh - 10rem)', padding: '2rem', position: 'relative', overflow: 'hidden'
      }}>

        {/* Animated background blobs */}
        <div style={{ position: 'absolute', top: '-80px', right: '-60px', width: '280px', height: '280px',
          borderRadius: '50%', background: 'rgba(10,108,122,0.06)', animation: 'blob1 8s ease-in-out infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-40px', width: '220px', height: '220px',
          borderRadius: '50%', background: 'rgba(2,52,63,0.05)', animation: 'blob2 10s ease-in-out infinite', pointerEvents: 'none' }} />

        {/* Floating icon */}
        <div style={{
          animation: visible ? 'fadeUp 0.6s ease forwards, float 4s ease-in-out 0.6s infinite' : 'none',
          opacity: visible ? 1 : 0, marginBottom: '1rem'
        }}>
          <div style={{
            width: '70px', height: '70px', borderRadius: '50%',
            background: 'linear-gradient(135deg,#02343F,#0A6C7A)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', boxShadow: '0 8px 30px rgba(10,108,122,0.35)'
          }}>✉️</div>
        </div>

        {/* Title */}
        <div style={{
          textAlign: 'center', marginBottom: '2rem',
          animation: visible ? 'fadeUp 0.7s ease 0.15s both' : 'none'
        }}>
          <h1 style={{
            fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.5rem',
            background: 'linear-gradient(135deg,#02343F,#0A6C7A,#02343F)',
            backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            animation: 'shimmer 4s linear infinite'
          }}>Get In Touch</h1>
          <p style={{ color: '#666', fontSize: '1.1rem', maxWidth: '28rem', margin: '0 auto', lineHeight: 1.7 }}>
            Have a question or want to collaborate? We'd love to hear from you!
          </p>
        </div>

        {/* Contact Info Cards — Email & Visit only */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem', width: '100%', maxWidth: '52rem', marginBottom: '2rem'
        }}>
          {[
            { icon: '📧', title: 'Email Us', value: 'contact@urdusegmentor.com', sub: 'We reply within 24 hours', color: '#0A6C7A' },
            { icon: '📍', title: 'Visit Us', value: 'University Campus', sub: 'CS Department, Block A', color: '#02343F' },
          ].map((c, i) => (
            <div key={i} style={{
              background: '#fff', border: '1px solid #D8D5B0', borderRadius: '1.25rem',
              padding: '1.75rem 1.25rem', textAlign: 'center', cursor: 'default',
              transition: 'all 0.4s cubic-bezier(0.175,0.885,0.32,1.275)',
              boxShadow: '0 4px 15px rgba(2,52,63,0.06)',
              animation: visible ? `fadeUp 0.6s ease ${0.25 + i * 0.12}s both` : 'none'
            }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.03)'
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(2,52,63,0.18)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(2,52,63,0.06)'
              }}
            >
              <div style={{
                width: '56px', height: '56px', borderRadius: '16px', margin: '0 auto 1rem',
                background: `linear-gradient(135deg, ${c.color}, ${c.color}dd)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem',
                boxShadow: `0 6px 20px ${c.color}33`
              }}>{c.icon}</div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#02343F', marginBottom: '0.3rem' }}>{c.title}</h3>
              <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0A6C7A', marginBottom: '0.2rem' }}>{c.value}</p>
              <p style={{ fontSize: '0.8rem', color: '#999' }}>{c.sub}</p>
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div style={{
          width: '100%', maxWidth: '52rem',
          animation: visible ? 'fadeUp 0.7s ease 0.3s both' : 'none'
        }}>
          <div style={{
            background: 'linear-gradient(135deg,#02343F 0%,#0A6C7A 50%,#065A68 100%)',
            borderRadius: '1.5rem', padding: '2.5rem 2rem', position: 'relative', overflow: 'hidden'
          }}>
            {/* Decorative circles */}
            <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px',
              borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', width: '80px', height: '80px',
              borderRadius: '50%', background: 'rgba(240,237,204,0.05)', pointerEvents: 'none' }} />

            <h2 style={{
              fontSize: '1.5rem', fontWeight: 700, color: '#fff', textAlign: 'center', marginBottom: '0.4rem'
            }}>Send Us a Message</h2>
            <p style={{ color: 'rgba(240,237,204,0.7)', textAlign: 'center', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
              We'll get back to you as soon as possible
            </p>

            {sent ? (
              <div style={{ textAlign: 'center', padding: '2rem', animation: 'successPop 0.5s ease forwards' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>🎉</div>
                <h3 style={{ color: '#F0EDCC', fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>Message Sent!</h3>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem' }}>Thank you! We'll reply within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                {/* Name & Email row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div style={{ animation: visible ? 'slideLeft 0.5s ease 0.4s both' : 'none' }}>
                    <label style={labelStyle}>Your Name</label>
                    <input
                      className="contact-input" type="text" name="name"
                      placeholder="Enter your name"
                      value={formData.name} onChange={handleChange} required
                      style={inputStyle}
                    />
                  </div>
                  <div style={{ animation: visible ? 'slideRight 0.5s ease 0.5s both' : 'none' }}>
                    <label style={labelStyle}>Email Address</label>
                    <input
                      className="contact-input" type="email" name="email"
                      placeholder="Enter your email"
                      value={formData.email} onChange={handleChange} required
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Subject */}
                <div style={{ animation: visible ? 'slideLeft 0.5s ease 0.6s both' : 'none' }}>
                  <label style={labelStyle}>Subject</label>
                  <input
                    className="contact-input" type="text" name="subject"
                    placeholder="What is this about?"
                    value={formData.subject} onChange={handleChange} required
                    style={inputStyle}
                  />
                </div>

                {/* Message */}
                <div style={{ animation: visible ? 'slideRight 0.5s ease 0.7s both' : 'none' }}>
                  <label style={labelStyle}>Your Message</label>
                  <textarea
                    className="contact-input" name="message" rows={5}
                    placeholder="Write your message here..."
                    value={formData.message} onChange={handleChange} required
                    style={{ ...inputStyle, resize: 'vertical', minHeight: '120px' }}
                  />
                </div>

                <button className="send-btn" type="submit" style={{
                  padding: '0.9rem 2.5rem', background: 'linear-gradient(135deg,#F0EDCC,#e8e4b8)',
                  color: '#02343F', fontWeight: 700, fontSize: '1.05rem', border: 'none', borderRadius: '50px',
                  cursor: 'pointer', transition: 'all 0.3s ease', alignSelf: 'center',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.15)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  animation: visible ? 'fadeUp 0.5s ease 0.8s both' : 'none'
                }}>
                  Send Message <span style={{ fontSize: '1.2rem' }}>→</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default ContactPage
