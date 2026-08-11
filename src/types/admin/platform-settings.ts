export type ExchangeRateSnapshot = {
  usdToRwfApi: number;
  usdToRwfEffective: number;
  markupPercent: number;
  rateFetchedAt: string | null;
  baseCurrency: 'USDT';
  quoteCurrency: 'RWF';
};

export type PlatformSettings = {
  bookingFeeUsd: number;
  companyLegalName: string;
  companyBankName: string;
  companyAccountNumber: string;
  companyBankNameRwf: string;
  companyAccountNumberRwf: string;
  companyWhatsappNumber: string;
  currency: 'USDT' | 'USD';
  rwfMarkupPercent: number;
  exchangeRate: ExchangeRateSnapshot;
};

export type UpdatePlatformSettingsInput = {
  bookingFeeUsd?: number;
  companyLegalName?: string;
  companyBankName?: string;
  companyAccountNumber?: string;
  companyBankNameRwf?: string;
  companyAccountNumberRwf?: string;
  companyWhatsappNumber?: string;
  rwfMarkupPercent?: number;
};
