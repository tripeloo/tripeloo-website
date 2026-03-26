import { getDb } from '@/server/db/client';
import type { TourPackageListItem } from '@/components/stay-listings/DestinationData';

const COLLECTION = 'tour_packages';

export async function findTourPackagesByDestination(destinationSlugOrName: string): Promise<TourPackageListItem[]> {
  const db = await getDb();
  const normalized = destinationSlugOrName.toLowerCase().trim();
  const slugLike = normalized.replace(/\s+/g, '-');
  const nameLike = normalized.replace(/-/g, ' ');
  const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const rows = await db.collection<any>(COLLECTION)
    .find({
      $and: [
        {
          $or: [
            { destinationSlug: { $regex: new RegExp(`^${escapeRegex(normalized)}$`, 'i') } },
            { destinationSlug: { $regex: new RegExp(`^${escapeRegex(slugLike)}$`, 'i') } },
            { destinationSlug: { $regex: new RegExp(`^${escapeRegex(nameLike)}$`, 'i') } },
            { destinationSlug: normalized },
            { destinationSlug: slugLike },
            { destinationSlug: nameLike },
            { destinationName: { $regex: new RegExp(`^${escapeRegex(normalized)}$`, 'i') } },
            { destinationName: { $regex: new RegExp(`^${escapeRegex(nameLike)}$`, 'i') } },
            { destinationSlug: { $regex: new RegExp(escapeRegex(normalized), 'i') } },
            { destinationName: { $regex: new RegExp(escapeRegex(normalized), 'i') } },
          ],
        },
        { isHidden: { $ne: true } },
      ],
    })
    .toArray();

  return rows.map((r) => ({
    id: r._id?.toString() || r.id || '',
    name: r.name || '',
    coverImage: r.coverImage || '',
    packagePrice: r.packagePrice ?? 0,
    currency: r.currency || 'INR',
    numberOfDays: r.numberOfDays ?? 0,
    numberOfNights: r.numberOfNights ?? 0,
    durationOptions: Array.isArray(r.durationOptions) ? r.durationOptions : [],
  }));
}
