'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { logout } from '@/lib/auth';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout(); // clears localStorage
    router.push('/');
  };

  const isActive = (path) => pathname === path || pathname.startsWith(path + '/');

  return (
  <nav className="bg-gray-900/80 backdrop-blur border-b border-gray-800 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 font-bold text-white">
          <span className="text-xl">🏔️</span>
          <span>מסלול אפקה טיולים 2026</span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/home"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/home')
                ? 'bg-blue-900/60 text-blue-300'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            בית 🏠
          </Link>
          <Link
            href="/plan"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/plan')
                ? 'bg-emerald-900/60 text-emerald-300'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            🗺️ תכנון
          </Link>
          <Link
            href="/history"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/history')
                ? 'bg-blue-900/60 text-blue-300'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            📋 היסטוריה
          </Link>
          <button
            onClick={handleLogout}
            className="mr-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors"
          >
            יציאה
          </button>
        </div>
      </div>
    </nav>
  );
}
