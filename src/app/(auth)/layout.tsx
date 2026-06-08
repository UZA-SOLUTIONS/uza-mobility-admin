export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="relative flex min-h-dvh overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/images/sourcing-img.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-[#17443866]" aria-hidden />
      <div className="relative mx-auto flex w-full max-w-md flex-1 items-center px-4 py-16 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}
