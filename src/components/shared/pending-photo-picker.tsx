'use client';

import { useId, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  appendPendingPhotos,
  type PendingPhoto,
  removePendingPhoto,
  revokePendingPhotos,
} from '@/lib/pending-photos';
import { cn } from '@/lib/utils';

type PendingPhotoPickerProps = {
  photos: PendingPhoto[];
  onChange: (photos: PendingPhoto[]) => void;
  maxPhotos: number;
  label?: string;
  hint?: string;
  className?: string;
};

export function PendingPhotoPicker({
  photos,
  onChange,
  maxPhotos,
  label = 'Photos',
  hint,
  className,
}: PendingPhotoPickerProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const atMax = photos.length >= maxPhotos;

  const addFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const allowed = new Set([
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/heic',
      'image/heif',
    ]);
    const imageFiles = Array.from(files).filter((f) => allowed.has(f.type));
    if (!imageFiles.length) {
      window.alert('Use JPEG, PNG, WebP, or GIF photos (max 5MB each).');
      return;
    }

    const { photos: next, skipped } = appendPendingPhotos(
      photos,
      imageFiles,
      maxPhotos,
    );
    onChange(next);
    if (skipped > 0) {
      window.alert(
        `Only ${maxPhotos} photos allowed. ${skipped} file(s) were not added.`,
      );
    }
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const remove = (id: string) => {
    onChange(removePendingPhoto(photos, id));
  };

  const clearAll = () => {
    revokePendingPhotos(photos);
    onChange([]);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="space-y-1">
          <Label htmlFor={inputId}>{label}</Label>
          <p className="text-xs text-muted-foreground">
            {hint ??
              `${photos.length} / ${maxPhotos} · first image is the cover photo`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={atMax}
            asChild
          >
            <label
              htmlFor={inputId}
              className={cn('cursor-pointer', atMax && 'pointer-events-none')}
            >
              Add photos
            </label>
          </Button>
          {photos.length > 0 ? (
            <Button type="button" variant="ghost" size="sm" onClick={clearAll}>
              Remove all
            </Button>
          ) : null}
        </div>
      </div>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif"
        multiple
        className="sr-only"
        disabled={atMax}
        onChange={(event) => addFiles(event.target.files)}
      />

      {photos.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((photo, index) => (
            <li
              key={photo.id}
              className="group relative aspect-[4/3] overflow-hidden rounded-md border bg-muted"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.previewUrl}
                alt={photo.file.name}
                className="size-full object-cover"
              />
              {index === 0 ? (
                <span className="absolute top-1.5 left-1.5 rounded bg-background/90 px-1.5 py-0.5 text-[10px] font-medium shadow-sm">
                  Cover
                </span>
              ) : null}
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute top-1.5 right-1.5 size-7 opacity-90 shadow-sm"
                aria-label={`Remove ${photo.file.name}`}
                onClick={() => remove(photo.id)}
              >
                <X className="size-4" />
              </Button>
              <p className="absolute inset-x-0 bottom-0 truncate bg-background/80 px-1.5 py-0.5 text-[10px]">
                {photo.file.name}
              </p>
            </li>
          ))}
        </ul>
      ) : maxPhotos === 0 ? (
        <p className="rounded-md border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
          No more photo slots available.
        </p>
      ) : (
        <p className="rounded-md border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
          No new photos selected. Add up to {maxPhotos} image
          {maxPhotos === 1 ? '' : 's'}.
        </p>
      )}
    </div>
  );
}
