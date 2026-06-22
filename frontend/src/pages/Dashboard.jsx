import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  LayoutDashboard,
  Ticket,
  Timer,
  XCircle
} from "lucide-react";
import { getAverageResolutionTime, getErrorMessage, getOverdueTickets, getTickets } from "../api/api.js";
import ErrorAlert from "../components/ErrorAlert.jsx";
import MetricCard from "../components/MetricCard.jsx";
import PageHeader from "../components/PageHeader.jsx";

const statuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

export default function Dashboard() {
  const [tickets, setTickets] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [ticketData, overdueData, metricData] = await Promise.all([
          getTickets(),
          getOverdueTickets(),
          getAverageResolutionTime()
        ]);
        setTickets(ticketData);
        setOverdue(overdueData);
        setMetrics(metricData);
      } catch (err) {
        setError(getErrorMessage(err));
      }
    }

    loadDashboard();
  }, []);

  const counts = statuses.reduce((result, status) => {
    result[status] = tickets.filter((ticket) => ticket.status === status).length;
    return result;
  }, {});

  const cards = [
    { label: "Total Tickets", value: tickets.length, icon: Ticket, description: "All tickets returned by the API." },
    { label: "Open Tickets", value: counts.OPEN || 0, icon: LayoutDashboard, description: "New tickets waiting for work." },
    { label: "In Progress", value: counts.IN_PROGRESS || 0, icon: Timer, description: "Tickets currently being handled." },
    { label: "Resolved", value: counts.RESOLVED || 0, icon: CheckCircle, description: "Tickets marked as resolved." },
    { label: "Closed", value: counts.CLOSED || 0, icon: XCircle, description: "Completed ticket lifecycle." },
    { label: "Overdue", value: overdue.length, icon: AlertTriangle, description: "Tickets past SLA due date." },
    {
      label: "Avg Resolution Hours",
      value: metrics?.averageResolutionHours != null ? metrics.averageResolutionHours.toFixed(2) : "0.00",
      icon: Clock,
      description: "Average from created to resolved."
    }
  ];

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="A professional summary of tickets, SLA risk, and resolution metrics from the Spring Boot API."
      />
      <ErrorAlert message={error} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card, index) => (
          <MetricCard key={card.label} index={index} {...card} />
        ))}
      </div>
    </section>
  );
}
