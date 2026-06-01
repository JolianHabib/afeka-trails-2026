'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { register, saveTokens, scheduleSilentRefresh } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await register(form.firstName, form.lastName, form.email, form.password);
      saveTokens(data.accessToken, data.refreshToken, data.user);
      scheduleSilentRefresh();
      router.push('/home');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🏔️</div>
          <h1 className="text-3xl font-bold text-white">הרשמה</h1>
          <p className="text-gray-400 mt-2">צור חשבון חדש</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 space-y-5">
          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-300 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">שם פרטי</label>
              <input
                type="text"
                value={form.firstName}
                onChange={e => setForm({ ...form, firstName: e.target.value })}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">שם משפחה</label>
              <input
                type="text"
                value={form.lastName}
                onChange={e => setForm({ ...form, lastName: e.target.value })}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">אימייל</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">סיסמה</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {loading ? 'נרשם...' : 'צור חשבון'}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-4 text-sm">
          יש לך חשבון?{' '}
          <Link href="/auth/login" className="text-emerald-400 hover:text-emerald-300">
            התחברות
          </Link>
        </p>
      </div>
    </main>
  );
}
