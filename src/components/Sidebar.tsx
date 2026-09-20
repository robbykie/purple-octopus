"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronIcon,
  ExportIcon,
  HelpIcon,
  ShieldIcon,
  StarIcon,
  TrendIcon,
  WalletIcon,
} from "./Icons";

const NAV = [
  { href: "/", label: "Overview", Icon: TrendIcon },
  { href: "/holdings", label: "Holdings", Icon: WalletIcon },
  { href: "/export", label: "Export report", Icon: ExportIcon },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-[230px] shrink-0 flex-col bg-ink text-white/80 max-lg:hidden">
      <div className="flex items-center gap-3 px-6 pt-7 pb-9">
        <span className="flex size-9 items-center justify-center rounded-xl bg-white/10">
          <StarIcon className="size-6" />
        </span>
        <span>
          <span className="block text-[1.05rem] leading-tight font-semibold text-white">
            northstar
          </span>
          <span className="eyebrow block text-[0.58rem] text-white/45">Private Wealth</span>
        </span>
      </div>

      <nav className="px-4" aria-label="Main">
        <p className="eyebrow px-2 pb-3 text-white/35">Workspace</p>
        <ul className="space-y-1">
          {NAV.map(({ href, label, Icon }) => {
            const active = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`focus-ring flex items-center gap-3 rounded-lg px-3 py-2.5 text-[0.9rem] transition-colors ${
                    active
                      ? "bg-white/10 font-medium text-white"
                      : "text-white/65 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="size-[18px]" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto px-4 pb-5">
        <div className="mb-5 rounded-xl bg-white/[0.06] p-4">
          <p className="mb-1.5 flex items-center gap-2 text-[0.8rem] font-medium text-white/90">
            <ShieldIcon className="size-4 text-sage" />
            Local by default
          </p>
          <p className="text-[0.72rem] leading-relaxed text-white/45">
            Your positions stay in this browser. Quotes are the only thing we look up.
          </p>
        </div>

        <Link
          href="/export#how-it-works"
          className="focus-ring flex items-center gap-2.5 px-2 py-2 text-[0.85rem] text-white/55 transition-colors hover:text-white"
        >
          <HelpIcon className="size-[18px]" />
          How Northstar works
        </Link>

        <div className="mt-4 flex items-center gap-3 border-t border-white/10 pt-4">
          <span className="tabular flex size-9 items-center justify-center rounded-full bg-white/10 text-[0.7rem] text-white/80">
            PP
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[0.82rem] text-white">Personal portfolio</span>
            <span className="eyebrow block text-[0.55rem] text-white/35">Personal space</span>
          </span>
          <ChevronIcon className="size-4 text-white/40" />
        </div>
      </div>
    </aside>
  );
}
