import { faFutbol } from "@fortawesome/free-solid-svg-icons"; // Or another suitable icon like faUsers
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import UserAvatar from "./UserAvatar"; // This will likely need an update too
import { Button } from "@/components/ui/Button"; // Using our new Button component

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Link
            href="/"
            className="flex items-center space-x-2 text-lg font-semibold text-foreground hover:text-primary transition-colors"
          >
            <FontAwesomeIcon icon={faFutbol} className="h-6 w-6 text-primary" />
            <span>MatchPoint</span>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <Link href="/features">
            {" "}
            {/* Placeholder link */}
            <Button variant="ghost">Features</Button>
          </Link>
          <Link href="/pricing">
            {" "}
            {/* Placeholder link */}
            <Button variant="ghost">Pricing</Button>
          </Link>
          {/* Add other nav links here as needed */}
          <UserAvatar />
        </div>
      </div>
    </nav>
  );
}
