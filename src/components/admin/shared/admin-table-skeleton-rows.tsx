import { Skeleton } from '@/components/ui/skeleton';
import { TableCell, TableRow } from '@/components/ui/table';

type AdminTableSkeletonRowsProps = {
  rows?: number;
  columns: number;
};

export function AdminTableSkeletonRows({
  rows = 5,
  columns,
}: AdminTableSkeletonRowsProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <TableCell key={colIndex}>
              <Skeleton className="h-4 w-full max-w-[9rem]" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
