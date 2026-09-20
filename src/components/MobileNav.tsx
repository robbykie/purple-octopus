"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExportIcon, StarIcon, TrendIcon, WalletIcon } from "./Icons";

const NAV = [
  { href: "/", label: "Overview", Icon: TrendIcon },
  { href: "/holdings", label: "Holdings", Icon: WalletIcon },
  { href: "/export", label: "Export", Icon: ExportIcon },
];

/** The sidebar is desktop-only, so small screens get this bar in its place. */
export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="bg-ink px-4 py-3 text-white lg:hidden">
      <div className="mb-3 flex items-center gap-2.5">
        <StarIcon className="size-5" />
        <span className="text-[0.95rem] font-semibold">northstar</span>
      </div>

      <nav aria-label="Main">
        <ul className="flex gap-2">
          {NAV.map(({ href, label, Icon }) => {
            const active = pathname === href;
            return (
              // min-w-0 lets the three equal columns shrink on a 320px screen;
              // without it the icon-plus-label pair pins the bar wider.
              <li key={href} className="min-w-0 flex-1">
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`focus-ring flex min-w-0 items-center justify-center gap-2 rounded-lg px-2.5 py-2 text-[0.82rem] transition-colors ${
                    active ? "bg-white/10 font-medium text-white" : "text-white/60"
                  }`}
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="truncate">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
