'use client';
import { useEffect, useState } from 'react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b'];

async function getRealRoute(waypoints, profile, isLoop) {
  try {
    let wps = [...waypoints];

    // לטרק — וודא שהנקודה האחרונה = ראשונה
    if (isLoop && wps.length > 0) {
      const first = wps[0];
      const last = wps[wps.length - 1];
      if (first.lat !== last.lat || first.lng !== last.lng) {
        wps = [...wps, { lat: first.lat, lng: first.lng }];
      }
    }

    const points = wps.map(wp => `point=${wp.lat},${wp.lng}`).join('&');
    const vehicle = profile === 'bike' ? 'bike' : 'foot';
    const url = `https://graphhopper.com/api/1/route?${points}&vehicle=${vehicle}&locale=he&calc_points=true&points_encoded=false&key=${process.env.NEXT_PUBLIC_GRAPHHOPPER_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.paths?.[0]?.points?.coordinates) return null;
    return data.paths[0].points.coordinates.map(([lng, lat]) => [lat, lng]);
  } catch {
    return null;
  }
}

export default function TrailMap({ days, trailType }) {
  const [MapComponents, setMapComponents] = useState(null);
  const [realRoutes, setRealRoutes] = useState([]);
  const [loadingRoutes, setLoadingRoutes] = useState(true);

  useEffect(() => {
    import('leaflet').then(L => {
      Promise.all([
        import('react-leaflet'),
        import('leaflet/dist/leaflet.css')
      ]).then(([RL]) => {
        setMapComponents({ L: L.default, ...RL });
      });
    });
  }, []);

  useEffect(() => {
    if (!days || days.length === 0) return;
    setLoadingRoutes(true);

    Promise.all(
      days.map(day => {
        let wps = day.waypoints || [];
        // normalize: לטרק — וודא שהנקודה האחרונה = ראשונה
        if (trailType === 'trek' && wps.length > 0) {
          const first = wps[0];
          const last = wps[wps.length - 1];
          if (first.lat !== last.lat || first.lng !== last.lng) {
            wps = [...wps, { lat: first.lat, lng: first.lng }];
          }
        }
        return getRealRoute(wps, trailType, trailType === 'trek');
      })
    ).then(routes => {
      setRealRoutes(routes);
      setLoadingRoutes(false);
    });
  }, [days, trailType]);

  if (!MapComponents || !days || days.length === 0) {
    return (
      <div className="w-full rounded-xl bg-gray-900 flex items-center justify-center" style={{ height: '450px' }}>
        <div className="text-gray-500 text-sm">טוען מפה...</div>
      </div>
    );
  }

  const { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } = MapComponents;
  const allPoints = days.flatMap(d => d.waypoints.map(wp => [wp.lat, wp.lng]));
  const center = allPoints[0] || [31.5, 34.75];

  function FitBounds() {
    const map = useMap();
    useEffect(() => {
      if (allPoints.length > 0) map.fitBounds(allPoints, { padding: [40, 40] });
    }, [map]);
    return null;
  }

  return (
    <div className="relative">
      {loadingRoutes && (
        <div className="absolute top-3 right-3 z-10 bg-gray-900/80 text-gray-300 text-xs px-3 py-1.5 rounded-full">
          ⏳ טוען מסלולים אמיתיים...
        </div>
      )}
      <MapContainer
        key={days.map(d => d.day).join('-')}
        center={center}
        zoom={12}
        style={{ height: '450px', width: '100%', borderRadius: '12px', zIndex: 0 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />
        <FitBounds />

        {days.map((day, idx) => {
          const color = COLORS[idx % COLORS.length];
          const routePoints = realRoutes[idx] || day.waypoints.map(wp => [wp.lat, wp.lng]);

          return (
            <Polyline
              key={`line-${day.day}`}
              positions={routePoints}
              pathOptions={{
                color,
                weight: 4,
                opacity: 0.9,
                dashArray: trailType === 'trek' ? '8, 6' : undefined
              }}
            />
          );
        })}

        {days.map((day, idx) => {
          const color = COLORS[idx % COLORS.length];
          return day.waypoints.map((wp, wIdx) => {
            const isStart = wIdx === 0;
            const isEnd = wIdx === day.waypoints.length - 1;
            if (!isStart && !isEnd) return null;
            // לטרק — אם הנקודה האחרונה = ראשונה, אל תציג marker כפול
            if (trailType === 'trek' && isEnd && isStart) return null;
            if (trailType === 'trek' && isEnd) {
              const first = day.waypoints[0];
              if (wp.lat === first.lat && wp.lng === first.lng) return null;
            }
            return (
              <Marker
                key={`marker-${day.day}-${wIdx}`}
                position={[wp.lat, wp.lng]}
                icon={MapComponents.L.divIcon({
                  html: `<div style="
                    background:${color};color:white;border-radius:50%;
                    width:28px;height:28px;display:flex;align-items:center;
                    justify-content:center;font-size:13px;font-weight:bold;
                    border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4)
                  ">${isStart ? '▶' : '⚑'}</div>`,
                  className: '',
                  iconSize: [28, 28],
                  iconAnchor: [14, 14]
                })}
              >
                <Popup>
                  <div style={{ direction: 'rtl', fontFamily: 'sans-serif' }}>
                    <strong style={{ color }}>{trailType === 'trek' ? `מסלול ${day.day}` : `יום ${day.day}`}</strong><br />
                    <b>{wp.name}</b><br />
                    <small style={{ color: '#666' }}>{day.distanceKm} ק"מ</small>
                  </div>
                </Popup>
              </Marker>
            );
          });
        })}
      </MapContainer>
    </div>
  );
}