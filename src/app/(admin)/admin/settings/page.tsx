import { AccountProfileForm } from '@/components/account/account-profile-form';
import { PageHeader } from '@/components/shared/page-header';

export default function AdminSettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Profile settings"
        description="Update your staff account name, photo, and language preferences."
      />
      <AccountProfileForm showHeading={false} />
    </div>
  );
}
