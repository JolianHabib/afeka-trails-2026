import { NextResponse } from 'next/server';

async function getUser(request) {
  const userId = request.headers.get('x-user-id');
  const fullName = request.headers.get('x-user-fullname');
  const email = request.headers.get('x-user-email');

  if (!userId) {
    throw new Error('Unauthorized');
  }

  return { userId, fullName, email };
}

function cleanLLMJson(content) {
  if (!content || typeof content !== 'string') {
    throw new Error('Empty LLM response');
  }

  let text = content.trim();

  // Remove markdown fences if the model returns ```json ... ```
  text = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error('LLM did not return a valid JSON object');
  }

  return text.slice(firstBrace, lastBrace + 1);
}

function normalizeTrailData(parsed, trailType, durationDays) {
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('LLM returned invalid trail data');
  }

  // Normalize — the LLM sometimes returns different object names.
  const loopArray = parsed.trekkingLoops || parsed.loops || parsed.trekking_loops || null;

  const days = parsed.days
    || parsed.routes
    || parsed.route
    || parsed.itinerary
    || (loopArray
      ? loopArray.flatMap((loop, i) => (
          loop.days
            ? loop.days.map((d, j) => ({ ...d, day: i + j + 1 }))
            : [{
                day: i + 1,
                distanceKm: loop.totalDistanceKm || loop.distanceKm,
                description: loop.description,
                highlights: loop.highlights || [],
                waypoints: loop.waypoints || []
              }]
        ))
      : []);

  parsed.days = Array.isArray(days) ? days.slice(0, durationDays) : [];

  if (parsed.days.length === 0) {
    throw new Error('LLM did not return route days');
  }

  // Make sure each day has a safe shape.
  parsed.days = parsed.days.map((day, index) => ({
    day: day.day || index + 1,
    distanceKm: Number(day.distanceKm || day.totalDistanceKm || 0),
    description: day.description || '',
    highlights: Array.isArray(day.highlights) ? day.highlights : [],
    waypoints: Array.isArray(day.waypoints) ? day.waypoints : []
  }));

  if (!parsed.totalDistanceKm) {
    parsed.totalDistanceKm = parsed.days.reduce((sum, day) => sum + (Number(day.distanceKm) || 0), 0);
  }

  if (!parsed.description) {
    parsed.description = parsed.days[0]?.description || 'Generated trail route.';
  }

  // For trekking — make sure every loop ends where it starts.
  if (trailType === 'trek') {
    parsed.days = parsed.days.map((day) => {
      const wps = day.waypoints || [];
      if (wps.length > 0) {
        const first = wps[0];
        const last = wps[wps.length - 1];

        if (first?.lat !== last?.lat || first?.lng !== last?.lng) {
          day.waypoints = [
            ...wps,
            { lat: first.lat, lng: first.lng, name: first.name || 'Start point' }
          ];
        }
      }
      return day;
    });
  }

  return parsed;
}

