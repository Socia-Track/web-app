"use client";

import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

const logos = [
  { name: "ETHEREUM" },
  { name: "SOLANA" },
  { name: "POLYGON" },
  { name: "BASE" },
  { name: "ARBITRUM" },
  { name: "OP" },
  { name: "LINEA" },
  { name: "BITCOIN" },
  { name: "BNB Chain" },
];

export default function DashboardPreview() {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const targetValue = 100;

  useEffect(() => {
    if (inView) {
      let startTime: number | null = null;
      const duration = 2500;
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        const current = Math.min((progress / duration) * targetValue, targetValue);
        setCount(current);
        if (progress < duration) {
          requestAnimationFrame(animate);
        } else {
          setCount(targetValue);
        }
      };
      requestAnimationFrame(animate);
    }
  }, [inView, targetValue]);

  const MarqueeLogos = () => (
    <div className="flex items-center shrink-0">
      {logos.map((logo, index) => (
        <div key={index} className="shrink-0 mx-8 md:mx-10 flex items-center justify-center h-10">
          <span className="text-xl md:text-2xl font-semibold text-muted-foreground transition-colors duration-300 hover:text-foreground whitespace-nowrap">
            {logo.name}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <section className="relative w-screen left-1/2 -translate-x-1/2 bg-[#0A0A0A] overflow-hidden">
      <style>
        {`
          @keyframes marquee {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
          @keyframes gradient-shift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          @keyframes pulse-glow {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.6; }
          }
        `}
      </style>
      <div className="relative py-24 sm:py-32">
        {/* Animated gradient orbs */}
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-[pulse-glow_4s_ease-in-out_infinite]"
          aria-hidden="true"
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] animate-[pulse-glow_6s_ease-in-out_infinite]"
          aria-hidden="true"
        />
        
        <div 
          className="absolute top-[20%] left-0 -translate-x-1/4 text-[20rem] lg:text-[25rem] font-extrabold text-[#1A1A1A] pointer-events-none select-none"
          aria-hidden="true"
        >
          %
        </div>
        <div 
          className="absolute top-1/2 right-0 translate-x-1/3 text-[20rem] lg:text-[25rem] font-extrabold text-[#1A1A1A] pointer-events-none select-none"
          aria-hidden="true"
        >
          35
        </div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-medium max-w-4xl mx-auto mb-16 lg:mb-20 text-white/90" 
              style={{ 
                fontFamily: '"Mona Sans", "Helvetica Neue", Helvetica, Arial, sans-serif',
                textShadow: '0 0 40px rgba(139, 92, 246, 0.15)'
              }}>
            Discover which social media actions actually drive
            <br />
            blockchain transactions with
            <br />
            SociaTrack's attribution engine.
          </h2>

          <div ref={ref} className="mb-24 lg:mb-24">
            <p className="font-extrabold text-white leading-none" 
               style={{ 
                 fontSize: 'clamp(1.5rem, 8vw, 3rem)'
               }}>
              0 → 100 real attributions. Starting now.
            </p>
          </div>

          <h2 className="text-xl md:text-2xl lg:text-3xl font-medium max-w-4xl mx-auto mb-16 lg:mb-20 text-white/90" 
              style={{ 
                fontFamily: '"Mona Sans", "Helvetica Neue", Helvetica, Arial, sans-serif',
                textShadow: '0 0 40px rgba(139, 92, 246, 0.15)'
              }}>
            SociaTrack helps you measure truth on-chain from the first campaign
          </h2>

          <div className="text-center mb-10">
            <span className="text-sm font-medium text-primary border border-primary/30 rounded-full px-4 py-2 bg-primary/10 backdrop-blur-sm hover:bg-primary/20 transition-all duration-300 inline-flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              Designed for NFT marketing analytics.
            </span>
          </div>
        </div>

        <div className="relative flex mask-[linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
          <div className="flex whitespace-nowrap animate-[marquee_40s_linear_infinite]">
            <MarqueeLogos />
            <MarqueeLogos />
          </div>
        </div>
      </div>
    </section>
  );
}