import { Navigate, Route, Routes } from "react-router-dom";
import AccessDenied from "./components/AccessDenied.jsx";
import Layout from "./components/Layout.jsx";
import Agents from "./pages/Agents.jsx";
import CreateTicket from "./pages/CreateTicket.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Reports from "./pages/Reports.jsx";
import RoleSelector from "./pages/RoleSelector.jsx";
import TicketDetails from "./pages/TicketDetails.jsx";
import Tickets from "./pages/Tickets.jsx";
import Users from "./pages/Users.jsx";
import { getCurrentRole, isAllowed, ROLES } from "./utils/roles.js";

function Page({ children, allowedRoles }) {
  const role = getCurrentRole();
  const content = allowedRoles && !isAllowed(role, allowedRoles)
    ? <AccessDenied allowedRoles={allowedRoles} />
    : children;

  return <Layout>{content}</Layout>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RoleSelector />} />
      <Route path="/dashboard" element={<Page allowedRoles={[ROLES.AGENT, ROLES.MANAGER]}><Dashboard /></Page>} />
      <Route path="/users" element={<Page allowedRoles={[ROLES.MANAGER]}><Users /></Page>} />
      <Route path="/agents" element={<Page allowedRoles={[ROLES.MANAGER]}><Agents /></Page>} />
      <Route path="/tickets" element={<Page allowedRoles={[ROLES.EMPLOYEE, ROLES.AGENT, ROLES.MANAGER]}><Tickets /></Page>} />
      <Route path="/tickets/create" element={<Page allowedRoles={[ROLES.EMPLOYEE]}><CreateTicket /></Page>} />
      <Route path="/tickets/:id" element={<Page allowedRoles={[ROLES.EMPLOYEE, ROLES.AGENT, ROLES.MANAGER]}><TicketDetails /></Page>} />
      <Route path="/reports" element={<Page allowedRoles={[ROLES.MANAGER]}><Reports /></Page>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
