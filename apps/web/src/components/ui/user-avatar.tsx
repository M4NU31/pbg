import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  avatarUrl?: string | null;  // precomputed gravatar or google image
  className?: string;
}

export function UserAvatar({ name, email, image, avatarUrl, className }: UserAvatarProps) {
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
