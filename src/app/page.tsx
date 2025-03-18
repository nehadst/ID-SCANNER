"use client";

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  
  useEffect(() => {
    router.push('/scan')
  }, [router])
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-800 to-slate-900">
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
        <p className="mt-4 text-slate-300">Redirecting to ID Scanner...</p>
      </div>
    </div>
  )
}
