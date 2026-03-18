import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/server/db/client';

const COLLECTION = 'website_leads';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      fullName,
      mobileNumber,
      email,
      destination,
      travelCount,
      travelDate,
      location,
      adults,
      kids,
      itemName,
      itemType,
      itemPrice,
      preferredTravelDate,
      numberOfTravelers,
      budget,
      departureCity,
      selectedDurationOptions,
      message,
    } = body;

    const isSimpleLead = itemType === 'tour-package' || itemType === 'destination-overview';

    // Validation: for tour-package only name, email, contact are required
    const errors: Record<string, string> = {};

    if (!fullName || fullName.trim().length === 0) {
      errors.fullName = 'Full name is required';
    }

    if (!mobileNumber || mobileNumber.trim().length === 0) {
      errors.mobileNumber = 'Contact number is required';
    }

    if (isSimpleLead) {
      if (!email || email.trim().length === 0) {
        errors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        errors.email = 'Please enter a valid email';
      }
    }

    if (!isSimpleLead) {
      if (!destination || destination.trim().length === 0) {
        errors.destination = 'Destination is required';
      }

      // Calculate travelCount from adults + kids if provided, otherwise use travelCount
      const finalTravelCount = (adults && kids !== undefined)
        ? (Number(adults) + Number(kids))
        : (travelCount ? Number(travelCount) : 1);

      if (!finalTravelCount || finalTravelCount < 1) {
        errors.travelCount = 'Travel count must be at least 1';
      }

      if (!travelDate || travelDate.trim().length === 0) {
        errors.travelDate = 'Travel date is required';
      }
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const finalTravelCount = (adults && kids !== undefined)
      ? (Number(adults) + Number(kids))
      : (travelCount ? Number(travelCount) : numberOfTravelers ? Number(numberOfTravelers) : 1);

    // Insert lead
    const db = await getDb();
    const result = await db.collection(COLLECTION).insertOne({
      fullName: fullName.trim(),
      mobileNumber: mobileNumber.trim(),
      email: email && email.trim().length > 0 ? email.trim() : undefined,
      destination: destination && destination.trim().length > 0 ? destination.trim() : undefined,
      travelCount: finalTravelCount >= 1 ? finalTravelCount : undefined,
      travelDate: travelDate ? new Date(travelDate) : (preferredTravelDate ? new Date(preferredTravelDate) : undefined),
      preferredTravelDate: preferredTravelDate || undefined,
      numberOfTravelers: numberOfTravelers ? Number(numberOfTravelers) : undefined,
      budget: budget && String(budget).trim().length > 0 ? String(budget).trim() : undefined,
      departureCity: departureCity && departureCity.trim().length > 0 ? departureCity.trim() : undefined,
      location: location && location.trim().length > 0 ? location.trim() : undefined,
      adults: adults ? Number(adults) : undefined,
      kids: kids !== undefined ? Number(kids) : undefined,
      itemName: itemName || undefined,
      itemType: itemType || undefined,
      itemPrice: itemPrice || undefined,
      selectedDurationOptions: Array.isArray(selectedDurationOptions) && selectedDurationOptions.length > 0
        ? selectedDurationOptions.filter((s: any) => typeof s === 'string' && s.trim())
        : undefined,
      message: message && message.trim().length > 0 ? message.trim() : undefined,
      createdAt: new Date(),
      status: 'new',
    });

    return NextResponse.json({
      success: true,
      id: result.insertedId.toString(),
      message: 'Lead submitted successfully',
    });
  } catch (error) {
    console.error('[api/leads] error', error);
    return NextResponse.json(
      { error: 'Failed to submit lead' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const searchParams = request.nextUrl.searchParams;
    const destinationFilter = searchParams.get('destination');
    const dateFilter = searchParams.get('date');
    const statusFilter = searchParams.get('status');

    const query: any = {};

    if (destinationFilter) {
      query.destination = { $regex: destinationFilter, $options: 'i' };
    }

    if (dateFilter) {
      const startDate = new Date(dateFilter);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(dateFilter);
      endDate.setHours(23, 59, 59, 999);
      query.travelDate = { $gte: startDate, $lte: endDate };
    }

    if (statusFilter) {
      query.status = statusFilter;
    }

    const leads = await db.collection(COLLECTION)
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    const mapped = leads.map((lead: any) => ({
      id: lead._id?.toString() || lead.id || '',
      fullName: lead.fullName || '',
      mobileNumber: lead.mobileNumber || '',
      email: lead.email || '',
      destination: lead.destination || '',
      travelCount: lead.travelCount || 0,
      travelDate: lead.travelDate ? lead.travelDate.toISOString().split('T')[0] : '',
      createdAt: lead.createdAt ? lead.createdAt.toISOString() : '',
      status: lead.status || 'new',
      itemName: lead.itemName || '',
      itemType: lead.itemType || '',
      selectedDurationOptions: lead.selectedDurationOptions || [],
    }));

    return NextResponse.json({ success: true, data: mapped });
  } catch (error) {
    console.error('[api/leads] error', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

