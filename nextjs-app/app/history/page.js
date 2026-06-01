'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import WeatherWidget from '@/components/WeatherWidget';
import { authFetch } from '@/lib/auth';
import { useAuth } from '@/lib/useAuth';

const TrailMap = dynamic(() => import('@/components/TrailMap'), { ssr: false });

export default function HistoryPage() {
  useAuth();
  const [trails, setTrails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrail, setSelectedTrail] = useState(null);
  const [trailDetail, setTrailDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [filterLocation, setFilterLocation] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDays, setFilterDays] = useState('all');

  useEffect(() => {
    authFetch('/api/trails/save')
      .then(r => r.json())
      .then(data => { setTrails(data.trails || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const loadTrailDetail = async (trail) => {
    setSelectedTrail(trail);
    setTrailDetail(null);
    setLoadingDetail(true);
    try {
      const res = await authFetch(`/api/trails/${trail._id}`);
      const data = await res.json();
      setTrailDetail({ trail: data.trail || trail, weather: data.weather || null });
    } catch (err) {
      setTrailDetail({ trail, weather: null });
    } finally {
      setLoadingDetail(false);
    }
  };

  const filteredTrails = trails.filter(trail => {
    const matchLocation = !filterLocation || trail.location.toLowerCase().includes(filterLocation.toLowerCase());
    const matchType = filterType === 'all' || trail.trailType === filterType;
    const matchDays = filterDays === 'all' || trail.durationDays === parseInt(filterDays);
    return matchLocation && matchType && matchDays;
  });

  const hasFilters = filterLocation || filterType !== 'all' || filterDays !== 'all';

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-2">📋 מסלולים היסטוריה</h1>
        <p className="text-gray-400 mb-6">המסלולים שתכננת ואישרת בעבר — עם תחזית מזג אויר עדכנית</p>

        {/* Filter Bar */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-5 mb-6">
          <h2 className="text-sm font-medium text-gray-400 mb-4">🔍 סינון מסלולים</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">א. מדינה / עיר / אזור</label>
              <input type="text" value={filterLocation}
                onChange={e => { setFilterLocation(e.target.value); setSelectedTrail(null); }}
                placeholder="לדוגמה: Paris, Israel..."
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">ב. סוג טיול</label>
              <div className="flex gap-2">
                {[{ value: 'all', label: 'הכל' }, { value: 'bike', label: '🚴 אופניים' }, { value: 'trek', label: '🥾 טרק' }].map(opt => (
                  <button key={opt.value} type="button"
                    onClick={() => { setFilterType(opt.value); setSelectedTrail(null); }}
                    className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all ${filterType === opt.value ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">ג. משך בימים</label>
              <div className="flex gap-2">
                {[{ value: 'all', label: 'הכל' }, { value: '1', label: '1' }, { value: '2', label: '2' }, { value: '3', label: '3' }].map(opt => (
                  <button key={opt.value} type="button"
                    onClick={() => { setFilterDays(opt.value); setSelectedTrail(null); }}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${filterDays === opt.value ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {hasFilters && (
            <button onClick={() => { setFilterLocation(''); setFilterType('all'); setFilterDays('all'); setSelectedTrail(null); }}
              className="mt-3 text-xs text-gray-500 hover:text-gray-300 transition-colors">
              × נקה סינון
            </button>
          )}
        </div>

        {loading && (
          <div className="text-center py-16 text-gray-500">
            <div className="animate-spin text-4xl mb-4">🌍</div>
            <p>טוען מסלולים...</p>
          </div>
        )}

        {!loading && trails.length === 0 && (
          <div className="text-center py-16 bg-gray-800/30 border border-gray-700 rounded-2xl">
            <div className="text-5xl mb-4">🗺️</div>
            <p className="text-gray-400 text-lg mb-2">אין מסלולים שמורים עדיין</p>
            <a href="/plan" className="text-emerald-400 hover:text-emerald-300 text-sm">לך לתכנן מסלול ראשון ←</a>
          </div>
        )}

        {!loading && trails.length > 0 && filteredTrails.length === 0 && (
          <div className="text-center py-12 bg-gray-800/30 border border-gray-700 rounded-2xl mb-6">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-gray-400">לא נמצאו מסלולים התואמים לסינון</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {filteredTrails.map(trail => (
            <button key={trail._id} onClick={() => loadTrailDetail(trail)}
              className={`text-right p-5 rounded-xl border transition-all ${
                selectedTrail?._id === trail._id ? 'bg-blue-900/30 border-blue-500' : 'bg-gray-800/50 border-gray-700 hover:border-gray-500'
              }`}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
                  {trail.trailType === 'bike' ? '🚴 אופניים' : '🥾 טרק'}
                </span>
                <span className="text-xs text-gray-500">{new Date(trail.savedAt).toLocaleDateString('he-IL')}</span>
              </div>
              <h3 className="text-white font-semibold text-lg">{trail.location}</h3>
              <p className="text-gray-400 text-sm mt-1">{trail.durationDays} ימים • {trail.totalDistanceKm} ק"מ</p>
            </button>
          ))}
        </div>

        {/* Trail Detail */}
        {selectedTrail && (
          <div className="space-y-6">
            {loadingDetail ? (
              <div className="text-center py-8 text-gray-500">
                <div className="animate-spin text-3xl mb-3">🌤️</div>
                <p>שולף תחזית מזג אויר...</p>
              </div>
            ) : trailDetail && trailDetail.trail && (
              <>
                {/* על המסלול */}
                {trailDetail.trail.generatedDescription && (
                  <div className="bg-gray-800/40 border border-gray-700 rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-3">📖 על המסלול</h2>
                    <p className="text-gray-300 leading-relaxed text-base mb-4">{trailDetail.trail.generatedDescription}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-gray-700">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">סוג טיול</p>
                        <p className="text-sm font-semibold text-white">{trailDetail.trail.trailType === 'bike' ? '🚴 אופניים' : '🥾 טרק רגלי'}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">משך</p>
                        <p className="text-sm font-semibold text-white">{trailDetail.trail.durationDays} {trailDetail.trail.trailType === 'trek' ? 'מסלולים' : 'ימים'}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">מרחק כולל</p>
                        <p className="text-sm font-semibold text-white">{trailDetail.trail.totalDistanceKm} ק"מ</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">ממוצע ליום</p>
                        <p className="text-sm font-semibold text-white">{(trailDetail.trail.totalDistanceKm / trailDetail.trail.durationDays).toFixed(1)} ק"מ</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-gray-800/50 border border-blue-800/40 rounded-2xl p-5">
                  <h2 className="text-xl font-semibold text-white mb-4">📍 {trailDetail.trail.location}</h2>
                  <TrailMap
                    key={selectedTrail._id}
                    days={trailDetail.trail.days}
                    trailType={trailDetail.trail.trailType}
                  />
                </div>

                {trailDetail.weather
                  ? <WeatherWidget weather={trailDetail.weather} />
                  : <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4 text-center text-gray-500 text-sm">⚠️ תחזית מזג אויר לא זמינה כרגע</div>
                }

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {trailDetail.trail.days.map((day, idx) => {
                    const colors = ['emerald', 'blue', 'amber'];
                    const c = colors[idx % colors.length];
                    return (
                      <div key={day.day} className={"bg-gray-800/50 border border-" + c + "-800/40 rounded-xl p-5"}>
                        <div className={"text-" + c + "-400 font-bold text-sm mb-2"}>
                          {trailDetail.trail.trailType === 'trek' ? `מסלול ${day.day}` : `יום ${day.day}`}
                        </div>
                        <div className="text-3xl font-bold text-white mb-2">
                          {day.distanceKm} <span className="text-lg text-gray-400">ק"מ</span>
                        </div>
                        <p className="text-gray-300 text-sm mb-3 leading-relaxed">{day.description}</p>

                        {day.highlights?.length > 0 && (
                          <div className="mb-3">
                            {day.highlights.map((h, i) => (
                              <div key={i} className={"text-xs text-" + c + "-300 flex items-center gap-1 mb-1"}>
                                <span>✦</span> {h}
                              </div>
                            ))}
                          </div>
                        )}

                        {day.waypoints?.length > 0 && (
                          <div className={"border-t border-" + c + "-900/40 pt-3 space-y-1.5"}>
                            <p className="text-xs text-gray-500 mb-2">נקודות עצירה:</p>
                            {day.waypoints.map((wp, i) => {
                              const isStart = i === 0;
                              const isEnd = i === day.waypoints.length - 1;
                              const isDupe = isEnd && wp.lat === day.waypoints[0].lat && wp.lng === day.waypoints[0].lng;
                              if (isDupe) return null;
                              return (
                                <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                                  <span className={"w-4 h-4 rounded-full bg-" + c + "-900 text-" + c + "-400 flex items-center justify-center text-xs font-bold flex-shrink-0"}>
                                    {isStart ? '▶' : isEnd ? '⚑' : i + 1}
                                  </span>
                                  {wp.name}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </>
  );
}