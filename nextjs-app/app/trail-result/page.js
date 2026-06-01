'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import WeatherWidget from '@/components/WeatherWidget';
import { authFetch, getUser } from '@/lib/auth';
import { useAuth } from '@/lib/useAuth';

const TrailMap = dynamic(() => import('@/components/TrailMap'), { ssr: false });

export default function TrailResultPage() {
  useAuth();
  const router = useRouter();
  const [trail, setTrail] = useState(null);
  const [weather, setWeather] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const user = typeof window !== 'undefined' ? getUser() : null;

  useEffect(() => {
    const stored = sessionStorage.getItem('trailResult');
    if (!stored) { router.replace('/plan'); return; }
    const data = JSON.parse(stored);
    setTrail(data.trail);
    setWeather(data.weather);
  }, [router]);

  useEffect(() => {
    if (!trail) return;
    fetch(`https://api.unsplash.com/photos/random?query=${encodeURIComponent(trail.location + ' landscape travel')}&orientation=landscape&client_id=${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}`)
      .then(r => r.json())
      .then(data => setImageUrl(data.urls?.regular || ''))
      .catch(() => setImageUrl(''));
  }, [trail]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await authFetch('/api/trails/save', { method: 'POST', body: JSON.stringify({ trail }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSaved(true);
      sessionStorage.removeItem('trailResult');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!trail) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center text-gray-400">
        <div className="text-4xl mb-4 animate-spin">🌍</div>
        <p>טוען מסלול...</p>
      </div>
    </div>
  );

  const typeLabel = trail.trailType === 'bike' ? '🚴 אופניים' : '🥾 טרק רגלי';
  const typeColor = trail.trailType === 'bike' ? 'emerald' : 'amber';

  return (
    <>
      <Navbar />

      {/* Hero Image */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img
          src={imageUrl || 'https://picsum.photos/1200/500'}
          alt={trail.location}
          className="w-full h-full object-cover"
          onError={e => { e.target.src = 'https://picsum.photos/1200/500'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-transparent" />
        <div className="absolute bottom-0 right-0 p-8">
          <div className="flex items-center gap-3 mb-2">
            <span className={`text-xs bg-${typeColor}-900/80 text-${typeColor}-300 border border-${typeColor}-700 px-3 py-1 rounded-full font-medium`}>
              {typeLabel}
            </span>
            <span className="text-xs bg-gray-800/80 text-gray-300 px-3 py-1 rounded-full">
              {trail.durationDays} {trail.trailType === 'trek' ? 'מסלולים' : 'ימים'}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-1">{trail.location}</h1>
          <p className="text-gray-300 text-lg">{trail.totalDistanceKm} ק"מ סה"כ</p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">

        {/* על המסלול — מורחב */}
        {trail.description && (
          <div className="bg-gray-800/40 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-3">📖 על המסלול</h2>
            <p className="text-gray-300 leading-relaxed text-base mb-4">{trail.description}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-gray-700">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">סוג טיול</p>
                <p className="text-sm font-semibold text-white">{typeLabel}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">משך</p>
                <p className="text-sm font-semibold text-white">{trail.durationDays} {trail.trailType === 'trek' ? 'מסלולים' : 'ימים'}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">מרחק כולל</p>
                <p className="text-sm font-semibold text-white">{trail.totalDistanceKm} ק"מ</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">ממוצע ליום</p>
                <p className="text-sm font-semibold text-white">{(trail.totalDistanceKm / trail.durationDays).toFixed(1)} ק"מ</p>
              </div>
            </div>
          </div>
        )}

        {/* מפה */}
        <div className="bg-gray-800/40 border border-gray-700 rounded-2xl p-5">
          <h2 className="text-lg font-semibold text-white mb-4">🗺️ מפת המסלול</h2>
          <TrailMap days={trail.days} trailType={trail.trailType} />
        </div>

        {/* פירוט ימים — מורחב */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">
            📅 {trail.trailType === 'trek' ? 'פירוט המסלולים' : 'פירוט הימים'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {trail.days.map((day, idx) => {
              const colors = ['emerald', 'blue', 'amber'];
              const c = colors[idx % colors.length];
              return (
                <div key={day.day} className={`bg-gray-800/50 border border-${c}-800/40 rounded-xl p-5`}>
                  <div className={`text-${c}-400 font-bold text-sm mb-2`}>
                    {trail.trailType === 'trek' ? `מסלול ${day.day}` : `יום ${day.day}`}
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">
                    {day.distanceKm} <span className="text-lg text-gray-400">ק"מ</span>
                  </div>
                  <p className="text-gray-300 text-sm mb-3 leading-relaxed">{day.description}</p>

                  {/* Highlights */}
                  {day.highlights?.length > 0 && (
                    <div className="mb-3">
                      {day.highlights.map((h, i) => (
                        <div key={i} className={`text-xs text-${c}-300 flex items-center gap-1 mb-1`}>
                          <span>✦</span> {h}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Waypoints */}
                  <div className={`border-t border-${c}-900/40 pt-3 space-y-1.5`}>
                    <p className="text-xs text-gray-500 mb-2">נקודות עצירה:</p>
                    {day.waypoints?.map((wp, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                        <span className={`w-4 h-4 rounded-full bg-${c}-900 text-${c}-400 flex items-center justify-content:center text-xs font-bold flex-shrink-0 flex items-center justify-center`}>
                          {i === 0 ? '▶' : i === day.waypoints.length - 1 ? '⚑' : i + 1}
                        </span>
                        {wp.name}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* תחזית */}
        {weather && <WeatherWidget weather={weather} />}

        {/* שמירה */}
        <div className="bg-gray-800/40 border border-gray-700 rounded-2xl p-8 text-center">
          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-300 rounded-lg px-4 py-3 text-sm mb-4">
              ❌ {error}
            </div>
          )}
          {saved ? (
            <div className="space-y-3">
              <div className="text-5xl">✅</div>
              <p className="text-emerald-400 font-semibold text-xl">המסלול נשמר בהצלחה!</p>
              <div className="flex gap-3 justify-center mt-4">
                <button onClick={() => router.push('/history')}
                  className="bg-blue-700 hover:bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-medium transition-colors">
                  צפה בהיסטוריה
                </button>
                <button onClick={() => router.push('/plan')}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-xl text-sm font-medium transition-colors">
                  תכנן מסלול חדש
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-gray-300 text-lg">מרוצה מהמסלול? שמור אותו לצפייה עתידית</p>
              <div className="flex gap-3 justify-center">
                <button onClick={handleSave} disabled={saving}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold px-8 py-3 rounded-xl transition-colors text-lg">
                  {saving ? '⏳ שומר...' : '✔️ אשר ושמור מסלול'}
                </button>
                <button onClick={() => router.push('/plan')}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl transition-colors">
                  ← חזור לתכנון
                </button>
              </div>
            </div>
          )}
        </div>

      </main>
    </>
  );
}