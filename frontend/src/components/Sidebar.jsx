import {
  BarChart3,
  LayoutDashboard,
  PlusCircle,
  Ticket,
  UserCog,
  Users,
  X
} from "lucide-react";
import { NavLink } from "react-router-dom";

export const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/users", label: "Users", icon: Users },
  { to: "/agents", label: "Agents", icon: UserCog },
  { to: "/tickets", label: "Tickets", icon: Ticket },
  { to: "/tickets/create", label: "Create Ticket", icon: PlusCircle },
  { to: "/reports", label: "Reports", icon: BarChart3 }
];

export default function Sidebar({ open = false, onClose }) {
  return (
    <>
      <div className={`fixed inset-0 z-40 bg-black/30 lg:hidden ${open ? "block" : "hidden"}`} onClick={onClose} />
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform border-r border-neutral-200 bg-white transition-transform lg:static lg:z-auto lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-5">
            <div>
              <p className="text-lg font-extrabold tracking-tight text-neutral-950">Helpdesk</p>
              <p className="text-xs font-medium text-neutral-500">Ticketing System</p>
            </div>
            <button className="rounded-lg p-2 hover:bg-neutral-100 lg:hidden" onClick={onClose} aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 px-4 py-5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                      isActive
                        ? "bg-neutral-950 text-white shadow-sm"
                        : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="border-t border-neutral-200 p-4">
            <div className="rounded-2xl bg-neutral-950 p-4 text-white">
              <p className="text-sm font-bold">University project</p>
              <p className="mt-1 text-xs leading-5 text-neutral-300">Spring Boot API with a React dashboard frontend.</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
