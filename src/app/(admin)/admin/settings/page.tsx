import { AccountProfileForm } from '@/components/account/account-profile-form';

export default function AdminSettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Profile settings</h1>
        <p className="text-sm text-muted-foreground">
          Update your staff account name, photo, and language preferences.
        </p>
      </div>
      <AccountProfileForm showHeading={false} />
    </div>
  );
}
