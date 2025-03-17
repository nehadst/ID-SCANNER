"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const isActive = (path: string) => pathname === path;
  
  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-slate-900/90 backdrop-blur-lg shadow-lg' 
          : 'bg-transparent'
      } border-b ${scrolled ? 'border-slate-800' : 'border-transparent'}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Logo href="/" />
            <nav className="hidden md:ml-8 md:flex md:space-x-4">
              <Link
                href="/"
                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                  isActive('/')
                    ? 'bg-slate-800/80 text-blue-400 shadow-inner'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/50'
                }`}
              >
                Home
              </Link>
              <Link
                href="/scan"
                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                  isActive('/scan')
                    ? 'bg-slate-800/80 text-blue-400 shadow-inner'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/50'
                }`}
              >
                Scan Document
              </Link>
              <Link
                href="/dashboard"
                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                  isActive('/dashboard')
                    ? 'bg-slate-800/80 text-blue-400 shadow-inner'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/50'
                }`}
              >
                Dashboard
              </Link>
            </nav>
          </div>
          
          <div className="-mr-2 flex items-center md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div 
        className={`md:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen 
            ? 'max-h-64 opacity-100' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="pt-2 pb-3 space-y-1 px-4">
          <Link
            href="/"
            className={`${
              isActive('/')
                ? 'bg-slate-800/80 text-blue-400 shadow-inner'
                : 'text-slate-300 hover:bg-slate-800/50 hover:text-slate-100'
            } block px-4 py-2 rounded-xl text-base font-medium transition-colors`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/scan"
            className={`${
              isActive('/scan')
                ? 'bg-slate-800/80 text-blue-400 shadow-inner'
                : 'text-slate-300 hover:bg-slate-800/50 hover:text-slate-100'
            } block px-4 py-2 rounded-xl text-base font-medium transition-colors`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Scan Document
          </Link>
          <Link
            href="/dashboard"
            className={`${
              isActive('/dashboard')
                ? 'bg-slate-800/80 text-blue-400 shadow-inner'
                : 'text-slate-300 hover:bg-slate-800/50 hover:text-slate-100'
            } block px-4 py-2 rounded-xl text-base font-medium transition-colors`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Dashboard
          </Link>
        </div>
      </div>
    </header>
  );
} 