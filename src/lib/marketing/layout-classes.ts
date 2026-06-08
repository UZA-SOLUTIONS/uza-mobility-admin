/** Horizontal padding for guest/marketing pages — scales down on small screens. */
export const marketingPageX = 'px-4 sm:px-6 md:px-10 lg:px-[60px]' as const;

/** Centered marketing content column with responsive side padding. */
export const marketingContainer =
  `mx-auto w-full max-w-[1440px] ${marketingPageX}` as const;

/** Inner prose blocks (about, blog, for-business). */
export const marketingProseSection =
  `mx-auto max-w-3xl ${marketingPageX} py-12 sm:py-16` as const;

/** Homepage / overlay navbar outer padding. */
export const marketingOverlayNav =
  'px-4 pt-4 sm:px-6 sm:pt-5 md:px-10 lg:px-[60px] lg:pt-[30px]' as const;

/** Footer horizontal padding. */
export const marketingFooterX = 'px-4 sm:px-6 md:px-10 lg:px-20' as const;
