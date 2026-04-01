import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/server/db/client';

const COLLECTION = 'tour_packages';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      destinationSlug,
      coverImage,
      carouselImages = [],
      summary,
      packagePrice,
      currency = 'INR',
      numberOfDays,
      numberOfNights,
      durationOptions = [],
      inclusions = [],
      exclusions = [],
      tripHighlights = [],
      detailedItinerary,
      countrySpecificGuidelines,
      dmcDetails,
      formType = 'enquiry',
    } = body;

    const errors: Record<string, string> = {};
    if (!name || name.trim().length === 0) errors.name = 'Package name is required';
    if (!destinationSlug || destinationSlug.trim().length === 0) errors.destinationSlug = 'Destination is required';
    if (!coverImage || coverImage.trim().length === 0) errors.coverImage = 'Cover image is required';
    const priceNum = Number(packagePrice);
    if (isNaN(priceNum) || priceNum < 0) errors.packagePrice = 'Package price must be a positive number';
    const days = Number(numberOfDays);
    const nights = Number(numberOfNights);
    if (isNaN(days) || days < 0) errors.numberOfDays = 'Number of days must be 0 or more';
    if (isNaN(nights) || nights < 0) errors.numberOfNights = 'Number of nights must be 0 or more';

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection(COLLECTION).insertOne({
      name: name.trim(),
      destinationSlug: destinationSlug.trim().toLowerCase(),
      coverImage: coverImage.trim(),
      carouselImages: Array.isArray(carouselImages) ? carouselImages.filter((img: any) => img?.url?.trim()) : [],
      summary: summary?.trim() || '',
      packagePrice: priceNum,
      currency: (currency || 'INR').toString().toUpperCase(),
      numberOfDays: days,
      numberOfNights: nights,
      durationOptions: Array.isArray(durationOptions) ? durationOptions.filter((s: string) => s?.trim()) : [],
      inclusions: Array.isArray(inclusions) ? inclusions.filter((s: string) => s?.trim()) : [],
      exclusions: Array.isArray(exclusions) ? exclusions.filter((s: string) => s?.trim()) : [],
      tripHighlights: Array.isArray(tripHighlights) ? tripHighlights.filter((s: string) => s?.trim()) : [],
      detailedItinerary: detailedItinerary?.trim() || '',
      countrySpecificGuidelines: countrySpecificGuidelines?.trim() || '',
      dmcDetails: dmcDetails?.trim() || '',
      formType: formType === 'booking' || formType === 'lead' ? formType : 'enquiry',
      isHidden: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      id: result.insertedId.toString(),
      message: 'Tour package created successfully',
    });
  } catch (error) {
    console.error('[api/tour-packages/create] error', error);
    return NextResponse.json({ error: 'Failed to create tour package' }, { status: 500 });
  }
}
