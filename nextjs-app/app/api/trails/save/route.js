import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Trail from '@/lib/models/Trail';

function getUser(request) {
  const userId = request.headers.get('x-user-id');
  const fullName = request.headers.get('x-user-fullname');
  if (!userId) throw new Error('Unauthorized');
  return { userId, fullName };
}

// POST /api/trails/save
export async function POST(request) {
  try {
    const user = getUser(request);
    await dbConnect();

    const { trail, imageUrl } = await request.json();

    const saved = await Trail.create({
      userId: user.userId,
      userFullName: user.fullName,
      location: trail.location,
      trailType: trail.trailType,
      durationDays: trail.durationDays,
      days: trail.days,
      totalDistanceKm: trail.totalDistanceKm,
      generatedDescription: trail.description,
      imageUrl: imageUrl || null,
      approvedByUser: true
    });

    return NextResponse.json({ success: true, trailId: saved._id });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET /api/trails/save
export async function GET(request) {
  try {
    const user = getUser(request);
    await dbConnect();

    const trails = await Trail.find({ userId: user.userId })
      .sort({ savedAt: -1 })
      .lean();

    return NextResponse.json({ trails });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
