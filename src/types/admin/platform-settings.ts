export type PlatformSettings = {
  bookingFeeUsd: number;
  companyLegalName: string;
  companyBankName: string;
  companyAccountNumber: string;
  currency: 'USD';
};

export type UpdatePlatformSettingsInput = {
  bookingFeeUsd?: number;
  companyLegalName?: string;
  companyBankName?: string;
  companyAccountNumber?: string;
};
