import type { QueryClient } from '@tanstack/react-query';
import { adminKeys } from '@/queries/admin';
import { authKeys } from '@/queries/auth';
import { bookingKeys } from '@/queries/bookings';
import { notificationKeys } from '@/queries/notifications';

/** Remove cached data tied to the previous signed-in user. */
export function clearUserSessionQueries(queryClient: QueryClient) {
  const scopes = [
    authKeys.all,
    notificationKeys.all,
    bookingKeys.all,
    adminKeys.all,
  ];

  for (const queryKey of scopes) {
    queryClient.removeQueries({ queryKey });
  }
}
