import React from 'react';

// RoleCards with professional black theme design
export const ROLE_CARDS = [
  { key: 'admin', label: 'ADMIN', subtitle: 'Manage events, users & reports', to: '/admin', color: '#000000' },
  { key: 'employee', label: 'EMPLOYEE', subtitle: 'Add events & handle sales', to: '/employee', color: '#000000' },
  { key: 'client', label: 'CLIENT', subtitle: 'Browse events & buy tickets', to: '/client', color: '#000000' },
];

export default function RoleCards() {
  function handleAnchorClick(e, to) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1) return;
    e.preventDefault();
    try {
      window.history.pushState({}, '', to);
      window.dispatchEvent(new PopStateEvent('popstate'));
    } catch (err) {
      window.location.href = to;
    }
  }

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)', 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '40px 20px'
    }}>
      <section className="role-cards-section" aria-label="Role selection" style={{ width: '100%', maxWidth: 1200 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h1 style={{ 
            color: '#ffffff', 
            fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
            fontWeight: '900', 
            margin: '0 0 20px 0',
            letterSpacing: '-0.02em'
          }}>
            Event Management System
          </h1>
          <p style={{ 
            color: '#888888', 
            fontSize: 'clamp(1rem, 2vw, 1.3rem)', 
            margin: 0,
            fontWeight: '500'
          }}>
            Choose your role to continue
          </p>
        </div>

        <div className="role-cards-grid" style={{
          display: 'grid',
          gap: 30,
          gridTemplateColumns: 'repeat(2, 1fr)',
          gridAutoRows: 'minmax(200px, auto)',
          maxWidth: 900,
          margin: '0 auto'
        }}>
          {/* Top row: Admin & Employee */}
          <a
            href={ROLE_CARDS[0].to}
            className="role-card role-admin"
            onClick={(e) => handleAnchorClick(e, ROLE_CARDS[0].to)}
            aria-label={`Open ${ROLE_CARDS[0].label} dashboard`}
            style={{
              display: 'block',
              textDecoration: 'none',
              color: 'inherit',
              borderRadius: 20,
              padding: 35,
              minHeight: 220,
              background: 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)',
              border: '2px solid #333333',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 25px 60px rgba(0,0,0,0.8)';
              e.currentTarget.style.borderColor = '#555555';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0px) scale(1)';
              e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.5)';
              e.currentTarget.style.borderColor = '#333333';
            }}
          >
            <div style={{ 
              position: 'absolute', 
              top: 0, 
              right: 0, 
              width: 100, 
              height: 100, 
              background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 70%)',
              borderRadius: '0 20px 0 100%'
            }} />
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              height: '100%',
              position: 'relative',
              zIndex: 1
            }}>
              <div>
                <div style={{ 
                  fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', 
                  fontWeight: '900', 
                  color: '#ffffff',
                  marginBottom: 10
                }}>
                  {ROLE_CARDS[0].label}
                </div>
                <div style={{ 
                  color: '#bbbbbb', 
                  fontWeight: '600', 
                  fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)',
                  lineHeight: 1.3
                }}>
                  {ROLE_CARDS[0].subtitle}
                </div>
              </div>
              <div style={{ 
                fontSize: '1.5rem', 
                fontWeight: '800', 
                color: '#888888',
                transition: 'all 0.3s ease'
              }}>
                →
              </div>
            </div>
          </a>

          <a
            href={ROLE_CARDS[1].to}
            className="role-card role-employee"
            onClick={(e) => handleAnchorClick(e, ROLE_CARDS[1].to)}
            aria-label={`Open ${ROLE_CARDS[1].label} dashboard`}
            style={{
              display: 'block',
              textDecoration: 'none',
              color: 'inherit',
              borderRadius: 20,
              padding: 35,
              minHeight: 220,
              background: 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)',
              border: '2px solid #333333',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 25px 60px rgba(0,0,0,0.8)';
              e.currentTarget.style.borderColor = '#555555';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0px) scale(1)';
              e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.5)';
              e.currentTarget.style.borderColor = '#333333';
            }}
          >
            <div style={{ 
              position: 'absolute', 
              top: 0, 
              right: 0, 
              width: 100, 
              height: 100, 
              background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 70%)',
              borderRadius: '0 20px 0 100%'
            }} />
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              height: '100%',
              position: 'relative',
              zIndex: 1
            }}>
              <div>
                <div style={{ 
                  fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', 
                  fontWeight: '900', 
                  color: '#ffffff',
                  marginBottom: 10
                }}>
                  {ROLE_CARDS[1].label}
                </div>
                <div style={{ 
                  color: '#bbbbbb', 
                  fontWeight: '600', 
                  fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)',
                  lineHeight: 1.3
                }}>
                  {ROLE_CARDS[1].subtitle}
                </div>
              </div>
              <div style={{ 
                fontSize: '1.5rem', 
                fontWeight: '800', 
                color: '#888888',
                transition: 'all 0.3s ease'
              }}>
                →
              </div>
            </div>
          </a>

          {/* Bottom row: Client centered */}
          <a
            href={ROLE_CARDS[2].to}
            className="role-card role-client role-client-centered"
            onClick={(e) => handleAnchorClick(e, ROLE_CARDS[2].to)}
            aria-label={`Open ${ROLE_CARDS[2].label} dashboard`}
            style={{
              display: 'block',
              textDecoration: 'none',
              color: 'inherit',
              borderRadius: 20,
              padding: 35,
              minHeight: 220,
              background: 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)',
              border: '2px solid #333333',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
              gridColumn: '1 / -1',
              justifySelf: 'center',
              width: '70%'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 25px 60px rgba(0,0,0,0.8)';
              e.currentTarget.style.borderColor = '#555555';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0px) scale(1)';
              e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.5)';
              e.currentTarget.style.borderColor = '#333333';
            }}
          >
            <div style={{ 
              position: 'absolute', 
              top: 0, 
              right: 0, 
              width: 100, 
              height: 100, 
              background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 70%)',
              borderRadius: '0 20px 0 100%'
            }} />
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              height: '100%',
              position: 'relative',
              zIndex: 1
            }}>
              <div>
                <div style={{ 
                  fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', 
                  fontWeight: '900', 
                  color: '#ffffff',
                  marginBottom: 10
                }}>
                  {ROLE_CARDS[2].label}
                </div>
                <div style={{ 
                  color: '#bbbbbb', 
                  fontWeight: '600', 
                  fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)',
                  lineHeight: 1.3
                }}>
                  {ROLE_CARDS[2].subtitle}
                </div>
              </div>
              <div style={{ 
                fontSize: '1.5rem', 
                fontWeight: '800', 
                color: '#888888',
                transition: 'all 0.3s ease'
              }}>
                →
              </div>
            </div>
          </a>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 60 }}>
          <p style={{ 
            color: '#666666', 
            fontSize: '0.9rem',
            margin: 0
          }}>
            Secure event management platform with role-based access control
          </p>
        </div>
      </section>

      <style>
        {`
          @media (max-width: 768px) {
            .role-cards-grid {
              grid-template-columns: 1fr !important;
            }
            .role-client-centered {
              width: 100% !important;
            }
          }
          
          @media (prefers-reduced-motion: reduce) {
            .role-card {
              transition: none !important;
            }
          }
          
          .role-card:focus {
            outline: 3px solid rgba(255,255,255,0.3);
            outline-offset: 4px;
          }
        `}
      </style>
    </div>
  );
}