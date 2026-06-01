'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken } from '@/lib/auth';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (getAccessToken()) {
      router.replace('/plan');
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-emerald-950 flex flex-col items-center justify-center px-4">
      <div className="text-center mb-12">
        <div className="text-7xl mb-6">🏔️</div>
        <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">
          מסלול טיולים אפקה
        </h1>
        <p className="text-4xl font-light text-emerald-400 mb-6">2026</p>
        <p className="text-gray-400 text-lg max-w-lg mx-auto leading-relaxed">
          תכנן מסלולי טיול מושלמים עם בינה מלאכותית —
          מפות אינטראקטיביות, תחזיות מזג אוויר, ומסלולים ריאליים בכל העולם
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-12 max-w-2xl w-full">
        {[
          { icon: '🗺️', text: 'מפות אינטראקטיביות' },
          { icon: '🤖', text: 'תכנון חכם עם AI' },
          { icon: '🌤️', text: 'תחזית מזג אוויר' },
        ].map((f, i) => (
          <div key={i} className="bg-gray-800/40 border border-gray-700 rounded-xl p-4 text-center">
            <div className="text-3xl mb-2">{f.icon}</div>
            <p className="text-gray-300 text-sm">{f.text}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        <Link href="/auth/register"
          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-6 rounded-xl text-center transition-colors text-lg">
          הרשמה
        </Link>
        <Link href="/auth/login"
          className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white font-semibold py-3 px-6 rounded-xl text-center transition-colors text-lg">
          התחברות
        </Link>
      </div>
    </main>
  );
}