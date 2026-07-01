import { getDb } from '@/server/db/client';
import type { Trip } from '@/components/stay-listings/DestinationData';

const COLLECTION = 'trips';

export async function findTripsByDestination(destinationSlugOrName: string): Promise<Trip[]> {
  const db = await getDb();
  const normalized = destinationSlugOrName.toLowerCase().trim();
  
  // Query with case-insensitive match for destinationSlug and exclude hidden items
  const rows = await db.collection<any>(COLLECTION)
    .find({
      $and: [
        {
          $or: [
            { destinationSlug: { $regex: new RegExp(`^${normalized}$`, 'i') } },
            { destinationSlug: normalized },
            // Also try matching if destinationSlug contains the normalized value
            { destinationSlug: { $regex: new RegExp(normalized, 'i') } }
          ]
        },
        { isHidden: { $ne: true } }
      ]
    })
    .toArray();
  
  return rows.map((r) => ({
    id: r._id?.toString() || r.id || '',
    name: r.name || '',
    propertyName: r.propertyName || '',
    coverImage: r.coverImage || r.image || '',
    duration: r.duration || '',
    price: r.startingPrice || r.price || 0, // Use startingPrice from DB
    category: r.category || 'General', // Map category from DB or default
  }));
}

