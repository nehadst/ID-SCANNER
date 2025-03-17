import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
}

export default function PageContainer({ children }: PageContainerProps) {
  return (
    <main className="container mx-auto px-4 sm:px-6 py-8 md:py-12 animate-fade-in">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>
      
      {/* Content container with glass effect */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-slate-800/70 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-xl p-4 sm:p-6 md:p-8">
          {children}
        </div>
      </div>
    </main>
  );
} 