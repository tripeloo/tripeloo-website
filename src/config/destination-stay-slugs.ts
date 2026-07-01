/**
 * Maps a destination slug to all stay destinationSlug values in the database.
 * Ooty-area stays are often stored under "nilgiris" in admin.
 */
export const DESTINATION_STAY_SLUG_ALIASES: Record<string, string[]> = {
  ooty: ['ooty', 'nilgiris'],
};

export function getStaySlugVariants(destinationSlugOrName: string): string[] {
  const normalized = destinationSlugOrName.toLowerCase().trim();
  const aliases = DESTINATION_STAY_SLUG_ALIASES[normalized];
  if (aliases) {
    return [...new Set(aliases.map((slug) => slug.toLowerCase().trim()))];
  }
  return [normalized];
}
