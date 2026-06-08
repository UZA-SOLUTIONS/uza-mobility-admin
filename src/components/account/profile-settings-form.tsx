'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AccountProfileForm } from '@/components/account/account-profile-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSessionUser } from '@/hooks/session-user';
import {
  useUpdateBuyerProfile,
  useUpdateSellerProfile,
} from '@/queries/profile';
import { allMeSellers, formatSellerChannel } from '@/lib/auth/seller-profiles';
import {
  parseSellerProfileType,
  updateBuyerProfileSchema,
  updateSellerProfileSchema,
  type UpdateBuyerProfileInput,
  type UpdateSellerProfileInput,
} from '@/schemas/profile';

export function ProfileSettingsForm() {
  const { user, isLoading } = useSessionUser();
  const updateBuyer = useUpdateBuyerProfile();
  const updateSeller = useUpdateSellerProfile();
  const [sellerChannel, setSellerChannel] =
    useState<UpdateSellerProfileInput['sellerType']>();

  const buyerForm = useForm<UpdateBuyerProfileInput>({
    resolver: zodResolver(updateBuyerProfileSchema),
    defaultValues: {},
  });

  const sellerForm = useForm<UpdateSellerProfileInput>({
    resolver: zodResolver(updateSellerProfileSchema),
    defaultValues: {},
  });

  useEffect(() => {
    if (!user) return;

    if (user.buyerProfile) {
      buyerForm.reset({
        organizationName: user.buyerProfile.organizationName ?? '',
        city: user.buyerProfile.city ?? '',
        country: user.buyerProfile.country ?? undefined,
      });
    }

    const sellerProfiles = allMeSellers(user);
    if (sellerProfiles.length > 0) {
      setSellerChannel((prev) => {
        if (prev && sellerProfiles.some((s) => s.sellerType === prev)) {
          return prev;
        }
        return parseSellerProfileType(sellerProfiles[0].sellerType);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    user?.id,
    user?.updatedAt,
    user?.buyerProfile?.organizationName,
    user?.buyerProfile?.city,
    user?.buyerProfile?.country,
  ]);

  useEffect(() => {
    if (!user || !sellerChannel) return;
    const profile = allMeSellers(user).find(
      (s) => s.sellerType === sellerChannel,
    );
    if (!profile) return;

    sellerForm.reset({
      businessName: profile.businessName ?? '',
      contactPerson: profile.contactPerson ?? '',
      phone: profile.phone ?? '',
      email: profile.email ?? '',
      address: profile.address ?? '',
      city: profile.city ?? '',
      description: profile.description ?? '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.updatedAt, sellerChannel]);

  if (!user) {
    if (isLoading) {
      return <p className="text-sm text-muted-foreground">Loading profile…</p>;
    }
    return (
      <p className="text-sm text-muted-foreground">
        Sign in to manage your profile.
      </p>
    );
  }

  const sellerProfiles = allMeSellers(user);
  const activeSellerProfile =
    sellerProfiles.find((s) => s.sellerType === sellerChannel) ??
    sellerProfiles[0];

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <AccountProfileForm />

      {user.buyerProfile ? (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Buyer profile</h2>
          <form
            className="space-y-4"
            onSubmit={buyerForm.handleSubmit((values) =>
              updateBuyer.mutate({
                organizationName: values.organizationName?.trim() || undefined,
                address: values.address?.trim() || undefined,
                city: values.city?.trim() || undefined,
                country: values.country?.trim() || undefined,
              }),
            )}
          >
            <div className="space-y-1.5">
              <Label htmlFor="org-name">Organization</Label>
              <Input
                id="org-name"
                {...buyerForm.register('organizationName')}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="buyer-city">City</Label>
                <Input id="buyer-city" {...buyerForm.register('city')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="buyer-country">Country (ISO)</Label>
                <Input
                  id="buyer-country"
                  maxLength={2}
                  {...buyerForm.register('country')}
                />
              </div>
            </div>
            <Button type="submit" disabled={updateBuyer.isPending}>
              Save buyer profile
            </Button>
          </form>
        </section>
      ) : null}

      {sellerProfiles.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Seller profile</h2>
          {sellerProfiles.length > 1 ? (
            <div className="space-y-1.5">
              <Label htmlFor="seller-channel">Inventory channel</Label>
              <Select
                value={sellerChannel || activeSellerProfile?.sellerType}
                onValueChange={(value) =>
                  setSellerChannel(parseSellerProfileType(value))
                }
              >
                <SelectTrigger id="seller-channel">
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  {sellerProfiles.map((profile) => (
                    <SelectItem key={profile.id} value={profile.sellerType}>
                      {formatSellerChannel(profile.sellerType)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
          <form
            className="space-y-4"
            onSubmit={sellerForm.handleSubmit((values) => {
              const sellerType =
                sellerChannel ??
                parseSellerProfileType(activeSellerProfile?.sellerType);
              if (!sellerType) return;

              updateSeller.mutate({
                sellerType,
                businessName: values.businessName?.trim() || undefined,
                contactPerson: values.contactPerson?.trim() || undefined,
                phone: values.phone?.trim() || undefined,
                email: values.email?.trim() || undefined,
                address: values.address?.trim() || undefined,
                city: values.city?.trim() || undefined,
                description: values.description?.trim() || undefined,
              });
            })}
          >
            <div className="space-y-1.5">
              <Label htmlFor="business-name">Business name</Label>
              <Input
                id="business-name"
                {...sellerForm.register('businessName')}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="seller-desc">Description</Label>
              <Textarea
                id="seller-desc"
                rows={3}
                {...sellerForm.register('description')}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="seller-contact">Contact person</Label>
                <Input
                  id="seller-contact"
                  {...sellerForm.register('contactPerson')}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="seller-phone">Phone</Label>
                <Input id="seller-phone" {...sellerForm.register('phone')} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="seller-email">Email</Label>
                <Input id="seller-email" {...sellerForm.register('email')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="seller-city">City</Label>
                <Input id="seller-city" {...sellerForm.register('city')} />
              </div>
            </div>
            <Button type="submit" disabled={updateSeller.isPending}>
              Save seller profile
            </Button>
          </form>
        </section>
      ) : null}
    </div>
  );
}
