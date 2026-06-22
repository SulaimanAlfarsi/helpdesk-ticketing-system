import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Agents from "./pages/Agents.jsx";
import CreateTicket from "./pages/CreateTicket.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Reports from "./pages/Reports.jsx";
import RoleSelector from "./pages/RoleSelector.jsx";
import TicketDetails from "./pages/TicketDetails.jsx";
import Tickets from "./pages/Tickets.jsx";
import Users from "./pages/Users.jsx";

function Page({ children }) {
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RoleSelector />} />
      <Route path="/dashboard" element={<Page><Dashboard /></Page>} />
      <Route path="/users" element={<Page><Users /></Page>} />
      <Route path="/agents" element={<Page><Agents /></Page>} />
      <Route path="/tickets" element={<Page><Tickets /></Page>} />
      <Route path="/tickets/create" element={<Page><CreateTicket /></Page>} />
      <Route path="/tickets/:id" element={<Page><TicketDetails /></Page>} />
      <Route path="/reports" element={<Page><Reports /></Page>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
