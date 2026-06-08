import type { AdminPart } from '@/types/admin/marketplace';

/** Maps review status + visibility to a single label for admin UI. */
export function partDisplayStatus(
  part: Pick<AdminPart, 'status' | 'isActive'>,
) {
  if (part.status === 'APPROVED') {
    return part.isActive ? 'PUBLISHED' : 'UNPUBLISHED';
  }
  return part.status;
}
