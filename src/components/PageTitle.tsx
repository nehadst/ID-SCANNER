import React from 'react';

interface PageTitleProps {
  title: string;
  description?: string;
  centered?: boolean;
}

export default function PageTitle({ title, description, centered = false }: PageTitleProps) {
  return (
    <div className={`mb-10 ${centered ? 'text-center max-w-3xl mx-auto' : ''}`}>
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{title}</h1>
      {description && (
        <p className="text-lg text-slate-300 max-w-2xl">
          {description}
        </p>
      )}
    </div>
  );
} 