type AuthPageHeaderProps = {
  title: string;
  description?: string;
};

export function AuthPageHeader({ title, description }: AuthPageHeaderProps) {
  return (
    <div className="space-y-1">
      <h1 className="text-lg leading-tight font-semibold text-[#051321] sm:text-xl">
        {title}
      </h1>
      {description ? (
        <p className="text-xs leading-snug text-[#5D6772] sm:text-sm">
          {description}
        </p>
      ) : null}
    </div>
  );
}
