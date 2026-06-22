import { motion } from "framer-motion";
import { ArrowRight, Clock, UserCog } from "lucide-react";
import { Link } from "react-router-dom";
import PriorityBadge from "./PriorityBadge.jsx";
import StatusBadge from "./StatusBadge.jsx";

export default function TicketCard({ ticket }) {
  const agentId = ticket.assignedAgent?.id || "Not assigned";

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="card flex flex-col gap-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-neutral-500">Ticket #{ticket.id}</p>
          <h3 className="mt-1 text-lg font-bold text-neutral-950">{ticket.title}</h3>
          <p className="mt-1 text-sm text-neutral-500">{ticket.category}</p>
        </div>
        <div className="flex gap-2">
          <PriorityBadge priority={ticket.priority} />
          <StatusBadge status={ticket.status} />
        </div>
      </div>
      <div className="space-y-2 text-sm text-neutral-600">
        <p className="flex items-center gap-2">
          <UserCog className="h-4 w-4 text-neutral-400" />
          Agent: {agentId}
        </p>
        <p className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-neutral-400" />
          SLA due: {ticket.slaDueAt ? new Date(ticket.slaDueAt).toLocaleString() : "N/A"}
        </p>
      </div>
      <Link to={`/tickets/${ticket.id}`} className="btn-secondary mt-auto">
        View details
        <ArrowRight className="h-4 w-4" />
      </Link>
    </motion.article>
  );
}
