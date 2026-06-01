'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getUser } from '@/lib/auth';
import { useAuth } from '@/lib/useAuth';
import Navbar from '@/components/Navbar';

export default function HomePage() {
  useAuth();
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-emerald-950 flex flex-col items-center justify-center px-4">
        <div className="text-center mb-12">
          <div className="text-7xl mb-6">🏔️</div>
          <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">
            מסלול טיולים אפקה
          </h1>
          <p className="text-4xl font-light text-emerald-400 mb-6">2026</p>
          {user && (
            <p className="text-gray-400 text-lg">
              שלום, <span className="text-emerald-400 font-semibold">{user.fullName}</span> 👋
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md">
          <Link href="/plan"
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-5 px-6 rounded-2xl text-center transition-colors text-lg flex flex-col items-center gap-2">
            <span className="text-4xl">🗺️</span>
            תכנון מסלול
          </Link>
          <Link href="/history"
            className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white font-semibold py-5 px-6 rounded-2xl text-center transition-colors text-lg flex flex-col items-center gap-2">
            <span className="text-4xl">📋</span>
            היסטוריה
          </Link>
        </div>
      </main>
    </>
  );
}