async function generateTrailWithLLM(location, trailType, durationDays) {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('Missing OPENROUTER_API_KEY');
  }

  const totalMin = 30;
  const totalMax = 70;
  const perDayMin = Math.round(totalMin / durationDays);
  const perDayMax = Math.round(totalMax / durationDays);

  const prompt = trailType === 'bike'
    ? `Generate a ${durationDays}-day cycling route near ${location}.
       Requirements:
       - Exactly ${durationDays} days, no more no less
       - Total route distance must be between ${totalMin}-${totalMax} km for ALL days combined
       - Each day approx ${perDayMin}-${perDayMax} km
       - Route follows real roads/paths, not straight lines
       - Point-to-point between cities/towns
       - At least 4 waypoints per day
       - Waypoints must include real coordinates
       - Respond in valid JSON only, no markdown, no extra text.
       Format:
       {
         "totalDistanceKm": number,
         "description": "2-3 sentence description of the overall route highlights in English",
         "days": [
           {
             "day": 1,
             "distanceKm": number,
             "description": "2-3 sentences about what you will see and experience today",
             "highlights": ["highlight 1", "highlight 2", "highlight 3"],
             "waypoints": [
               {"lat": number, "lng": number, "name": "place name"},
               {"lat": number, "lng": number, "name": "place name"},
               {"lat": number, "lng": number, "name": "place name"},
               {"lat": number, "lng": number, "name": "place name"}
             ]
           }
         ]
       }`
    : `Generate exactly ${durationDays} trekking loop${durationDays > 1 ? 's' : ''} near ${location}.
       Requirements:
       - Exactly ${durationDays} loop${durationDays > 1 ? 's' : ''}, one per day, no more no less
       - Each loop: 5-10 km
       - IMPORTANT: All loops must start from the SAME base point/trailhead
       - Each loop must go in a DIFFERENT direction with different scenery
       - Each loop starts and ends at the EXACT same coordinates, first waypoint = last waypoint
       - Follow real trails/paths
       - Waypoints must include real coordinates
       - Respond in valid JSON only, no markdown, no extra text.
       Format:
       {
         "totalDistanceKm": number,
         "description": "2-3 sentence description of the area and trails in English",
         "days": [
           {
             "day": 1,
             "distanceKm": number,
             "description": "2-3 sentences about what you will see and experience on this loop",
             "highlights": ["highlight 1", "highlight 2", "highlight 3"],
             "waypoints": [
               {"lat": number, "lng": number, "name": "start point"},
               {"lat": number, "lng": number, "name": "place name"},
               {"lat": number, "lng": number, "name": "place name"},
               {"lat": number, "lng": number, "name": "start point"}
             ]
           }
         ]
       }`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://afeka-trails-2026-three.vercel.app',
      'X-Title': 'Afeka Trails 2026'
    },
    body: JSON.stringify({
      model: 'openai/gpt-4o-mini',
      temperature: 0.2,
      max_tokens: 3500,
      messages: [
        {
          role: 'system',
          content: 'You are a route-planning API. Return ONLY one complete valid JSON object. Do not use markdown. Do not add explanations. Do not truncate strings.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    console.error('OpenRouter error:', response.status, errorText);
    throw new Error('LLM request failed');
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  console.log('LLM raw response:', content?.slice(0, 800));

  let parsed;
  try {
    parsed = JSON.parse(cleanLLMJson(content));
  } catch (parseError) {
    console.error('Failed to parse LLM JSON:', parseError);
    console.error('Full LLM response:', content);
    throw new Error('LLM returned invalid JSON. Please try again.');
  }

  return normalizeTrailData(parsed, trailType, durationDays);
}

async function fetchWeather(lat, lng, durationDays) {
  if (!process.env.OPENWEATHER_API_KEY) {
    console.warn('Missing OPENWEATHER_API_KEY, skipping weather');
    return null;
  }

  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric&cnt=56`;
  const res = await fetch(url);

  if (!res.ok) {
    console.warn('OpenWeather request failed:', res.status);
    return null;
  }

  const data = await res.json();

  const realNow = new Date();
  const ilNow = new Date(realNow.toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' }));
  const tomorrowIL = new Date(ilNow);
  tomorrowIL.setDate(tomorrowIL.getDate() + 1);
  tomorrowIL.setHours(0, 0, 0, 0);
  const offsetMs = realNow.getTime() - ilNow.getTime();
  const tomorrowUTC = new Date(tomorrowIL.getTime() + offsetMs);

  const futureList = data.list.filter((entry) => entry.dt * 1000 >= tomorrowUTC.getTime());

  const days = [];
  for (let i = 0; i < durationDays; i++) {
    const entry = futureList[i * 8] || futureList[futureList.length - 1];
    if (!entry) break;

    days.push({
      date: new Date(entry.dt * 1000).toLocaleDateString('he-IL', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
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

  return days;
}

export async function POST(request) {
  try {
    const user = await getUser(request);
    const { location, trailType, durationDays } = await request.json();

    if (!location || !trailType || !durationDays) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const safeDurationDays = Number(durationDays);
    if (!Number.isInteger(safeDurationDays) || safeDurationDays < 1 || safeDurationDays > 3) {
      return NextResponse.json({ error: 'Invalid duration days' }, { status: 400 });
    }

    if (!['bike', 'trek'].includes(trailType)) {
      return NextResponse.json({ error: 'Invalid trail type' }, { status: 400 });
    }

    const trailData = await generateTrailWithLLM(location, trailType, safeDurationDays);

    if (!trailData || !trailData.days || !Array.isArray(trailData.days) || trailData.days.length === 0) {
      return NextResponse.json({ error: 'LLM לא החזיר מסלול תקין, נסה שוב' }, { status: 500 });
    }

    const firstWaypoint = trailData.days[0]?.waypoints?.[0];

    // Forecast is always 3 days on the planning page.
    const weather = firstWaypoint
      ? await fetchWeather(firstWaypoint.lat, firstWaypoint.lng, 3)
      : null;

    return NextResponse.json({
      trail: {
        ...trailData,
        location,
        trailType,
        durationDays: safeDurationDays,
        generatedBy: user.fullName
      },
      weather
    });
  } catch (err) {
    console.error('Generate trail error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
