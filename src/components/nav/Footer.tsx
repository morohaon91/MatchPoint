"use client";

import { faFutbol } from "@fortawesome/free-solid-svg-icons"; // Using the same icon as Navbar for consistency
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  // Don't show footer in app routes
  if (pathname.startsWith("/app")) {
    return null;
  }

  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/50 text-muted-foreground">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-3 lg:col-span-1 mb-6 lg:mb-0">
            <Link href="/" className="flex items-center space-x-2 mb-3">
              <FontAwesomeIcon
                icon={faFutbol}
                className="h-7 w-7 text-primary"
              />
              <span className="text-xl font-semibold text-foreground">
                MatchPoint
              </span>
            </Link>
            <p className="text-sm">
              Organize your sports activities seamlessly.
            </p>
            <p className="text-xs mt-4">
              &copy; {currentYear} MatchPoint. All rights reserved.
            </p>
          </div>

          <div>
            <h6 className="font-semibold text-foreground mb-3">Company</h6>
            <nav className="flex flex-col space-y-2 text-sm">
              <Link
                href="/about"
                className="hover:text-primary hover:underline"
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className="hover:text-primary hover:underline"
              >
                Contact
              </Link>
              <Link href="/blog" className="hover:text-primary hover:underline">
                Blog
              </Link>
            </nav>
          </div>

          <div>
            <h6 className="font-semibold text-foreground mb-3">Legal</h6>
            <nav className="flex flex-col space-y-2 text-sm">
              <Link
                href="/terms"
                className="hover:text-primary hover:underline"
              >
                Terms of Use
              </Link>
              <Link
                href="/privacy"
                className="hover:text-primary hover:underline"
              >
                Privacy Policy
              </Link>
              <Link
                href="/cookies"
                className="hover:text-primary hover:underline"
              >
                Cookie Policy
              </Link>
            </nav>
          </div>

          <div>
            <h6 className="font-semibold text-foreground mb-3">Resources</h6>
            <nav className="flex flex-col space-y-2 text-sm">
              <Link
                href="/features"
                className="hover:text-primary hover:underline"
              >
                Features
              </Link>
              <Link
                href="/pricing"
                className="hover:text-primary hover:underline"
              >
                Pricing
              </Link>
              <Link
                href="/support"
                className="hover:text-primary hover:underline"
              >
                Support
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
