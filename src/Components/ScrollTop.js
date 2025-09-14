import React, { useEffect, useState } from 'react';
import '../styles/home.css';

export default function ScrollTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 480);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  if (!show) return null;
  return (
    <button
      className="btn"
      style={{
        position: 'fixed',
        right: '18px',
        bottom: '18px',
        zIndex: 60,
        paddingInline: '.9rem',
      }}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      ↑
    </button>
  );
}
