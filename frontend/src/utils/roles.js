export const ROLES = {
  EMPLOYEE: "Employee/User",
  AGENT: "Agent",
  MANAGER: "Manager"
};

export const ROLE_HOME = {
  [ROLES.EMPLOYEE]: "/tickets/create",
  [ROLES.AGENT]: "/tickets",
  [ROLES.MANAGER]: "/dashboard"
};

export function getCurrentRole() {
  return localStorage.getItem("helpdeskRole") || ROLES.EMPLOYEE;
}

export function getRoleHome(role = getCurrentRole()) {
  return ROLE_HOME[role] || "/";
}

export function isAllowed(role, allowedRoles) {
  return allowedRoles.includes(role);
}
