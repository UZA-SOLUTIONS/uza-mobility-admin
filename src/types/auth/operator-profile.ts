export type MeOperatorSummary = {
  id: string;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';
  businessName: string;
  isVerified: boolean;
};
