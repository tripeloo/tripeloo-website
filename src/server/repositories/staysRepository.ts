import { getDb } from '@/server/db/client';
import type { Stay } from '@/components/stay-listings/DestinationData';
import { getStaySlugVariants } from '@/config/destination-stay-slugs';

const COLLECTION = 'stays';

export async function findStaysByDestination(destinationSlugOrName: string): Promise<Stay[]> {
  const db = await getDb();
  const slugVariants = getStaySlugVariants(destinationSlugOrName);

  const rows = await db.collection<any>(COLLECTION)
    .find({
      $and: [
        {
          destinationSlug: {
            $in: slugVariants.map((slug) => new RegExp(`^${slug}$`, 'i')),
          },
        },
        { isHidden: { $ne: true } },
      ],
    })
    .toArray();
  
  return rows.map((r) => ({
    id: r._id?.toString() || r.id || '',
    name: r.name || '',
    propertyName: r.propertyName || '',
    coverImage: r.coverImage || r.image || '',
    startingPrice: r.startingPrice || r.price || 0,
    highlights: r.highlights || [],
    category: r.category || 'General', // Map category from DB or default
  }));
}

export async function findStayById(stayId: string, includeHidden: boolean = false): Promise<any | null> {
  const db = await getDb();
  
  try {
    const ObjectId = require('mongodb').ObjectId;
    
    const cleanStayId = stayId?.trim();
    
    let stay = null;
    
    if (cleanStayId && ObjectId.isValid(cleanStayId)) {
      try {
        const objectId = new ObjectId(cleanStayId);
        const query: any = { _id: objectId };
        if (!includeHidden) {
          query.isHidden = { $ne: true };
        }
        stay = await db.collection(COLLECTION).findOne(query);
        if (stay) {
          return mapStayData(stay);
        }
      } catch (err) {
        // ObjectId query failed, try next strategy
      }
    }
    
    if (!stay) {
      const query: any = {};
      if (!includeHidden) {
        query.isHidden = { $ne: true };
      }
      const allStays = await db.collection(COLLECTION).find(query).toArray();
      
      stay = allStays.find((s: any) => {
        const idStr = s._id?.toString() || s.id || '';
        return idStr === cleanStayId || idStr === stayId;
      });
      
      if (stay) {
        return mapStayData(stay);
      }
    }
    
    if (!stay) {
      const query: any = { id: cleanStayId };
      if (!includeHidden) {
        query.isHidden = { $ne: true };
      }
      stay = await db.collection(COLLECTION).findOne(query);
      if (stay) {
        return mapStayData(stay);
      }
    }
    
    return null;
  } catch (error) {
    console.error('[findStayById] Error:', error);
    return null;
  }
}

function mapStayData(stay: any): any {
  return {
    id: stay._id?.toString() || stay.id || '',
    name: stay.name || '',
    propertyName: stay.propertyName || '',
    destinationSlug: stay.destinationSlug || '',
    category: stay.category || '',
    coverImage: stay.coverImage || '',
    carouselImages: stay.carouselImages || [],
    startingPrice: stay.startingPrice || 0,
    originalPrice: stay.originalPrice || null,
    currency: stay.currency || 'INR',
    summary: stay.summary || '',
    includes: stay.includes || [],
    excludes: stay.excludes || [],
    properties: stay.properties || [],
    importantInfo: stay.importantInfo || null,
    rooms: stay.rooms || [],
    location: stay.location || '',
    additionalDetails: stay.additionalDetails || [],
    nearbyActivities: Array.isArray(stay.nearbyActivities)
      ? stay.nearbyActivities.map((id: any) => id?.toString?.() || String(id))
      : [],
    nearbyTrips: Array.isArray(stay.nearbyTrips)
      ? stay.nearbyTrips.map((id: any) => id?.toString?.() || String(id))
      : [],
  };
}

