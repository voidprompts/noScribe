import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Logo className="h-6 w-6" />
          <span>© {new Date().getFullYear()} DesignCheck AI. Ship designs with confidence.</span>
        </div>
        <div className="flex gap-6 text-sm text-slate-500">
          <Link href="/" className="hover:text-slate-900">
            Run an audit
          </Link>
          <Link href="/dashboard" className="hover:text-slate-900">
            Dashboard
          </Link>
          <Link href="/pricing" className="hover:text-slate-900">
            Pricing
          </Link>
        </div>
      </div>
    </footer>
  );
}
