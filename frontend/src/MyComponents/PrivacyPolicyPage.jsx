// PrivacyPolicyPage.jsx — Privacy policy with placeholder content

import { useEffect, useState } from 'react'

function PrivacyPolicyPage() {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setVisible(true) }, [])

  const sections = [
    {
      title: '1. Information We Collect',
      content: 'We collect text data that you voluntarily submit for segmentation processing. This includes Urdu text pasted directly or uploaded via .txt and .docx files. We do not collect personal information unless you contact us through the contact form.'
    },
    {
      title: '2. How We Use Your Data',
      content: 'Your text data is processed solely for the purpose of Urdu word segmentation. We do not store, share, or sell your submitted text to any third parties. All processing happens in real-time and data is not retained after your session ends.'
    },
    {
      title: '3. Cookies & Local Storage',
      content: 'Our application may use browser local storage to enhance your experience, such as remembering preferences. We do not use tracking cookies or any third-party analytics services.'
    },
    {
      title: '4. Data Security',
      content: 'We implement industry-standard security measures to protect your data during transmission and processing. However, no method of electronic transmission is 100% secure, and we cannot guarantee absolute security.'
    },
    {
      title: '5. Third-Party Links',
      content: 'Our website may contain links to external sites. We are not responsible for the privacy practices or content of these third-party websites. We encourage you to review their privacy policies.'
    },
    {
      title: '6. Changes to This Policy',
      content: 'We may update this Privacy Policy from time to time. Any changes will be posted on this page with a revised "Last Updated" date. Continued use of the service constitutes acceptance of the updated policy.'
    },
    {
      title: '7. Contact Us',
      content: 'If you have any questions about this Privacy Policy, please contact us at contact@urdusegmentor.com or visit our Contact page.'
    }
  ]

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      minHeight: 'calc(100vh - 10rem)', padding: '2rem'
    }}>
      <div style={{
        background: '#fff', border: '1px solid #D8D5B0',
        boxShadow: '0 10px 40px rgba(2,52,63,0.08)',
        padding: '3rem 2.5rem', borderRadius: '1.5rem',
        width: '100%', maxWidth: '56rem',
        animation: visible ? 'fadeUp 0.6s ease both' : 'none'
      }}>
        <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(30px) } to { opacity:1; transform:translateY(0) } }`}</style>

        <h1 style={{
          fontSize: 'clamp(2rem,4vw,2.8rem)', fontWeight: 800, marginBottom: '0.5rem',
          background: 'linear-gradient(135deg,#02343F,#0A6C7A)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          textAlign: 'center'
        }}>Privacy Policy</h1>

        <p style={{ textAlign: 'center', color: '#888', fontSize: '0.9rem', marginBottom: '2.5rem' }}>
          Last Updated: April 2026
        </p>

        <p style={{ color: '#555', lineHeight: 1.8, fontSize: '1rem', marginBottom: '2rem' }}>
          At Urdu Text Segmentor, we are committed to protecting your privacy. This Privacy Policy
          explains how we collect, use, and safeguard your information when you use our service.
        </p>

        {sections.map((section, i) => (
          <div key={i} style={{
            marginBottom: '1.75rem',
            animation: visible ? `fadeUp 0.5s ease ${0.1 + i * 0.08}s both` : 'none'
          }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#02343F', marginBottom: '0.5rem' }}>
              {section.title}
            </h2>
            <p style={{ color: '#666', lineHeight: 1.8, fontSize: '0.95rem' }}>
              {section.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PrivacyPolicyPage
