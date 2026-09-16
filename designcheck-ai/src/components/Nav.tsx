"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";

const links = [
  { href: "/", label: "Audit" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/pricing", label: "Pricing" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo />
          <span className="text-lg font-semibold tracking-tight text-slate-900">
            DesignCheck <span className="text-indigo-600">AI</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {links.map((l) => {
            const active =
              l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors sm:px-4 ${
                  active
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          <Link
            href="/pricing"
            className="ml-1 hidden rounded-full bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 sm:block"
          >
            Upgrade
          </Link>
        </nav>
      </div>
    </header>
  );
}
