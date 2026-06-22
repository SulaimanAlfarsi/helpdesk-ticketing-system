import { useState } from "react";
import { motion } from "framer-motion";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createTicket, getErrorMessage } from "../api/api.js";
import ErrorAlert from "../components/ErrorAlert.jsx";
import PageHeader from "../components/PageHeader.jsx";

export default function CreateTicket() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    category: "",
    raisedByUserId: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const ticket = await createTicket({ ...form, raisedByUserId: Number(form.raisedByUserId) });
      navigate(`/tickets/${ticket.id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="max-w-3xl space-y-6">
      <PageHeader
        eyebrow="New request"
        title="Create Ticket"
        description="Create a support ticket for an existing employee. The backend will assign the SLA policy based on priority."
      />
      <motion.form initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} onSubmit={submit} className="card space-y-4">
        <ErrorAlert message={error} />
        <div>
          <label className="form-label" htmlFor="title">Title</label>
          <input id="title" name="title" value={form.title} onChange={updateField} className="form-input mt-1" />
        </div>
        <div>
          <label className="form-label" htmlFor="description">Description</label>
          <textarea id="description" name="description" value={form.description} onChange={updateField} rows="4" className="form-input mt-1" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="form-label" htmlFor="priority">Priority</label>
            <select id="priority" name="priority" value={form.priority} onChange={updateField} className="form-input mt-1">
              <option>LOW</option>
              <option>MEDIUM</option>
              <option>HIGH</option>
              <option>CRITICAL</option>
            </select>
          </div>
          <div>
            <label className="form-label" htmlFor="category">Category</label>
            <input id="category" name="category" value={form.category} onChange={updateField} className="form-input mt-1" />
          </div>
          <div>
            <label className="form-label" htmlFor="raisedByUserId">Raised by user ID</label>
            <input id="raisedByUserId" name="raisedByUserId" value={form.raisedByUserId} onChange={updateField} className="form-input mt-1" />
          </div>
        </div>
        <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="btn-primary">
          <PlusCircle className="h-4 w-4" />
          {loading ? "Creating..." : "Create Ticket"}
        </motion.button>
      </motion.form>
    </section>
  );
}
