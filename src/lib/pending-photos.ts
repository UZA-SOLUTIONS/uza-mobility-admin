export type PendingPhoto = {
  id: string;
  file: File;
  previewUrl: string;
};

export function createPendingPhoto(file: File): PendingPhoto {
  return {
    id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
    file,
    previewUrl: URL.createObjectURL(file),
  };
}

export function revokePendingPhotos(photos: PendingPhoto[]) {
  for (const photo of photos) {
    if (photo.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(photo.previewUrl);
    }
  }
}

export function appendPendingPhotos(
  current: PendingPhoto[],
  files: File[],
  max: number,
): { photos: PendingPhoto[]; skipped: number } {
  const room = Math.max(0, max - current.length);
  const accepted = files.slice(0, room);
  const skipped = files.length - accepted.length;
  return {
    photos: [...current, ...accepted.map(createPendingPhoto)],
    skipped,
  };
}

export function removePendingPhoto(
  photos: PendingPhoto[],
  id: string,
): PendingPhoto[] {
  const target = photos.find((p) => p.id === id);
  if (target?.previewUrl.startsWith('blob:')) {
    URL.revokeObjectURL(target.previewUrl);
  }
  return photos.filter((p) => p.id !== id);
}

export function pendingPhotoFiles(photos: PendingPhoto[]): File[] {
  return photos.map((p) => p.file);
}
