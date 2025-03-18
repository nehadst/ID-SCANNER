'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  
  // Check if the current path matches the link
  const isActive = (path: string) => {
    return pathname === path;
  };
  
  return (
    <nav className="bg-slate-900 border-b border-slate-800 fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-blue-400 font-bold text-xl">
                ID Scanner
              </Link>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              <Link 
                href="/scan" 
                className={`${
                  isActive('/scan') 
                    ? 'bg-slate-800 text-white' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                } px-3 py-2 rounded-md text-sm font-medium transition-colors`}
              >
                Scan ID
              </Link>
              <Link 
                href="/dashboard" 
                className={`${
                  isActive('/dashboard') 
                    ? 'bg-slate-800 text-white' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                } px-3 py-2 rounded-md text-sm font-medium transition-colors`}
              >
                Dashboard
              </Link>
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon for menu - shows when menu is closed */}
              <svg 
                className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              {/* Icon for X - shows when menu is open */}
              <svg 
                className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link 
            href="/scan" 
            className={`${
              isActive('/scan') 
                ? 'bg-slate-800 text-white' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            } block px-3 py-2 rounded-md text-base font-medium`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Scan ID
          </Link>
          <Link 
            href="/dashboard" 
            className={`${
              isActive('/dashboard') 
                ? 'bg-slate-800 text-white' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            } block px-3 py-2 rounded-md text-base font-medium`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
} 