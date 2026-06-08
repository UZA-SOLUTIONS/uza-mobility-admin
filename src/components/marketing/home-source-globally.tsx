import Image from 'next/image';
import Link from 'next/link';
import { brand } from '@/lib/marketing/colors';
import { marketingContainer } from '@/lib/marketing/layout-classes';

export function HomeSourceGlobally() {
  return (
    <section className="bg-white pt-4 pb-12 sm:pb-20">
      <div className={marketingContainer}>
        <div className="relative min-h-[360px] overflow-hidden rounded-2xl px-4 py-8 sm:min-h-[440px] sm:rounded-3xl sm:px-6 sm:py-10 md:min-h-[500px] lg:min-h-[550px] lg:rounded-[32px] lg:px-10 lg:py-0">
          <div className="absolute inset-0" aria-hidden>
            <Image
              src="/images/sourcing-img.jpg"
              alt=""
              fill
              className="object-cover"
            />
          </div>
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: '#17443866',
            }}
            aria-hidden
          />
          <div className="relative z-10 flex h-full min-h-[inherit] items-end pb-6 sm:pb-10 lg:pb-[60px]">
            <div className="space-y-6 pt-4 sm:space-y-8 sm:pt-8">
              <div className="space-y-3 sm:space-y-4">
                <h2 className="text-3xl leading-[1.05] font-semibold text-white sm:text-4xl md:text-5xl lg:text-[56px]">
                  Source Globally.
                  <br />
                  Maximize Your Budget.
                </h2>
                <p className="text-base leading-[1.45] text-white">
                  Tell us what you need. We secure factory-direct EVs with 100%
                  transparent, landed pricing straight to Kigali.
                </p>
              </div>
              <Link
                href="/register"
                className="inline-flex h-12 w-[180px] items-center justify-center rounded-full text-sm font-semibold"
                style={{ backgroundColor: brand.lime, color: brand.forest }}
              >
                Start Sourcing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
