import { MarketingPageHero } from '@/components/marketing/marketing-page-hero';

export function VehiclesHero({ title = 'Vehicles.' }: { title?: string }) {
  return <MarketingPageHero title={title} />;
}
