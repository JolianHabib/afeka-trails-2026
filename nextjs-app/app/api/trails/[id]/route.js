import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Trail from '@/lib/models/Trail';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const trail = await Trail.findById(params.id).lean();
    if (!trail) return NextResponse.json({ error: 'Trail not found' }, { status: 404 });

    let weather = null;
    const firstWaypoint = trail.days?.[0]?.waypoints?.[0];

    if (firstWaypoint && process.env.OPENWEATHER_API_KEY) {
      try {
        // מחר לפי שעון ישראל
        const realNow = new Date();
        const ilNow = new Date(realNow.toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' }));
        const tomorrowIL = new Date(ilNow);
        tomorrowIL.setDate(tomorrowIL.getDate() + 1);
        tomorrowIL.setHours(0, 0, 0, 0);
        const offsetMs = realNow.getTime() - ilNow.getTime();
        const tomorrowUTC = new Date(tomorrowIL.getTime() + offsetMs);

        // לטרק — יום אחד, לאופניים — לפי durationDays
        const durationDays = trail.trailType === 'trek' ? 1 : (trail.durationDays || trail.days?.length || 3);

        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${firstWaypoint.lat}&lon=${firstWaypoint.lng}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric&cnt=56`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Weather fetch failed');
        const data = await res.json();

        const futureList = data.list.filter(entry => entry.dt * 1000 >= tomorrowUTC.getTime());

        weather = [];
        for (let i = 0; i < durationDays; i++) {
          const entry = futureList[i * 8] || futureList[futureList.length - 1];
          if (!entry) break;
          weather.push({
            date: new Date(entry.dt * 1000).toLocaleDateString('he-IL', {
              weekday: 'short', month: 'short', day: 'numeric',
              timeZone: 'Asia/Jerusalem'
            }),
            temp: Math.round(entry.main.temp),
            feels_like: Math.round(entry.main.feels_like),
            description: entry.weather[0].description,
            icon: entry.weather[0].icon,
            humidity: entry.main.humidity,
            wind_speed: Math.round(entry.wind.speed * 3.6)
          });
        }
      } catch (weatherErr) {
        console.error('Weather fetch failed:', weatherErr.message);
      }
    }

    return NextResponse.json({ trail, weather });
  } catch (err) {
    console.error('Trail fetch error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}