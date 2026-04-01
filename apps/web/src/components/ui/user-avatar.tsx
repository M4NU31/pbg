import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { cn } from "@/lib/utils";

// Client-safe MD5 via crypto-js is heavy — use the gravatar URL pattern directly.
// Gravatar uses MD5 of the lowercase email. We compute it server-side when possible,
// but for client components we call the /api/users/search endpoint which returns avatarUrl.
// As a lightweight fallback, pass the gravatar URL directly via avatarUrl prop.

interface UserAvatarProps {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  avatarUrl?: string | null; // precomputed gravatar or any external URL
  className?: string;
}

export function UserAvatar({ name, email, image, avatarUrl, className }: UserAvatarProps) {
  // Priority: explicit image > precomputed avatarUrl > nothing (shows initials)
  const src = image ?? avatarUrl ?? undefined;

  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : email
    ? email[0].toUpperCase()
    : "?";

  return (
    <Avatar className={cn("shrink-0", className)}>
      <AvatarImage src={src} referrerPolicy="no-referrer" />
      <AvatarFallback className="text-xs">{initials}</AvatarFallback>
    </Avatar>
  );
}
