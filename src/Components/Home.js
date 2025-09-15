// src/Components/Home.js
import React, { useRef, useState } from 'react';
import Hero from './Hero';
import Showcase from './Showcase';
import Events from './Events';
import Pricing from './Pricing';
import Sponsors from './Sponsors';
import Gallery from './Gallery';
import FAQ from './FAQ';
import Contact from './Contact';
import SiteFooter from './Footer';
import TicketModal from './TicketModal';
import ScrollTop from './ScrollTop';
import '../styles/home.css';

export default function Home() {
  const [ticketOpen, setTicketOpen] = useState(false);
  const [ticketItem, setTicketItem] = useState(null);

  function openTicket(item) {
    setTicketItem(item || { id: 'revmeet-weekend', model: 'RevMeet Weekend Track Day' });
    setTicketOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <>
      <main>
        <div data-reveal><Hero onGetTickets={() => openTicket(null)} /></div>
        <div data-reveal><Showcase onOpenTicket={openTicket} /></div>
        <div data-reveal><Events onOpenTicket={openTicket} /></div>
        <div data-reveal><Pricing onOpenTicket={openTicket} /></div>
        <div data-reveal><Sponsors /></div>
        <div data-reveal><Gallery /></div>
        <div data-reveal><FAQ /></div>
        <div data-reveal><Contact /></div>
        <SiteFooter />
      </main>

      <ScrollTop />
      <TicketModal open={ticketOpen} onClose={() => setTicketOpen(false)} item={ticketItem} />
    </>
  );
}

