export type PublicPartPhoto = {
  id: string;
  url: string;
  isPrimary: boolean;
};

export type PublicPart = {
  id: string;
  name: string;
  slug: string;
  categorySlug: string;
  condition: string;
  priceUsd: number;
  stockQuantity: number;
  stockLabel: string;
  deliveryEstimate: string | null;
  description: string | null;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  photos: PublicPartPhoto[];
};
