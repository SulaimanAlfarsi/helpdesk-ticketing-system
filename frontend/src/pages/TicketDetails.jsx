import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, MessageSquare, Send, UserCog, Workflow } from "lucide-react";
import { useParams } from "react-router-dom";
import {
  addComment,
  assignTicket,
  getErrorMessage,
  getTicketById,
  updateTicketStatus
} from "../api/api.js";
import ErrorAlert from "../components/ErrorAlert.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import PageHeader from "../components/PageHeader.jsx";
import PriorityBadge from "../components/PriorityBadge.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

const statuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REOPENED"];

export default function TicketDetails() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loadingAction, setLoadingAction] = useState("");
  const [assignForm, setAssignForm] = useState({ agentId: "" });
  const [statusForm, setStatusForm] = useState({ newStatus: "IN_PROGRESS", changedByType: "AGENT", changedById: "" });
  const [commentForm, setCommentForm] = useState({ authorType: "USER", authorId: "", message: "" });

  async function loadTicket() {
    setError("");
    try {
      const data = await getTicketById(id);
      setTicket(data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  useEffect(() => {
    loadTicket();
  }, [id]);

  function updateAssign(event) {
    setAssignForm({ ...assignForm, [event.target.name]: event.target.value });
  }

  function updateStatus(event) {
    setStatusForm({ ...statusForm, [event.target.name]: event.target.value });
  }

  function updateComment(event) {
    setCommentForm({ ...commentForm, [event.target.name]: event.target.value });
  }

  async function submitAssign(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoadingAction("assign");

    try {
      const updated = await assignTicket(id, { agentId: Number(assignForm.agentId) });
      setTicket(updated);
      setAssignForm({ agentId: "" });
      setSuccess("Ticket assigned successfully.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingAction("");
    }
  }

  async function submitStatus(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoadingAction("status");

    try {
      const payload = {
        ...statusForm,
        changedById: statusForm.changedById === "" ? null : Number(statusForm.changedById)
      };
      const updated = await updateTicketStatus(id, payload);
      setTicket(updated);
      setSuccess("Ticket status updated successfully.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingAction("");
    }
  }

  async function submitComment(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoadingAction("comment");

    try {
      await addComment(id, {
        ...commentForm,
        authorId: Number(commentForm.authorId)
      });
      setCommentForm({ authorType: "USER", authorId: "", message: "" });
      setSuccess("Comment added successfully.");
      loadTicket();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingAction("");
    }
  }

  if (!ticket && !error) {
    return <LoadingSpinner label="Loading ticket details..." />;
  }

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow={`Ticket #${id}`}
        title={ticket?.title || "Ticket Details"}
        description="Review ticket information, comments, lifecycle history, and service actions."
      />
      <ErrorAlert message={error} />
      {success && <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div>}

      {ticket && (
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="card space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-neutral-500">Ticket #{ticket.id}</p>
                  <h2 className="mt-1 text-2xl font-extrabold text-neutral-950">{ticket.title}</h2>
                  <p className="mt-2 leading-7 text-neutral-600">{ticket.description}</p>
                </div>
                <div className="flex gap-2">
                  <PriorityBadge priority={ticket.priority} />
                  <StatusBadge status={ticket.status} />
                </div>
              </div>
            </motion.div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="card">
                <p className="text-sm font-bold text-neutral-950">Raised by</p>
                <p className="mt-2 text-sm text-neutral-600">{ticket.raisedByUser?.name}</p>
                <p className="text-xs text-neutral-400">ID {ticket.raisedByUser?.id}</p>
              </div>
              <div className="card">
                <p className="flex items-center gap-2 text-sm font-bold text-neutral-950">
                  <UserCog className="h-4 w-4" />
                  Assigned agent
                </p>
                <p className="mt-2 text-sm text-neutral-600">{ticket.assignedAgent?.name || "Not assigned"}</p>
                <p className="text-xs text-neutral-400">{ticket.assignedAgent ? `ID ${ticket.assignedAgent.id}` : "Awaiting assignment"}</p>
              </div>
              <div className="card">
                <p className="flex items-center gap-2 text-sm font-bold text-neutral-950">
                  <Clock className="h-4 w-4" />
                  SLA due
                </p>
                <p className="mt-2 text-sm text-neutral-600">{ticket.slaDueAt ? new Date(ticket.slaDueAt).toLocaleString() : "N/A"}</p>
                <p className="text-xs text-neutral-400">Category: {ticket.category}</p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="card">
                <h3 className="flex items-center gap-2 text-lg font-bold text-neutral-950">
                  <MessageSquare className="h-5 w-5" />
                  Comments
                </h3>
                <div className="mt-4 space-y-3">
                  {ticket.comments?.map((comment) => (
                    <div key={comment.id} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                      <p className="text-sm font-bold text-neutral-800">{comment.authorType} #{comment.authorId}</p>
                      <p className="mt-1 text-sm leading-6 text-neutral-600">{comment.message}</p>
                      <p className="mt-2 text-xs text-neutral-400">{new Date(comment.createdAt).toLocaleString()}</p>
                    </div>
                  ))}
                  {ticket.comments?.length === 0 && <p className="text-sm text-neutral-500">No comments yet.</p>}
                </div>
              </div>

              <div className="card">
                <h3 className="flex items-center gap-2 text-lg font-bold text-neutral-950">
                  <Workflow className="h-5 w-5" />
                  Status Timeline
                </h3>
                <div className="mt-5 space-y-5">
                  {ticket.statusHistory?.map((history) => (
                    <div key={history.id} className="relative border-l border-neutral-200 pl-5">
                      <span className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-neutral-950 ring-4 ring-white" />
                      <p className="text-sm font-bold text-neutral-950">
                        {history.fromStatus || "Created"} <span className="text-neutral-400">to</span> {history.toStatus}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">Changed by {history.changedByType} {history.changedById || ""}</p>
                      <p className="mt-1 text-xs text-neutral-400">{new Date(history.changedAt).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <form onSubmit={submitAssign} className="card space-y-4">
              <h3 className="text-lg font-bold text-neutral-950">Assign Agent</h3>
              <input name="agentId" value={assignForm.agentId} onChange={updateAssign} placeholder="Agent ID" className="form-input" />
              <motion.button whileTap={{ scale: 0.98 }} className="btn-primary w-full" type="submit" disabled={loadingAction === "assign"}>
                {loadingAction === "assign" ? "Assigning..." : "Assign"}
              </motion.button>
            </form>

            <form onSubmit={submitStatus} className="card space-y-4">
              <h3 className="text-lg font-bold text-neutral-950">Update Status</h3>
              <select name="newStatus" value={statusForm.newStatus} onChange={updateStatus} className="form-input">
                {statuses.map((status) => <option key={status}>{status}</option>)}
              </select>
              <select name="changedByType" value={statusForm.changedByType} onChange={updateStatus} className="form-input">
                <option>USER</option>
                <option>AGENT</option>
                <option>SYSTEM</option>
              </select>
              <input name="changedById" value={statusForm.changedById} onChange={updateStatus} placeholder="Changed by ID" className="form-input" />
              <motion.button whileTap={{ scale: 0.98 }} className="btn-primary w-full" type="submit" disabled={loadingAction === "status"}>
                {loadingAction === "status" ? "Updating..." : "Update Status"}
              </motion.button>
            </form>

            <form onSubmit={submitComment} className="card space-y-4">
              <h3 className="text-lg font-bold text-neutral-950">Add Comment</h3>
              <select name="authorType" value={commentForm.authorType} onChange={updateComment} className="form-input">
                <option>USER</option>
                <option>AGENT</option>
              </select>
              <input name="authorId" value={commentForm.authorId} onChange={updateComment} placeholder="Author ID" className="form-input" />
              <textarea name="message" value={commentForm.message} onChange={updateComment} placeholder="Message" rows="3" className="form-input" />
              <motion.button whileTap={{ scale: 0.98 }} className="btn-primary w-full" type="submit" disabled={loadingAction === "comment"}>
                <Send className="h-4 w-4" />
                {loadingAction === "comment" ? "Adding..." : "Add Comment"}
              </motion.button>
            </form>
          </aside>
        </div>
      )}
    </section>
  );
}
