import React, { ReactNode } from 'react';
import Logo from './Logo';

interface HeaderProps {
  children?: ReactNode;
}

export default function Header({ children }: HeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 pb-4 border-b border-slate-700/50">
      <Logo />
      
      {children && (
        <div className="flex space-x-4">
          {children}
        </div>
      )}
    </div>
  );
} 