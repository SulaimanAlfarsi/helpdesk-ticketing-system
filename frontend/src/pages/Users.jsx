import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";
import { createUser, getErrorMessage, getUsers } from "../api/api.js";
import ErrorAlert from "../components/ErrorAlert.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import PageHeader from "../components/PageHeader.jsx";

export default function Users() {
  const [form, setForm] = useState({ name: "", email: "" });
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  async function loadUsers() {
    setLoadingUsers(true);
    setError("");

    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingUsers(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await createUser(form);
      setForm({ name: "", email: "" });
      await loadUsers();
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
              <input id="name" name="name" value={form.name} onChange={updateField} className="form-input mt-1" required />
            </div>
            <div>
              <label className="form-label" htmlFor="email">Email</label>
              <input id="email" name="email" type="email" value={form.email} onChange={updateField} className="form-input mt-1" required />
            </div>
            <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="btn-primary">
              <UserPlus className="h-4 w-4" />
              {loading ? "Creating..." : "Create User"}
            </motion.button>
          </form>
        </motion.div>
        <div className="card">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-neutral-950">Users</h2>
            <span className="text-sm font-semibold text-neutral-500">{users.length} total</span>
          </div>
          {loadingUsers ? (
            <div className="mt-6">
              <LoadingSpinner label="Loading users..." />
            </div>
          ) : users.length > 0 ? (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200 text-sm">
                <thead>
                  <tr className="text-left text-xs font-bold uppercase text-neutral-500">
                    <th className="py-2 pr-4">ID</th>
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="py-3 pr-4 font-semibold text-neutral-950">{user.id}</td>
                      <td className="py-3 pr-4 text-neutral-700">{user.name}</td>
                      <td className="py-3 pr-4 text-neutral-600">{user.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-4 text-sm text-neutral-500">Create a user to populate the employee list.</p>
          )}
        </div>
      </div>
    </section>
  );
}
