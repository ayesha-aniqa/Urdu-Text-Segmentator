// App.jsx — Uses react-router-dom for page navigation
// Header and Footer stay visible on every page.
// The middle content switches based on the current route.

import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'

import Header from './MyComponents/Header'
import Footer from './MyComponents/Footer'
import LandingPage from './MyComponents/LandingPage'
import SegmentPage from './MyComponents/SegmentPage'
import OutputPage from './MyComponents/OutputPage'
import AboutPage from './MyComponents/AboutPage'
import ContactPage from './MyComponents/ContactPage'
import PrivacyPolicyPage from './MyComponents/PrivacyPolicyPage'
import FAQPage from './MyComponents/FAQPage'
import HistoryPage from './MyComponents/HistoryPage'

function App() {
  // Shared state: segmented result is set in SegmentPage, read in OutputPage
  // Shape: { tokens: string[], tags: string[], segments: string[] } | null
  const [segmentedText, setSegmentedText] = useState(null)

  return (
    <div style={{ minHeight: '100vh', background: '#F0EDCC', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

      {/* ✅ Header — always visible on every page */}
      <Header />

      {/* Main content area — switches based on URL route */}
      <main style={{ width: '100%', paddingTop: '5rem', paddingBottom: '4rem' }}>
        <Routes>
          <Route path="/"        element={<LandingPage />} />
          <Route path="/segment" element={<SegmentPage setSegmentedText={setSegmentedText} />} />
          <Route path="/output"  element={<OutputPage segmentedText={segmentedText} />} />
          <Route path="/about"   element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/faq"     element={<FAQPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </main>

      {/* ✅ Footer — always visible on every page */}
      <Footer />
    </div>
  )
}

export default App