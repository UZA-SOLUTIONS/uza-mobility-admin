import Link from 'next/link';
import { ArrowLeft, Home, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
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
      <div className="absolute inset-0 bg-[#0B1F18]/80 backdrop-blur-[2px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#174438]/30 to-[#0B1F18]" />
      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 items-center justify-center px-6 py-16">
        <div className="text-center text-white">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur">
            <SearchX className="h-10 w-10" />
          </div>
          <p className="mb-2 text-lg font-medium tracking-[0.3em] uppercase">
            Error 404
          </p>
          <h1 className="text-4xl leading-tight font-bold sm:text-5xl md:text-6xl">
            Page Not Found
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/80 sm:text-lg">
            Sorry, the page you are looking for does not exist, may have been
            moved, or is temporarily unavailable.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="min-w-[180px] rounded-full">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>
            {/* <Button
              asChild
              variant="outline"
              size="lg"
              className="min-w-[180px] rounded-full border-white/30 bg-white/10 text-white hover:bg-white hover:text-black"
            >
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Link>
            </Button> */}
          </div>
        </div>
      </div>
    </section>
  );
}
