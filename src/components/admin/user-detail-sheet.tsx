'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { ConfirmDialog } from '@/components/admin/shared/confirm-dialog';
import { StatusBadge } from '@/components/admin/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { formatDateTime } from '@/lib/admin/format';
import {
  useActivateAdminUser,
  useDeactivateAdminUser,
  useUpdateAdminUserRoles,
} from '@/queries/platform';
import type { AssignUserRolesInput } from '@/schemas/platform';
import { assignableRoleNames, type AdminUser } from '@/types/admin/platform';

type UserDetailSheetProps = {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function UserDetailSheet({
  user,
  open,
  onOpenChange,
}: UserDetailSheetProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const updateRoles = useUpdateAdminUserRoles();
  const deactivate = useDeactivateAdminUser();
  const activate = useActivateAdminUser();
  const [activateOpen, setActivateOpen] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    if (!open || !user) return;
    setSelectedRoles([...user.roles]);
  }, [open, user]);

  const toggleRole = (role: string) => {
    setSelectedRoles((current) =>
      current.includes(role)
        ? current.filter((r) => r !== role)
        : [...current, role],
    );
  };

  const rolesChanged =
    user &&
    (selectedRoles.length !== user.roles.length ||
      selectedRoles.some((r) => !user.roles.includes(r)));

  const busy =
    updateRoles.isPending || deactivate.isPending || activate.isPending;
  const isInactive = Boolean(user && (!user.isActive || user.deletedAt));
  const isSelf = Boolean(user && session?.user?.id === user.id);

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-lg">
          {user ? (
            <>
              <SheetHeader className="border-b px-6 py-5">
                <SheetTitle className="text-xl">
                  {[user.firstName, user.lastName].filter(Boolean).join(' ') ||
                    user.email}
                </SheetTitle>
                <SheetDescription>{user.email}</SheetDescription>
              </SheetHeader>

              <div className="space-y-6 px-6 py-6">
                <StatusBadge status={isInactive ? 'CANCELLED' : 'ACTIVE'} />

                <dl className="grid gap-3 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Phone</dt>
                    <dd>{user.phone ?? '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Joined</dt>
                    <dd>{formatDateTime(user.createdAt)}</dd>
                  </div>
                </dl>

                <div className="space-y-3">
                  <Label>Roles (replaces current assignment)</Label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {assignableRoleNames.map((role) => (
                      <label
                        key={role}
                        className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm"
                      >
                        <Checkbox
                          checked={selectedRoles.includes(role)}
                          disabled={isInactive || busy}
                          onCheckedChange={() => toggleRole(role)}
                        />
                        {role.replaceAll('_', ' ')}
                      </label>
                    ))}
                  </div>
                  <Button
                    type="button"
                    disabled={
                      isInactive ||
                      busy ||
                      selectedRoles.length === 0 ||
                      !rolesChanged
                    }
                    onClick={() =>
                      updateRoles.mutate({
                        id: user.id,
                        body: {
                          roles: selectedRoles as AssignUserRolesInput['roles'],
                        },
                      })
                    }
                  >
                    {updateRoles.isPending ? 'Saving…' : 'Save roles'}
                  </Button>
                </div>

                {!isInactive ? (
                  isSelf ? (
                    <p className="text-sm text-muted-foreground">
                      You cannot deactivate your own account.
                    </p>
                  ) : (
                    <Button
                      variant="destructive"
                      disabled={busy}
                      onClick={() => setDeactivateOpen(true)}
                    >
                      Deactivate account
                    </Button>
                  )
                ) : (
                  <Button
                    variant="outline"
                    disabled={busy}
                    onClick={() => setActivateOpen(true)}
                  >
                    Reactivate account
                  </Button>
                )}
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={deactivateOpen}
        onOpenChange={setDeactivateOpen}
        title="Deactivate user?"
        description="The user will be signed out and notified by email and in-app alert. You can reactivate the account later."
        confirmLabel="Deactivate"
        variant="destructive"
        loading={deactivate.isPending}
        onConfirm={() => {
          if (!user) return;
          deactivate.mutate(user.id, {
            onSuccess: () => {
              setDeactivateOpen(false);
              onOpenChange(false);
            },
          });
        }}
      />

      <ConfirmDialog
        open={activateOpen}
        onOpenChange={setActivateOpen}
        title="Reactivate account?"
        description="The user can sign in again and will receive an email and in-app notification."
        confirmLabel="Reactivate"
        loading={activate.isPending}
        onConfirm={() => {
          if (!user) return;
          activate.mutate(user.id, {
            onSuccess: () => {
              setActivateOpen(false);
            },
          });
        }}
      />
    </>
  );
}
