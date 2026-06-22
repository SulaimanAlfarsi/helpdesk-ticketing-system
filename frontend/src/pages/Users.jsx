import { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";
import { createUser, getErrorMessage } from "../api/api.js";
import ErrorAlert from "../components/ErrorAlert.jsx";
import PageHeader from "../components/PageHeader.jsx";

export default function Users() {
  const [form, setForm] = useState({ name: "", email: "" });
  const [createdUser, setCreatedUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setCreatedUser(null);

    try {
      const user = await createUser(form);
      setCreatedUser(user);
      setForm({ name: "", email: "" });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-6">
      <PageHeader eyebrow="Employees" title="Users" description="Create employees who can raise internal support tickets." />
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="card">
        <form onSubmit={submit} className="space-y-4">
          <ErrorAlert message={error} />
          <div>
            <label className="form-label" htmlFor="name">Name</label>
            <input id="name" name="name" value={form.name} onChange={updateField} className="form-input mt-1" />
          </div>
          <div>
            <label className="form-label" htmlFor="email">Email</label>
            <input id="email" name="email" value={form.email} onChange={updateField} className="form-input mt-1" />
          </div>
          <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="btn-primary">
            <UserPlus className="h-4 w-4" />
            {loading ? "Creating..." : "Create User"}
          </motion.button>
        </form>
      </motion.div>
      <div className="card">
        <h2 className="text-lg font-bold text-neutral-950">Created user</h2>
        {createdUser ? (
          <dl className="mt-4 space-y-2 text-sm text-neutral-600">
            <div>ID: {createdUser.id}</div>
            <div>Name: {createdUser.name}</div>
            <div>Email: {createdUser.email}</div>
          </dl>
        ) : (
          <p className="mt-4 text-sm text-neutral-500">The backend does not expose a list users endpoint, so the newest created user appears here.</p>
        )}
      </div>
      </div>
    </section>
  );
}
