'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSessionUser } from '@/hooks/session-user';
import { useUpdateProfile } from '@/queries/profile';
import {
  updateProfileSchema,
  type UpdateProfileInput,
} from '@/schemas/profile';

const languages = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'French' },
  { value: 'rw', label: 'Kinyarwanda' },
] as const;

function initials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

type AccountProfileFormProps = {
  /** When false, omits the section heading (e.g. parent page already has one). */
  showHeading?: boolean;
};

export function AccountProfileForm({
  showHeading = true,
}: AccountProfileFormProps) {
  const { user, isLoading } = useSessionUser();
  const updateProfile = useUpdateProfile();
  const [photo, setPhoto] = useState<File | undefined>();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const photoPreviewRef = useRef<string | null>(null);

  const setPreviewUrl = (url: string | null) => {
    if (
      photoPreviewRef.current?.startsWith('blob:') &&
      photoPreviewRef.current !== url
    ) {
      URL.revokeObjectURL(photoPreviewRef.current);
    }
    photoPreviewRef.current = url;
    setPhotoPreview(url);
  };

  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      preferredLanguage: 'en',
    },
  });

  useEffect(() => {
    if (!user) return;
    form.reset({
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone ?? '',
      preferredLanguage: (user.preferredLanguage as 'en' | 'fr' | 'rw') ?? 'en',
    });

    if (!photo) {
      setPreviewUrl(user.profilePhoto);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- photo held locally until save
  }, [user?.id, user?.updatedAt, user?.profilePhoto]);

  if (!user) {
    if (isLoading) {
      return <p className="text-sm text-muted-foreground">Loading account…</p>;
    }
    return null;
  }

  return (
    <section className="space-y-4">
      {showHeading ? (
        <h2 className="text-lg font-semibold">Personal account</h2>
      ) : null}
      <p className="text-sm text-muted-foreground">
        Your sign-in identity and contact details.
      </p>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit((values) => {
          updateProfile.mutate(
            {
              body: {
                ...values,
                phone: values.phone?.trim() || undefined,
              },
              photo,
            },
            {
              onSuccess: (updated) => {
                setPhoto(undefined);
                setPreviewUrl(updated.profilePhoto);
              },
            },
          );
        })}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div
            className="relative size-20 shrink-0 overflow-hidden rounded-full border bg-muted"
            aria-hidden
          >
            {photoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element -- blob + arbitrary CDN URLs
              <img
                src={photoPreview}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-lg font-medium text-muted-foreground">
                {initials(
                  form.watch('firstName') || user.firstName,
                  form.watch('lastName') || user.lastName,
                )}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <Label htmlFor="profile-photo">Profile photo</Label>
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="outline" size="sm" asChild>
                <label htmlFor="profile-photo" className="cursor-pointer">
                  Choose image
                </label>
              </Button>
              {photo ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setPhoto(undefined);
                    setPreviewUrl(user.profilePhoto);
                  }}
                >
                  Clear selection
                </Button>
              ) : null}
            </div>
            <input
              id="profile-photo"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                setPhoto(file);
                if (!file) {
                  setPreviewUrl(user.profilePhoto);
                  return;
                }
                setPreviewUrl(URL.createObjectURL(file));
              }}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="first-name">First name</Label>
            <Input id="first-name" {...form.register('firstName')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="last-name">Last name</Label>
            <Input id="last-name" {...form.register('lastName')} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="account-phone">Phone</Label>
            <Input id="account-phone" {...form.register('phone')} />
          </div>
          <div className="space-y-1.5">
            <Label>Language</Label>
            <Select
              value={form.watch('preferredLanguage')}
              onValueChange={(value) =>
                form.setValue(
                  'preferredLanguage',
                  value as UpdateProfileInput['preferredLanguage'],
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Sign-in email: <span className="text-foreground">{user.email}</span>
        </p>

        <Button type="submit" disabled={updateProfile.isPending}>
          {updateProfile.isPending ? 'Saving…' : 'Save account'}
        </Button>
      </form>
    </section>
  );
}
