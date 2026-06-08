import type {
  ChargingStation,
  OperatorProfile,
  StationStatus,
} from '@/types/operator/stations';

export type AdminStationFilters = {
  q?: string;
  status?: StationStatus;
  city?: string;
  country?: string;
  page?: number;
  limit?: number;
};

export type AdminOperatorFilters = {
  q?: string;
  status?: OperatorProfile['status'];
  city?: string;
  country?: string;
  page?: number;
  limit?: number;
};

export type StationReviewActionInput = {
  reason?: string;
};

export type AdminStation = ChargingStation;
export type AdminOperator = OperatorProfile;
