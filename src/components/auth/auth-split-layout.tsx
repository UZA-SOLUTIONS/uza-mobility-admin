import { AuthHeroVideo } from '@/components/auth/auth-hero-video';
import { brand } from '@/lib/brand';

type AuthSplitLayoutProps = {
  children: React.ReactNode;
};

export function AuthSplitLayout({ children }: AuthSplitLayoutProps) {
  return (
    <div
      className="flex h-[100dvh] w-full overflow-hidden"
      style={{ backgroundColor: brand.forest }}
    >
      <div className="relative hidden h-full w-1/2 min-w-0 shrink-0 lg:block">
        <AuthHeroVideo />
      </div>

      <div className="flex h-full w-full min-w-0 flex-col overflow-hidden bg-white lg:w-1/2">
        <div className="flex min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-5 sm:py-6">
          <div className="mx-auto my-auto w-full max-w-[min(100%,420px)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
