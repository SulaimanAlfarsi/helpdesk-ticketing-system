import { useEffect, useState } from "react";
import { Search, RotateCcw } from "lucide-react";
import { getErrorMessage, getTickets } from "../api/api.js";
import EmptyState from "../components/EmptyState.jsx";
import ErrorAlert from "../components/ErrorAlert.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import PageHeader from "../components/PageHeader.jsx";
import TicketCard from "../components/TicketCard.jsx";

const statuses = ["", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REOPENED"];
const priorities = ["", "LOW", "MEDIUM", "HIGH", "CRITICAL"];

export default function Tickets() {
  const [filters, setFilters] = useState({ status: "", priority: "", category: "", assignedAgentId: "" });
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadTickets(nextFilters = filters) {
    setLoading(true);
    setError("");
    try {
      const data = await getTickets(nextFilters);
      setTickets(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTickets();
  }, []);

  function updateFilter(event) {
    setFilters({ ...filters, [event.target.name]: event.target.value });
  }

  function submit(event) {
    event.preventDefault();
    loadTickets(filters);
  }

  function clearFilters() {
    const empty = { status: "", priority: "", category: "", assignedAgentId: "" };
    setFilters(empty);
    loadTickets(empty);
  }

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Ticket queue"
        title="Tickets"
        description="Filter and review support tickets from the backend API."
      />
      <form onSubmit={submit} className="card">
        <div className="mb-4 flex items-center gap-2 text-sm font-bold text-neutral-950">
          <Search className="h-4 w-4" />
          Filter tickets
        </div>
        <div className="grid gap-4 md:grid-cols-5">
          <select name="status" value={filters.status} onChange={updateFilter} className="form-input">
            {statuses.map((status) => <option key={status} value={status}>{status || "All statuses"}</option>)}
          </select>
          <select name="priority" value={filters.priority} onChange={updateFilter} className="form-input">
            {priorities.map((priority) => <option key={priority} value={priority}>{priority || "All priorities"}</option>)}
          </select>
          <input name="category" value={filters.category} onChange={updateFilter} placeholder="Category" className="form-input" />
          <input name="assignedAgentId" value={filters.assignedAgentId} onChange={updateFilter} placeholder="Assigned agent ID" className="form-input" />
          <div className="flex gap-2">
            <button className="btn-primary" type="submit"><Search className="h-4 w-4" />Apply</button>
            <button className="btn-secondary" type="button" onClick={clearFilters}><RotateCcw className="h-4 w-4" />Reset</button>
          </div>
        </div>
      </form>
      <ErrorAlert message={error} />
      {loading ? (
        <LoadingSpinner label="Loading tickets..." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)}
        </div>
      )}
      {!loading && tickets.length === 0 && <EmptyState title="No tickets found" description="Create a ticket or adjust your filters." />}
    </section>
  );
}
