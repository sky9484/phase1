'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercentage = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      setScrolled(scrollPercentage > 0.2);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${scrolled ? 'border-b border-[#326273]/10 bg-[#F6F0ED]/90 backdrop-blur' : 'border-0 bg-transparent'}`}>
      <div className="container mx-auto flex items-center px-6 py-4">
        <Link href="/" className="flex items-center">
          <Image src="/splash-logo.png" alt="SPLASH" width={40} height={40} className="h-10 w-auto drop-shadow-md" unoptimized />
        </Link>
      </div>
    </header>
  );
}
