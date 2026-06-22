import { ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { getCurrentRole, getRoleHome } from "../utils/roles.js";

export default function AccessDenied({ allowedRoles = [] }) {
  const role = getCurrentRole();

  return (
    <div className="card mx-auto max-w-2xl text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-950">
        <ShieldAlert className="h-6 w-6" />
      </div>
      <h1 className="mt-5 text-2xl font-extrabold text-neutral-950">Page not available for this role</h1>
      <p className="mt-3 text-sm leading-6 text-neutral-600">
        Current frontend role is <strong>{role}</strong>. This page is available for:{" "}
        <strong>{allowedRoles.join(", ")}</strong>.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link to={getRoleHome(role)} className="btn-primary">
          Go to my home page
        </Link>
        <Link to="/" className="btn-secondary">
          Change role
        </Link>
      </div>
    </div>
  );
}
