import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api"
});

export function getErrorMessage(error) {
  const data = error?.response?.data;

  if (data?.details) {
    return Object.entries(data.details)
      .map(([field, message]) => `${field}: ${message}`)
      .join(", ");
  }

  return data?.message || error?.message || "Unexpected error";
}

export const createUser = (payload) => api.post("/users", payload).then((res) => res.data);

export const createAgent = (payload) => api.post("/agents", payload).then((res) => res.data);

export const createTicket = (payload) => api.post("/tickets", payload).then((res) => res.data);

export const getTickets = (filters = {}) =>
  api
    .get("/tickets", {
      params: Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== "" && value !== null && value !== undefined)
      )
    })
    .then((res) => res.data);

export const getTicketById = (ticketId) => api.get(`/tickets/${ticketId}`).then((res) => res.data);

export const assignTicket = (ticketId, payload) =>
  api.post(`/tickets/${ticketId}/assign`, payload).then((res) => res.data);

export const updateTicketStatus = (ticketId, payload) =>
  api.post(`/tickets/${ticketId}/status`, payload).then((res) => res.data);

export const addComment = (ticketId, payload) =>
  api.post(`/tickets/${ticketId}/comments`, payload).then((res) => res.data);

export const getOverdueTickets = () => api.get("/tickets/overdue").then((res) => res.data);

export const getAverageResolutionTime = (filters = {}) =>
  api
    .get("/tickets/metrics/avg-resolution-time", {
      params: Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== "" && value !== null && value !== undefined)
      )
    })
    .then((res) => res.data);

export default api;
