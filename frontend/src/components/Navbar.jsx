import { Menu, UserRound } from "lucide-react";
import { Link } from "react-router-dom";

export default function Navbar({ onMenuClick }) {
  const role = localStorage.getItem("helpdeskRole") || "No role";

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <button className="rounded-xl border border-neutral-200 p-2 shadow-sm lg:hidden" onClick={onMenuClick} aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden lg:block">
          <p className="text-sm font-semibold text-neutral-950">Helpdesk Ticketing System</p>
          <p className="text-xs text-neutral-500">Backend API: localhost:8080</p>
        </div>
        <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-700 shadow-sm hover:bg-neutral-50">
          <UserRound className="h-4 w-4" />
          {role}
        </Link>
      </div>
    </header>
  );
}
