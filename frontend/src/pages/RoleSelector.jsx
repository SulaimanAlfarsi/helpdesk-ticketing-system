import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, UserRound, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getRoleHome } from "../utils/roles.js";

const roles = [
  {
    key: "Employee/User",
    title: "Continue as Employee/User",
    description: "Create tickets and add user comments.",
    icon: UserRound
  },
  {
    key: "Agent",
    title: "Continue as Agent",
    description: "Assign, update, and comment on support tickets.",
    icon: ShieldCheck
  },
  {
    key: "Manager",
    title: "Continue as Manager",
    description: "View reports, overdue tickets, and metrics.",
    icon: Users
  }
];

export default function RoleSelector() {
  const navigate = useNavigate();

  function chooseRole(role) {
    localStorage.setItem("helpdeskRole", role);
    navigate(getRoleHome(role));
  }

  return (
    <main className="flex min-h-screen items-center bg-white px-4 py-12">
      <div className="mx-auto w-full max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto mb-10 max-w-3xl text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-950 text-white shadow-sm">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <p className="mt-6 text-sm font-bold uppercase tracking-[0.24em] text-neutral-500">Helpdesk Ticketing System</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-neutral-950 sm:text-5xl">Choose your workspace role</h1>
          <p className="mt-4 text-base leading-7 text-neutral-600">
            A clean frontend for testing the Spring Boot Helpdesk Ticketing System API. No authentication is used; the selected role is stored locally for navigation context only.
          </p>
        </motion.div>
        <div className="grid gap-4 md:grid-cols-3">
          {roles.map((role, index) => {
            const Icon = role.icon;
            return (
            <motion.button
              key={role.key}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.08 }}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => chooseRole(role.key)}
              className="group rounded-3xl border border-neutral-200 bg-white p-6 text-left shadow-sm transition hover:border-neutral-950 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-950 transition group-hover:bg-neutral-950 group-hover:text-white">
                <Icon className="h-6 w-6" />
              </div>
              <h2 className="mt-5 text-xl font-bold text-neutral-950">{role.title}</h2>
              <p className="mt-3 text-sm leading-6 text-neutral-600">{role.description}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-neutral-950">
                Enter workspace <ArrowRight className="h-4 w-4" />
              </span>
            </motion.button>
          );})}
        </div>
      </div>
    </main>
  );
}
