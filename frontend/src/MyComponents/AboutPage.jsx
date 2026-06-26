// AboutPage.jsx
// Information about the team behind the Urdu Text Segmentor project

function AboutPage() {
  const teamMembers = [
    {
      name: 'Laraib Altaf',
      role: 'Full-Stack Developer',
      desc: 'Focused on building the front-end UI and integrating the segmentation engine with the React application.',
    },
    {
      name: 'Ayesha Aniqa',
      role: 'NLP & Backend Developer',
      desc: 'Worked on the Urdu NLP model, training data preparation, and backend API development.',
    },
  ]

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 10rem)',
      padding: '2rem'
    }}>
      <div style={{
        background: '#fff',
        border: '1px solid #D8D5B0',
        boxShadow: '0 10px 40px rgba(2, 52, 63, 0.08)',
        padding: '3rem 2.5rem',
        borderRadius: '1.5rem',
        width: '100%',
        maxWidth: '56rem',
        textAlign: 'center'
      }}>

        {/* Page Title */}
        <h1 style={{
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          fontWeight: 800,
          marginBottom: '0.5rem',
          backgroundImage: 'linear-gradient(45deg, #02343F, #0A6C7A)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1.2
        }}>
          About Us
        </h1>
        <p style={{
          color: '#666',
          fontSize: '1.1rem',
          marginBottom: '2.5rem',
          lineHeight: 1.7,
          maxWidth: '40rem',
          margin: '0 auto 2.5rem'
        }}>
          We are a team of students passionate about natural language processing
          for the Urdu language. This project is our Final Year Project (FYP)
          aimed at making Urdu text segmentation accessible and accurate.
        </p>

        {/* Mission Card */}
        <div style={{
          background: 'linear-gradient(135deg, #02343F, #0A6C7A)',
          borderRadius: '1rem',
          padding: '2rem',
          marginBottom: '2.5rem',
          color: '#fff',
          textAlign: 'left'
        }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            🎯 Our Mission
          </h2>
          <p style={{ lineHeight: 1.8, fontSize: '1rem', opacity: 0.95 }}>
            Urdu is one of the most widely spoken languages in the world, yet it lacks
            robust digital tools for text processing. Our mission is to bridge this gap
            by providing a reliable, easy-to-use segmentation tool that helps researchers,
            educators, and content creators work more efficiently with Urdu text.
          </p>
        </div>

        {/* Team Cards */}
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: '#02343F',
          marginBottom: '1.5rem'
        }}>
          Meet the Team
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem'
        }}>
          {teamMembers.map((member, index) => (
            <div key={index} style={{
              background: '#F0EDCC',
              border: '1px solid #D8D5B0',
              padding: '2rem 1.5rem',
              borderRadius: '1rem',
              transition: 'all 0.3s ease',
              cursor: 'default'
            }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-5px)'
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(2, 52, 63, 0.12)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {/* Avatar circle */}
              <div style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #02343F, #0A6C7A)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 800,
                margin: '0 auto 1rem',
                boxShadow: '0 4px 15px rgba(2, 52, 63, 0.25)'
              }}>
                {member.name.split(' ').map(w => w[0]).join('')}
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#02343F', marginBottom: '0.25rem' }}>
                {member.name}
              </h3>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0A6C7A', marginBottom: '0.75rem' }}>
                {member.role}
              </p>
              <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: 1.6 }}>
                {member.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Tech Stack */}
        <div style={{
          marginTop: '2.5rem',
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          {['React', 'React Router', 'JavaScript', 'NLP', 'Python'].map((tech, i) => (
            <span key={i} style={{
              padding: '0.4rem 1rem',
              background: 'rgba(10, 108, 122, 0.1)',
              color: '#02343F',
              borderRadius: '50px',
              fontSize: '0.85rem',
              fontWeight: 600,
              border: '1px solid rgba(10, 108, 122, 0.2)'
            }}>
              {tech}
            </span>
          ))}
        </div>

      </div>
    </div>
  )
}

export default AboutPage
