import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

type AdminErrorStateProps = {
  title?: string;
  message: string;
};

export function AdminErrorState({
  title = 'Something went wrong',
  message,
}: AdminErrorStateProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
