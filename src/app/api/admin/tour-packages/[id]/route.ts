import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/server/db/client';

const COLLECTION = 'tour_packages';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDb();
    const ObjectId = require('mongodb').ObjectId;

    let pkg: any = null;
    if (ObjectId.isValid(id)) {
      pkg = await db.collection(COLLECTION).findOne({ _id: new ObjectId(id) });
    }
    if (!pkg) {
      const all = await db.collection(COLLECTION).find({}).toArray();
      pkg = all.find((t: any) => (t._id?.toString() || t.id || '') === id);
    }
    if (!pkg) {
      return NextResponse.json({ error: 'Tour package not found' }, { status: 404 });
    }

    const mapped = {
      ...pkg,
      id: pkg._id?.toString() || pkg.id || '',
    };
    return NextResponse.json({ data: mapped });
  } catch (error) {
    console.error('[api/admin/tour-packages/[id]] GET error', error);
    return NextResponse.json({ error: 'Failed to load tour package' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      name,
      destinationSlug,
      coverImage,
      carouselImages = [],
      summary,
      packagePrice,
      currency,
      numberOfDays,
      numberOfNights,
      durationOptions = [],
      inclusions = [],
      exclusions = [],
      tripHighlights = [],
      detailedItinerary,
      countrySpecificGuidelines,
      dmcDetails,
      formType,
    } = body;

    if (!name?.trim() || !destinationSlug?.trim() || !coverImage?.trim()) {
      return NextResponse.json({ error: 'Missing required fields: name, destinationSlug, coverImage' }, { status: 400 });
    }

    const db = await getDb();
    const ObjectId = require('mongodb').ObjectId;
    let query: any = {};
    if (ObjectId.isValid(id)) {
      query._id = new ObjectId(id);
    } else {
      const all = await db.collection(COLLECTION).find({}).toArray();
      const found = all.find((t: any) => (t._id?.toString() || t.id || '') === id);
      if (!found) return NextResponse.json({ error: 'Tour package not found' }, { status: 404 });
      query._id = found._id;
    }

    const result = await db.collection(COLLECTION).updateOne(query, {
      $set: {
        name: name.trim(),
        destinationSlug: destinationSlug.trim().toLowerCase(),
        coverImage: coverImage.trim(),
        carouselImages: Array.isArray(carouselImages) ? carouselImages.filter((img: any) => img?.url?.trim()) : [],
        summary: summary?.trim() || '',
        packagePrice: Number(packagePrice) || 0,
        currency: (currency || 'INR').toString().toUpperCase(),
        numberOfDays: Number(numberOfDays) ?? 0,
        numberOfNights: Number(numberOfNights) ?? 0,
        durationOptions: Array.isArray(durationOptions) ? durationOptions.filter((s: string) => s?.trim()) : [],
        inclusions: Array.isArray(inclusions) ? inclusions.filter((s: string) => s?.trim()) : [],
        exclusions: Array.isArray(exclusions) ? exclusions.filter((s: string) => s?.trim()) : [],
        tripHighlights: Array.isArray(tripHighlights) ? tripHighlights.filter((s: string) => s?.trim()) : [],
        detailedItinerary: detailedItinerary?.trim() || '',
        countrySpecificGuidelines: countrySpecificGuidelines?.trim() || '',
        dmcDetails: dmcDetails?.trim() || '',
        formType: formType === 'booking' || formType === 'lead' ? formType : 'enquiry',
        updatedAt: new Date(),
      },
    });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Tour package not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Tour package updated successfully' });
  } catch (error) {
    console.error('[api/admin/tour-packages/[id]] PUT error', error);
    return NextResponse.json({ error: 'Failed to update tour package' }, { status: 500 });
  }
}
