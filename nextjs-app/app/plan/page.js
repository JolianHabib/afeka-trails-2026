'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { authFetch } from '@/lib/auth';
import { useAuth } from '@/lib/useAuth';

export default function PlanPage() {
  useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ location: '', trailType: 'bike', durationDays: 2 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Safety: make sure bike is only 2 or 3 even if something changes in UI
      const safeForm = {
        ...form,
        durationDays: form.trailType === 'bike' ? Math.max(2, Math.min(3, form.durationDays)) : form.durationDays
      };

      const res = await authFetch('/api/trails/generate', {
        method: 'POST',
        body: JSON.stringify(safeForm)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      sessionStorage.setItem('trailResult', JSON.stringify(data));
      router.push('/trail-result');
    } catch (err) {
      setError(err.message || 'שגיאה ביצירת המסלול');
    } finally {
      setLoading(false);
    }
  };

  const isTrek = form.trailType === 'trek';
  const minDays = isTrek ? 1 : 2; // ✅ Only Bike is limited to 2-3
  const maxDays = 3;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 flex items-center justify-center px-4">
        <div className="w-full max-w-xl">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🗺️</div>
            <h1 className="text-3xl font-bold text-white mb-2">תכנון מסלול</h1>
            <p className="text-gray-400">בחר יעד וסוג טיול — ה-AI יתכנן לך מסלול מפורט</p>
          </div>

          <form onSubmit={handleGenerate} className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">📍 יעד — מדינה / עיר / אזור</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors text-lg"
                placeholder="לדוגמה: Amsterdam, Galilee, Swiss Alps"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">סוג טיול</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'bike', icon: '🚴', label: 'אופניים', sub: '30-70 ק"מ סה"כ' },
                  { value: 'trek', icon: '🥾', label: 'טרק רגלי', sub: '5-10 ק"מ למסלול' }
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      const nextType = opt.value;
                      setForm((prev) => ({
                        ...prev,
                        trailType: nextType,
                        // ✅ If switching to bike, ensure it's at least 2
                        durationDays: nextType === 'bike' ? Math.max(prev.durationDays, 2) : prev.durationDays
                      }));
                    }}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      form.trailType === opt.value
                        ? 'border-emerald-500 bg-emerald-900/30 text-white'
                        : 'border-gray-600 bg-gray-900/30 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    <div className="text-2xl mb-1">{opt.icon}</div>
                    <div className="font-semibold text-sm">{opt.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{opt.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {isTrek ? `מספר מסלולים — ${form.durationDays}` : `משך הטיול — ${form.durationDays} ימים`}
              </label>

              <input
                type="range"
                min={minDays}
                max={maxDays}
                value={form.durationDays}
                onChange={(e) => setForm({ ...form, durationDays: parseInt(e.target.value) })}
                className="w-full accent-emerald-500"
              />

              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{isTrek ? 'מסלול 1' : 'יום 2'}</span>
                <span>{isTrek ? '3 מסלולים' : '3 ימים'}</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-700 text-red-300 rounded-xl px-4 py-3 text-sm">
                ❌ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold py-4 rounded-xl transition-colors text-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  ה-AI מתכנן את המסלול שלך...
                </>
              ) : (
                '✨ צור מסלול'
              )}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}