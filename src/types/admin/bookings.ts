import type { VehicleBooking } from '@/types/buyer/bookings';

export type AdminVehicleBooking = VehicleBooking & {
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
  };
  proofs?: Array<{
    id: string;
    fileUrl: string;
    fileName: string;
    fileType: string;
  }>;
};
