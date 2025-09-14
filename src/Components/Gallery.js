// src/Components/Gallery.js
import React, { useEffect, useRef } from 'react';
import '../styles/home.css';

const GALLERY = [
  // Audi R8
  'https://images.unsplash.com/photo-1523986371872-9d3ba2e2f642?q=80&w=1400',
  // BMW M5 Competition (black)
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1400',
  // Mercedes AMG (aura-styled / dark)
  'https://images.unsplash.com/photo-1517949908116-2b2a8f1b7a6b?q=80&w=1400',
  // Ferrari
  'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?q=80&w=1400',
  // Pagani
  'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=1400',
  // Lamborghini
  'https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=1400',
  // McLaren
  'https://images.unsplash.com/photo-1549921296-3c0b091d25d3?q=80&w=1400',
  // Porsche
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1400',
  // Aura-farming stylized car (artistic)
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1400',
];

export default function Gallery() {
  const scrollerRef = useRef(null);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let anim;
    let pos = 0;
    const step = () => {
      pos += 0.6; // speed
      el.scrollLeft = pos;
      if (pos >= el.scrollWidth - el.clientWidth) pos = 0;
      anim = requestAnimationFrame(step);
    };
    anim = requestAnimationFrame(step);
    return () => cancelAnimationFrame(anim);
  }, []);

  return (
    <section className="section" aria-label="Gallery">
      <div className="container">
        <h2>Scenes from past meets</h2>
        <p className="sub">Rolling shots, paddock vibes & fans’ moments — curated supercars and Aura Farming visuals.</p>
      </div>

      <div
        ref={scrollerRef}
        style={{
          display: 'flex',
          overflowX: 'auto',
          gap: '12px',
          padding: '12px 4vw 20px',
          scrollBehavior: 'smooth',
          maskImage: 'linear-gradient(90deg, transparent 0, black 6%, black 94%, transparent 100%)',
        }}
      >
        {GALLERY.concat(GALLERY).map((src, i) => (
          <img
            key={i}
            src={src}
            alt="RevMeet car gallery"
            loading="lazy"
            style={{
              height: 'auto',
              width: '420px',           // width-first layout so gallery is wide and not very tall
              borderRadius: '12px',
              objectFit: 'cover',
              flex: '0 0 auto',
              border: '1px solid rgba(255,255,255,.06)',
              boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
            }}
          />
        ))}
      </div>
    </section>
  );
}
