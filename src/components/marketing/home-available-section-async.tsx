import { HomeAvailableSection } from '@/components/marketing/home-available-section';
import { getLocalStockListings } from '@/lib/api/marketplace';
import type { PublicListing } from '@/types/marketplace/public-listing';

export async function HomeAvailableSectionAsync() {
  let listings: PublicListing[] = [];
  try {
    listings = await getLocalStockListings();
  } catch {
    listings = [];
  }

  return <HomeAvailableSection listings={listings.slice(0, 4)} />;
}
