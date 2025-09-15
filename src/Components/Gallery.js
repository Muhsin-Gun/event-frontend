// src/Components/Gallery.js
import React, { useEffect, useRef, useState } from 'react';
import '../styles/home.css';

const GALLERY = [
  encodeURI('/WhatsApp Image 2025-09-15 at 20.52.09_bcedf6d1.jpg'),
  encodeURI('/WhatsApp Image 2025-09-15 at 20.50.48_eb3a097a.jpg'),
  encodeURI('/WhatsApp Image 2025-09-15 at 20.44.30_f4434a17.jpg'),
  encodeURI('/WhatsApp Image 2025-09-15 at 20.54.22_6ea3691a.jpg'),
  encodeURI('/WhatsApp Image 2025-09-15 at 20.55.57_8e916857.jpg'),
  encodeURI('/WhatsApp Image 2025-09-15 at 20.56.43_0d976f1f.jpg'),
  encodeURI('/WhatsApp Image 2025-09-15 at 20.57.30_df66c655.jpg')
];

export default function Gallery() {
  const scrollerRef = useRef(null);
  const rafRef = useRef(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    let pos = 0;
    const speed = 0.5; // px per frame

    function step() {
      if (!el) return;

      if (!paused) {
        pos += speed;
        // loop if we've scrolled half full (we render two copies)
        if (pos >= el.scrollWidth / 2) {
          pos = 0;
        }
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
        <p className="sub">Rolling shots, paddock vibes & fans’ moments — curated supercars and aura-styled visuals.</p>
      </div>

      <div
        ref={scrollerRef}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className="gallery"
        aria-hidden={false}
      >
        {GALLERY.concat(GALLERY).map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`RevMeet car ${ (i % GALLERY.length) + 1 }`}
            loading="lazy"
            draggable={false}
            onError={(e) => { e.currentTarget.style.opacity = 0.04; e.currentTarget.title = 'Image not found'; }}
          />
        ))}
      </div>
    </section>
  );
}
