type AuthFieldErrorProps = {
  message?: string;
};

export function AuthFieldError({ message }: AuthFieldErrorProps) {
  if (!message) {
    return null;
  }

  return <p className="text-sm font-medium text-red-700">{message}</p>;
}
