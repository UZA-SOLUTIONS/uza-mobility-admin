'use client';

import Image from 'next/image';
import { ChevronLeft, ChevronRight, Star, X } from 'lucide-react';
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
  /** Move photo left/right in the gallery order. */
  onMovePhoto?: (photoId: string, direction: 'left' | 'right') => void;
  /** Mark an existing photo as the cover (primary). */
  onSetPrimaryPhoto?: (photoId: string) => void;
};

export function ExistingPhotosGrid({
  photos,
  label = 'Current photos',
  hint,
  className,
  onRemovePhoto,
  onMovePhoto,
  onSetPrimaryPhoto,
}: ExistingPhotosGridProps) {
  if (photos.length === 0) return null;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="space-y-1">
        <Label>{label}</Label>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((photo, index) => (
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
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent p-1.5 pt-6">
              {onMovePhoto ? (
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="size-7 bg-background/90 shadow-sm"
                    aria-label="Move photo earlier"
                    disabled={index === 0}
                    onClick={() => onMovePhoto(photo.id, 'left')}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="size-7 bg-background/90 shadow-sm"
                    aria-label="Move photo later"
                    disabled={index === photos.length - 1}
                    onClick={() => onMovePhoto(photo.id, 'right')}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              ) : (
                <span />
              )}
              <div className="flex gap-1">
                {onSetPrimaryPhoto && !photo.isPrimary ? (
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="size-7 bg-background/90 shadow-sm"
                    aria-label="Set as cover photo"
                    title="Set as cover"
                    onClick={() => onSetPrimaryPhoto(photo.id)}
                  >
                    <Star className="size-3.5" />
                  </Button>
                ) : null}
                {onRemovePhoto ? (
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="hover:text-destructive-foreground size-7 bg-background/90 shadow-sm hover:bg-destructive"
                    aria-label="Remove photo"
                    onClick={() => onRemovePhoto(photo.id)}
                  >
                    <X className="size-4" />
                  </Button>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
