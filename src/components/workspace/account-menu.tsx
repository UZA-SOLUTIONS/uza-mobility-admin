'use client';

import Link from 'next/link';
import { Bell, LogOut, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { adminRoutes } from '@/config/routes';
import { useLogout } from '@/queries/auth';

type AccountMenuUser = {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  profilePhoto?: string | null;
};

type AccountMenuProps = {
  user: AccountMenuUser;
};

export function AccountMenu({ user }: AccountMenuProps) {
  const logout = useLogout();
  const displayName =
    user.firstName || user.lastName
      ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
      : user.email;

  return (
    <div className="flex items-center gap-1">
      <div className="text-primary">
        <ThemeToggle />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className="h-9 gap-2 px-2"
            aria-label="Account menu"
          >
            <Avatar size="default">
              {user.profilePhoto ? (
                <AvatarImage src={user.profilePhoto} alt={user.email} />
              ) : (
                <AvatarFallback>
                  {user.firstName?.charAt(0) ?? '?'}
                  {user.lastName?.charAt(0) ?? ''}
                </AvatarFallback>
              )}
            </Avatar>
            <span className="hidden max-w-[10rem] truncate text-left text-sm font-medium sm:block">
              {displayName}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <p className="truncate text-sm font-medium">{displayName}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={adminRoutes.settings}>
              <User className="size-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={adminRoutes.notifications}>
              <Bell className="size-4" />
              Notifications
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={logout.isPending}
            onSelect={(event) => {
              event.preventDefault();
              logout.mutate();
            }}
          >
            <LogOut className="size-4" />
            {logout.isPending ? 'Signing out…' : 'Log out'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
