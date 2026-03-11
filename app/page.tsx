"use client";

import { useState } from "react";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import Incentives from "@/components/Incentives";
import About from "@/components/About";
import Amenities from "@/components/Amenities";
import Gallery from "@/components/Gallery";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";

export default function Home() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <main className="bg-[#0A0A0A]">
      <Nav onOpenChat={() => setChatOpen(true)} />
      <Hero onOpenChat={() => setChatOpen(true)} />
      <Stats />
      <Incentives onOpenChat={() => setChatOpen(true)} />
      <About />
      <Amenities />
      <Gallery />
      <Footer />
      <Chatbot open={chatOpen} setOpen={setChatOpen} />
    </main>
  );
}
