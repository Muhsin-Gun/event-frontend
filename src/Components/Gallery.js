// src/Components/Gallery.js
import React, { useEffect, useRef, useState } from 'react';
import '../styles/home.css';

// Update this list: Audi R8 stays, the rest are placeholders you can replace
const GALLERY = [
  encodeURI('/WhatsApp Image 2025-09-15 at 20.52.09_bcedf6d1.jpg'), 
    encodeURI('/WhatsApp Image 2025-09-15 at 23.25.07_5f65ca92.jpg'), 
      encodeURI('/WhatsApp Image 2025-09-15 at 23.25.07_81dc02ba.jpg'), 
        encodeURI('/WhatsApp Image 2025-09-15 at 23.25.07_06144614.jpg'), 
          encodeURI('/WhatsApp Image 2025-09-15 at 23.25.08_eff8d781.jpg')
          
];

export default function Gallery() {
  const scrollerRef = useRef(null);
  const rafRef = useRef(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let pos = 0;
    const speed = 0.5;
    function step() {
      if (!el) return;
      if (!paused) {
        pos += speed;
        if (pos >= el.scrollWidth / 2) pos = 0;
        el.scrollLeft = pos;
      }
      rafRef.current = requestAnimationFrame(step);
    }
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [paused]);

  return (
    <section id="gallery" className="section" aria-label="Gallery">
      <div className="container">
        <h2>Scenes from past meets</h2>
        <p className="sub">
          Rolling shots, paddock vibes & fans’ moments — curated supercars and aura-styled visuals.
        </p>
      </div>

      <div
        ref={scrollerRef}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className="gallery"
        aria-hidden={false}
      >
        {GALLERY.concat(GALLERY).map((src, i) => (
          <div key={i} className="img-wrap">
            <img
              src={src}
              alt={`RevMeet car ${i + 1}`}
              loading="lazy"
              draggable={false}
              onError={(e) => {
                e.currentTarget.style.opacity = 0.2;
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

