import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/server/db/client';

const COLLECTION = 'tour_packages';

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const searchParams = request.nextUrl.searchParams;
    const includeHidden = searchParams.get('includeHidden') === 'true';

    const query: any = {};
    if (!includeHidden) {
      query.isHidden = { $ne: true };
    }

    const packages = await db
      .collection(COLLECTION)
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    const mapped = packages.map((p: any) => ({
      id: p._id?.toString() || p.id || '',
      name: p.name || '',
      destinationSlug: p.destinationSlug || '',
      coverImage: p.coverImage || '',
      packagePrice: p.packagePrice ?? 0,
      currency: p.currency || 'INR',
      numberOfDays: p.numberOfDays ?? 0,
      numberOfNights: p.numberOfNights ?? 0,
      durationOptions: p.durationOptions || [],
      dmcDetails: p.dmcDetails || '',
      isHidden: p.isHidden || false,
      createdAt: p.createdAt || null,
      updatedAt: p.updatedAt || null,
    }));

    return NextResponse.json({ data: mapped });
  } catch (error) {
    console.error('[api/admin/tour-packages] error', error);
    return NextResponse.json({ error: 'Failed to load tour packages' }, { status: 500 });
  }
}
