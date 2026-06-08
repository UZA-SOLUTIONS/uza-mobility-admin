'use client';

import Image from 'next/image';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export type ExistingPhoto = {
  id: string;
  url: string;
  isPrimary: boolean;
};

type ExistingPhotosGridProps = {
  photos: ExistingPhoto[];
  label?: string;
  hint?: string;
  className?: string;
  /** When set, shows a remove control on each photo. */
  onRemovePhoto?: (photoId: string) => void;
};

export function ExistingPhotosGrid({
  photos,
  label = 'Current photos',
  hint,
  className,
  onRemovePhoto,
}: ExistingPhotosGridProps) {
  if (photos.length === 0) return null;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="space-y-1">
        <Label>{label}</Label>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((photo) => (
          <li
            key={photo.id}
            className="relative aspect-[4/3] overflow-hidden rounded-md border bg-muted"
          >
            <Image
              src={photo.url}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, 160px"
              unoptimized
            />
            {photo.isPrimary ? (
              <span className="absolute top-1.5 left-1.5 rounded bg-background/90 px-1.5 py-0.5 text-[10px] font-medium shadow-sm">
                Cover
              </span>
            ) : null}
            {onRemovePhoto ? (
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="hover:text-destructive-foreground absolute top-1.5 right-1.5 size-7 bg-background/90 shadow-sm hover:bg-destructive"
                aria-label="Remove photo"
                onClick={() => onRemovePhoto(photo.id)}
              >
                <X className="size-4" />
              </Button>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
