"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonClass } from "@/components/ui";

const NAV = [
  { label: "Search", href: "/search" },
  { label: "Chat", href: "/chat" },
  { label: "Analysis", href: "/catalog" },
  { label: "Collections", href: "/collections" },
];

export default function SiteNav() {
  const path = usePathname();
  const isActive = (href: string) =>
    path === href || path.startsWith(`${href}/`);

  return (
    <nav
      aria-label="Main"
      className="-mx-3 flex items-center gap-1 overflow-x-auto text-sm sm:mx-0"
    >
      {NAV.map((n) => {
        const active = isActive(n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            aria-current={active ? "page" : undefined}
            className={`relative shrink-0 px-3 py-2 transition-colors duration-150 after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:transition-colors ${
              active
                ? "text-fg after:bg-accent"
                : "text-fg-subtle after:bg-transparent hover:text-fg hover:after:bg-line-strong"
            }`}
          >
            {n.label}
          </Link>
        );
      })}
      {path !== "/search" && (
        <span className="ml-3 hidden md:block">
          <Link
            href="/search"
            className={`${buttonClass("primary")} !px-4 !py-1.5`}
          >
            Find films
          </Link>
        </span>
      )}
    </nav>
  );
}
