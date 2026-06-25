import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { UserCog } from "lucide-react";
import { createAgent, getAgents, getErrorMessage } from "../api/api.js";
import ErrorAlert from "../components/ErrorAlert.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import PageHeader from "../components/PageHeader.jsx";

export default function Agents() {
  const [form, setForm] = useState({ name: "", email: "", active: true });
  const [agents, setAgents] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingAgents, setLoadingAgents] = useState(false);

  async function loadAgents() {
    setLoadingAgents(true);
    setError("");

    try {
      const data = await getAgents();
      setAgents(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingAgents(false);
    }
  }

  useEffect(() => {
    loadAgents();
  }, []);

  function updateField(event) {
    const { name, value, type, checked } = event.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  }

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await createAgent(form);
      setForm({ name: "", email: "", active: true });
      await loadAgents();
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
              <input id="name" name="name" value={form.name} onChange={updateField} className="form-input mt-1" required />
            </div>
            <div>
              <label className="form-label" htmlFor="email">Email</label>
              <input id="email" name="email" type="email" value={form.email} onChange={updateField} className="form-input mt-1" required />
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
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-neutral-950">Agents</h2>
            <span className="text-sm font-semibold text-neutral-500">{agents.length} total</span>
          </div>
          {loadingAgents ? (
            <div className="mt-6">
              <LoadingSpinner label="Loading agents..." />
            </div>
          ) : agents.length > 0 ? (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200 text-sm">
                <thead>
                  <tr className="text-left text-xs font-bold uppercase text-neutral-500">
                    <th className="py-2 pr-4">ID</th>
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {agents.map((agent) => (
                    <tr key={agent.id}>
                      <td className="py-3 pr-4 font-semibold text-neutral-950">{agent.id}</td>
                      <td className="py-3 pr-4 text-neutral-700">{agent.name}</td>
                      <td className="py-3 pr-4 text-neutral-600">{agent.email}</td>
                      <td className="py-3 pr-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                          agent.active ? "bg-green-50 text-green-700" : "bg-neutral-100 text-neutral-500"
                        }`}>
                          {agent.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-4 text-sm text-neutral-500">Create an active agent to make ticket assignment available.</p>
          )}
        </div>
      </div>
    </section>
  );
}
