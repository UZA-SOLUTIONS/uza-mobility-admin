import type { QueryClient } from '@tanstack/react-query';
import { adminKeys } from '@/queries/admin';
import { authKeys } from '@/queries/auth';
import { bookingKeys } from '@/queries/bookings';
import { commerceKeys } from '@/queries/commerce';
import { notificationKeys } from '@/queries/notifications';
import { operationsKeys } from '@/queries/operations';
import { operatorKeys } from '@/queries/operator';

/** Remove cached data tied to the previous signed-in user. */
export function clearUserSessionQueries(queryClient: QueryClient) {
  const scopes = [
    authKeys.all,
    notificationKeys.all,
    bookingKeys.all,
    operatorKeys.all,
    adminKeys.all,
    operationsKeys.all,
    commerceKeys.all,
  ];

  for (const queryKey of scopes) {
    queryClient.removeQueries({ queryKey });
  }
}
