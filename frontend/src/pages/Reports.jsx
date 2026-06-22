import { useEffect, useState } from "react";
import { AlertTriangle, BarChart3, Search } from "lucide-react";
import { getAverageResolutionTime, getErrorMessage, getOverdueTickets } from "../api/api.js";
import EmptyState from "../components/EmptyState.jsx";
import ErrorAlert from "../components/ErrorAlert.jsx";
import PageHeader from "../components/PageHeader.jsx";
import PriorityBadge from "../components/PriorityBadge.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

export default function Reports() {
  const [overdue, setOverdue] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [filters, setFilters] = useState({ agentId: "", category: "" });
  const [error, setError] = useState("");

  async function loadReports(nextFilters = filters) {
    setError("");
    try {
      const [overdueData, metricData] = await Promise.all([
        getOverdueTickets(),
        getAverageResolutionTime(nextFilters)
      ]);
      setOverdue(overdueData);
      setMetrics(metricData);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  function updateFilter(event) {
    setFilters({ ...filters, [event.target.name]: event.target.value });
  }

  function submit(event) {
    event.preventDefault();
    loadReports(filters);
  }

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Analytics"
        title="Reports"
        description="Monitor overdue tickets and average resolution time for management review."
      />
      <ErrorAlert message={error} />

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="card">
          <h2 className="flex items-center gap-2 text-lg font-bold text-neutral-950">
            <BarChart3 className="h-5 w-5" />
            Average Resolution Time
          </h2>
          <form onSubmit={submit} className="mt-4 space-y-3">
            <input name="agentId" value={filters.agentId} onChange={updateFilter} placeholder="Agent ID optional" className="form-input" />
            <input name="category" value={filters.category} onChange={updateFilter} placeholder="Category optional" className="form-input" />
            <button className="btn-primary" type="submit">
              <Search className="h-4 w-4" />
              Apply Filters
            </button>
          </form>
          <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <p className="text-sm font-semibold text-neutral-500">Average hours</p>
            <p className="mt-2 text-3xl font-extrabold text-neutral-950">
              {metrics?.averageResolutionHours != null ? metrics.averageResolutionHours.toFixed(2) : "0.00"}
            </p>
            <p className="mt-2 text-sm text-neutral-500">
              {metrics?.averageResolutionSeconds != null ? metrics.averageResolutionSeconds.toFixed(0) : "0"} seconds
            </p>
          </div>
        </div>

        <div className="card">
          <h2 className="flex items-center gap-2 text-lg font-bold text-neutral-950">
            <AlertTriangle className="h-5 w-5" />
            Overdue Tickets
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-neutral-200 text-neutral-500">
                <tr>
                  <th className="py-2">ID</th>
                  <th className="py-2">Title</th>
                  <th className="py-2">Priority</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">SLA Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {overdue.map((ticket) => (
                  <tr key={ticket.id}>
                    <td className="py-3">#{ticket.id}</td>
                    <td className="py-3">{ticket.title}</td>
                    <td className="py-3"><PriorityBadge priority={ticket.priority} /></td>
                    <td className="py-3"><StatusBadge status={ticket.status} /></td>
                    <td className="py-3">{ticket.slaDueAt ? new Date(ticket.slaDueAt).toLocaleString() : "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {overdue.length === 0 && (
              <div className="mt-5">
                <EmptyState title="No overdue tickets" description="Tickets will appear here when current time passes their SLA due date." />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
