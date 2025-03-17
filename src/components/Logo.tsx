import React from 'react';
import Link from 'next/link';

interface LogoProps {
  href?: string;
}

export default function Logo({ href = '/' }: LogoProps) {
  const LogoContent = (
    <div className="flex items-center">
      <div className="relative overflow-hidden rounded-xl shadow-lg">
        <span className="bg-blue-600 text-white px-4 py-2 rounded-xl text-2xl font-bold mr-2">ID</span>
      </div>
      <span className="text-white text-2xl font-bold">Scanner</span>
    </div>
  );

  if (href) {
    return (
      <Link href={href}>
        {LogoContent}
      </Link>
    );
  }

  return LogoContent;
} 