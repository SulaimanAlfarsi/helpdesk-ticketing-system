import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, MessageSquare, Send, UserCog, Workflow } from "lucide-react";
import { useParams } from "react-router-dom";
import {
  addComment,
  assignTicket,
  getAgents,
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
  const selectedRole = localStorage.getItem("helpdeskRole") || "Employee/User";
  const isEmployee = selectedRole === "Employee/User";
  const isAgent = selectedRole === "Agent";
  const isManager = selectedRole === "Manager";
  const canAssignTicket = isAgent || isManager;
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loadingAction, setLoadingAction] = useState("");
  const [agents, setAgents] = useState([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [assignForm, setAssignForm] = useState({ agentId: "" });
  const [statusForm, setStatusForm] = useState({ newStatus: "IN_PROGRESS", changedByType: "AGENT", changedById: "" });
  const [commentForm, setCommentForm] = useState({ authorType: "USER", authorId: "", message: "" });

  function getChangedByOptions(ticketData) {
    if (!ticketData) {
      return [];
    }

    if (isManager) {
      return [{ value: "SYSTEM:", label: "System / Manager action" }];
    }

    if (isAgent) {
      return ticketData.assignedAgent
        ? [{
            value: `AGENT:${ticketData.assignedAgent.id}`,
            label: `Assigned agent - ${ticketData.assignedAgent.name} (ID ${ticketData.assignedAgent.id})`
          }]
        : [];
    }

    if (isEmployee) {
      return ticketData.raisedByUser
        ? [{
            value: `USER:${ticketData.raisedByUser.id}`,
            label: `Raising user - ${ticketData.raisedByUser.name} (ID ${ticketData.raisedByUser.id})`
          }]
        : [];
    }

    return [];
  }

  function getCommentAuthorOptions(ticketData) {
    if (!ticketData) {
      return [];
    }

    if (isEmployee && ticketData.raisedByUser) {
      return [{
        value: `USER:${ticketData.raisedByUser.id}`,
        label: `Raising user - ${ticketData.raisedByUser.name} (ID ${ticketData.raisedByUser.id})`
      }];
    }

    if (isAgent && ticketData.assignedAgent) {
      return [{
        value: `AGENT:${ticketData.assignedAgent.id}`,
        label: `Assigned agent - ${ticketData.assignedAgent.name} (ID ${ticketData.assignedAgent.id})`
      }];
    }

    return [];
  }

  function applyOptionToStatus(optionValue) {
    const [changedByType, changedById = ""] = optionValue.split(":");
    setStatusForm((previous) => ({ ...previous, changedByType, changedById }));
  }

  function applyOptionToComment(optionValue) {
    const [authorType, authorId = ""] = optionValue.split(":");
    setCommentForm((previous) => ({ ...previous, authorType, authorId }));
  }

  async function loadAgents() {
    if (!canAssignTicket) {
      return;
    }

    setLoadingAgents(true);
    try {
      const data = await getAgents();
      const activeAgents = data.filter((agent) => agent.active);
      setAgents(activeAgents);
      if (activeAgents.length > 0) {
        setAssignForm({ agentId: String(activeAgents[0].id) });
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingAgents(false);
    }
  }

  async function loadTicket() {
    setError("");
    try {
      const data = await getTicketById(id);
      setTicket(data);
      const defaultChangedBy = getChangedByOptions(data)[0];
      if (defaultChangedBy) {
        const [changedByType, changedById = ""] = defaultChangedBy.value.split(":");
        setStatusForm((previous) => ({ ...previous, changedByType, changedById }));
      }

      const defaultCommentAuthor = getCommentAuthorOptions(data)[0];
      if (defaultCommentAuthor) {
        const [authorType, authorId = ""] = defaultCommentAuthor.value.split(":");
        setCommentForm((previous) => ({ ...previous, authorType, authorId }));
      }
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  useEffect(() => {
    loadTicket();
    loadAgents();
  }, [id]);

  function updateAssign(event) {
    setAssignForm({ ...assignForm, [event.target.name]: event.target.value });
  }

  function updateStatus(event) {
    setStatusForm({ ...statusForm, [event.target.name]: event.target.value });
  }

  function updateChangedBy(event) {
    applyOptionToStatus(event.target.value);
  }

  function updateCommentAuthor(event) {
    applyOptionToComment(event.target.value);
  }

  function updateComment(event) {
    setCommentForm({ ...commentForm, [event.target.name]: event.target.value });
  }

  async function submitAssign(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!canAssignTicket) {
      setError("Only Agent or Manager roles can assign tickets in this frontend.");
      return;
    }

    if (!assignForm.agentId) {
      setError("Select an active agent before assigning this ticket.");
      return;
    }

    setLoadingAction("assign");

    try {
      const updated = await assignTicket(id, { agentId: Number(assignForm.agentId) });
      setTicket(updated);
      if (updated.assignedAgent?.id) {
        const defaultChangedBy = getChangedByOptions(updated)[0];
        if (defaultChangedBy) {
          const [changedByType, changedById = ""] = defaultChangedBy.value.split(":");
          setStatusForm((previous) => ({ ...previous, changedByType, changedById }));
        }

        const defaultCommentAuthor = getCommentAuthorOptions(updated)[0];
        if (defaultCommentAuthor) {
          const [authorType, authorId = ""] = defaultCommentAuthor.value.split(":");
          setCommentForm((previous) => ({ ...previous, authorType, authorId }));
        }
      }
      setAssignForm({ agentId: String(updated.assignedAgent?.id || "") });
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

    if (changedByOptions.length === 0) {
      setError("Current role cannot update status for this ticket. Agents need an assigned agent, and users can only act as the raising user.");
      return;
    }

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

    if (commentAuthorOptions.length === 0) {
      setError("Current role cannot add comments for this ticket. Users can comment as the raising user, and agents can comment as the assigned agent.");
      return;
    }

    setLoadingAction("comment");

    try {
      await addComment(id, {
        ...commentForm,
        authorId: Number(commentForm.authorId)
      });
      const defaultCommentAuthor = getCommentAuthorOptions(ticket)[0];
      if (defaultCommentAuthor) {
        const [authorType, authorId = ""] = defaultCommentAuthor.value.split(":");
        setCommentForm({ authorType, authorId, message: "" });
      } else {
        setCommentForm({ authorType: "USER", authorId: "", message: "" });
      }
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

  const changedByOptions = getChangedByOptions(ticket);
  const commentAuthorOptions = getCommentAuthorOptions(ticket);

  const selectedChangedBy = `${statusForm.changedByType}:${statusForm.changedById || ""}`;
  const selectedCommentAuthor = `${commentForm.authorType}:${commentForm.authorId || ""}`;
  const activeAgents = agents.filter((agent) => agent.active);

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
            <div className="card">
              <p className="text-sm font-bold text-neutral-950">Frontend permission role</p>
              <p className="mt-2 text-sm text-neutral-600">{selectedRole}</p>
              <p className="mt-2 text-xs leading-5 text-neutral-500">
                This is a UI-only permission guard. The project still has no authentication.
              </p>
            </div>

            {canAssignTicket ? (
              <form onSubmit={submitAssign} className="card space-y-4">
                <h3 className="text-lg font-bold text-neutral-950">Assign Agent</h3>
                <select
                  name="agentId"
                  value={assignForm.agentId}
                  onChange={updateAssign}
                  className="form-input"
                  disabled={loadingAgents || activeAgents.length === 0}
                  required
                >
                  {loadingAgents && <option value="">Loading active agents...</option>}
                  {!loadingAgents && activeAgents.length === 0 && <option value="">No active agents available</option>}
                  {!loadingAgents && activeAgents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} (ID {agent.id})
                    </option>
                  ))}
                </select>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary w-full"
                  type="submit"
                  disabled={loadingAction === "assign" || loadingAgents || activeAgents.length === 0}
                >
                  {loadingAction === "assign" ? "Assigning..." : "Assign"}
                </motion.button>
              </form>
            ) : (
              <div className="card">
                <h3 className="text-lg font-bold text-neutral-950">Assign Agent</h3>
                <p className="mt-2 text-sm leading-6 text-neutral-500">Employees cannot assign tickets. Switch to Agent or Manager role to use this action.</p>
              </div>
            )}

            <form onSubmit={submitStatus} className="card space-y-4">
              <h3 className="text-lg font-bold text-neutral-950">Update Status</h3>
              <div>
                <label className="form-label" htmlFor="newStatus">New status</label>
                <select id="newStatus" name="newStatus" value={statusForm.newStatus} onChange={updateStatus} className="form-input mt-1">
                  {statuses.map((status) => <option key={status}>{status}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label" htmlFor="changedBy">Changed by</label>
                <select id="changedBy" value={selectedChangedBy} onChange={updateChangedBy} className="form-input mt-1" disabled={changedByOptions.length === 0}>
                  {changedByOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-neutral-500">
                  {changedByOptions.length > 0
                    ? "This fills changedByType and changedById based on the selected frontend role."
                    : "No valid status actor is available for this role and ticket."}
                </p>
              </div>
              <motion.button whileTap={{ scale: 0.98 }} className="btn-primary w-full" type="submit" disabled={loadingAction === "status" || changedByOptions.length === 0}>
                {loadingAction === "status" ? "Updating..." : "Update Status"}
              </motion.button>
            </form>

            <form onSubmit={submitComment} className="card space-y-4">
              <h3 className="text-lg font-bold text-neutral-950">Add Comment</h3>
              <select value={selectedCommentAuthor} onChange={updateCommentAuthor} className="form-input" disabled={commentAuthorOptions.length === 0}>
                {commentAuthorOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {commentAuthorOptions.length === 0 && (
                <p className="text-xs leading-5 text-neutral-500">
                  Managers cannot add comments because the backend supports only USER and AGENT comment authors. Agents need to be assigned first.
                </p>
              )}
              <textarea name="message" value={commentForm.message} onChange={updateComment} placeholder="Message" rows="3" className="form-input" />
              <motion.button whileTap={{ scale: 0.98 }} className="btn-primary w-full" type="submit" disabled={loadingAction === "comment" || commentAuthorOptions.length === 0}>
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
