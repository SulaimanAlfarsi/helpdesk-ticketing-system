import { useState } from "react";
import { motion } from "framer-motion";
import { UserCog } from "lucide-react";
import { createAgent, getErrorMessage } from "../api/api.js";
import ErrorAlert from "../components/ErrorAlert.jsx";
import PageHeader from "../components/PageHeader.jsx";

export default function Agents() {
  const [form, setForm] = useState({ name: "", email: "", active: true });
  const [createdAgent, setCreatedAgent] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(event) {
    const { name, value, type, checked } = event.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  }

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setCreatedAgent(null);

    try {
      const agent = await createAgent(form);
      setCreatedAgent(agent);
      setForm({ name: "", email: "", active: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-6">
      <PageHeader eyebrow="Support staff" title="Agents" description="Create support agents who can be assigned to active tickets." />
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
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" name="active" checked={form.active} onChange={updateField} />
            Active agent
          </label>
          <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="btn-primary">
            <UserCog className="h-4 w-4" />
            {loading ? "Creating..." : "Create Agent"}
          </motion.button>
        </form>
      </motion.div>
      <div className="card">
        <h2 className="text-lg font-bold text-neutral-950">Created agent</h2>
        {createdAgent ? (
          <dl className="mt-4 space-y-2 text-sm text-neutral-600">
            <div>ID: {createdAgent.id}</div>
            <div>Name: {createdAgent.name}</div>
            <div>Email: {createdAgent.email}</div>
            <div>Active: {createdAgent.active ? "Yes" : "No"}</div>
          </dl>
        ) : (
          <p className="mt-4 text-sm text-neutral-500">The backend does not expose a list agents endpoint, so the newest created agent appears here.</p>
        )}
      </div>
      </div>
    </section>
  );
}
