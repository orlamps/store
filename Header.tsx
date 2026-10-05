'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useCart } from './CartContext';

export default function Header() {
  const pathname = usePathname();
  const { items, setIsCartOpen } = useCart();
  const totalItems = items.reduce((sum, item) => sum + item.cantidad, 0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const links = [
    { name: 'Inicio', path: '/' },
    { name: 'Tienda', path: '/tienda' },
    { name: 'Sobre Nosotros', path: '/quienes-somos' },
    { name: 'Contacto', path: '/contacto' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] px-4 py-4 md:px-6 pointer-events-none">
      <div className="max-w-[1200px] mx-auto bg-[#262626e6] backdrop-blur-md px-5 py-3 md:px-8 md:py-3 rounded-[100px] border border-white/10 flex items-center justify-between pointer-events-auto relative">
        
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <Image 
            src="/logo.png" 
            alt="OrLamps" 
            width={140} 
            height={40} 
            className="h-7 md:h-8 w-auto brightness-0 invert"
            priority
          />
        </Link>

        {/* Desktop Nav — centrado absolutamente */}
        <nav className="hidden md:flex gap-8 items-center absolute left-1/2 -translate-x-1/2">
          {links.map(link => (
            <Link 
              key={link.path} 
              href={link.path}
              className="text-[#EAEAEA] no-underline text-[0.9rem] font-semibold transition-colors duration-200 hover:text-[#9B6F2F]"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Actions (Cart & Mobile Toggle) */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsCartOpen(true)}
            aria-label="Ver carrito" 
            className="relative bg-transparent border-none cursor-pointer text-[#EAEAEA] flex items-center transition-colors duration-200 hover:text-[#9B6F2F]"
          >
            <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2.5 bg-[#9B6F2F] text-white text-[0.65rem] font-extrabold w-4 h-4 flex items-center justify-center rounded-full">
                {totalItems}
              </span>
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden flex items-center text-[#EAEAEA] hover:text-[#9B6F2F] transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-[70px] left-4 right-4 bg-[#262626f2] backdrop-blur-md rounded-2xl border border-white/10 p-4 flex flex-col gap-4 pointer-events-auto shadow-2xl">
          {links.map(link => (
            <Link 
              key={link.path} 
              href={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-[#EAEAEA] text-lg font-semibold py-2 px-4 hover:bg-white/5 rounded-lg transition-colors text-center"
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
