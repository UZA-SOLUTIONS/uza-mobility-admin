import { Inbox } from 'lucide-react';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { TableCell, TableRow } from '@/components/ui/table';

type AdminTableEmptyProps = {
  colSpan: number;
  title: string;
  description?: string;
};

export function AdminTableEmpty({
  colSpan,
  title,
  description,
}: AdminTableEmptyProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-auto p-0">
        <Empty className="border-0 py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Inbox />
            </EmptyMedia>
            <EmptyTitle>{title}</EmptyTitle>
            {description ? (
              <EmptyDescription>{description}</EmptyDescription>
            ) : null}
          </EmptyHeader>
        </Empty>
      </TableCell>
    </TableRow>
  );
}
