"use client";

import { useAuth } from "@/lib/context/AuthContext";
import signout from "@/lib/firebase/signout";
import Link from "next/link";
import SubscriptionModalReminder from "../subscription/SubscriptionModalReminder";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/DropdownMenu";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

function getUserInitials(name?: string | null): string {
  if (!name) return "U"; // Default User
  const nameParts = name.split(" ").filter(Boolean);
  if (nameParts.length === 0) return "U";
  if (nameParts.length === 1) return nameParts[0].substring(0, 2).toUpperCase();
  return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
}

export default function UserAvatar() {
  const { currentUser, isLoadingAuth } = useAuth();
  const router = useRouter();

  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center h-10 w-10">
        <LoadingSpinner size={24} />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <Link href="/login" passHref legacyBehavior>
        <Button variant="outline">Login</Button>
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            {currentUser.photoURL && (
              <AvatarImage
                src={currentUser.photoURL}
                alt={currentUser.displayName || "User avatar"}
              />
            )}
            <AvatarFallback>
              {getUserInitials(currentUser.displayName)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-foreground">
              {currentUser.displayName || "User"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {currentUser.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href="/app/dashboard" passHref legacyBehavior>
            <DropdownMenuItem>Dashboard</DropdownMenuItem>
          </Link>
          <Link href="/app/settings" passHref legacyBehavior>
            <DropdownMenuItem>Settings</DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {/* SubscriptionModalReminder can be placed here if it's a DropdownMenuItem or similar */}
        {/* For now, let's assume it's not part of this menu or needs specific styling */}
        {/* <DropdownMenuItem><SubscriptionModalReminder /></DropdownMenuItem> */}
        <DropdownMenuItem
          onClick={() =>
            signout(async () => {
              router.push("/login");
            })
          }
          className="text-red-600 focus:bg-red-50 focus:text-red-700"
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
