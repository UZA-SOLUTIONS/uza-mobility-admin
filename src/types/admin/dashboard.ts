export type AdminDashboardImpact = {
  evsDelivered: number;
  co2AvoidedKg: number;
  fuelSavedLitres: number;
  greenKmEnabled: number;
  treesEquivalent: number;
  methodologyNote: string;
};

export type AdminDashboard = {
  listings: {
    total: number;
    pendingReview: number;
  };
  orders: {
    total: number;
  };
  payments: {
    pendingVerification: number;
  };
  fleet: {
    active: number;
  };
  financing: {
    pending: number;
  };
  impact: AdminDashboardImpact;
};
