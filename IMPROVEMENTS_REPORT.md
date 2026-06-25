# Improvements Implementation Report

Date: 2026-06-25

This report summarizes the work completed for the improvements described in `IMPROVEMENTS_TESTING.md`.

## Summary

The frontend was updated to use user and agent list data instead of requiring manual ID entry in the main workflows. Role-based frontend access remains in place, and the updated frontend build was verified successfully.

## Implemented Improvements

### User list support

Implemented frontend support for loading users from the backend.

Updated behavior:

* The Users page now loads existing users.
* Created users appear in the users table after creation.
* The Create Ticket page uses a user dropdown for `Raised by user ID`.
* Ticket creation is disabled when no users are available.

Updated files:

```text
frontend/src/api/api.js
frontend/src/pages/Users.jsx
frontend/src/pages/CreateTicket.jsx
```

### Agent list support

Implemented frontend support for loading agents from the backend.

Updated behavior:

* The Agents page now loads existing agents.
* Created agents appear in the agents table after creation.
* Agent active status is shown in the agents table.
* Ticket assignment uses an agent dropdown.
* Only active agents are shown in the ticket assignment dropdown.
* Ticket assignment is disabled when no active agents are available.

Updated files:

```text
frontend/src/api/api.js
frontend/src/pages/Agents.jsx
frontend/src/pages/TicketDetails.jsx
```

### Role permission behavior

The existing frontend-only role restrictions were reviewed and kept in place.

Current behavior:

* Employee/User can view tickets and create tickets.
* Employee/User cannot access users, agents, dashboard, reports, or ticket assignment.
* Agent can view dashboard and tickets.
* Agent cannot create tickets, users, agents, or reports.
* Manager can view dashboard, users, agents, tickets, and reports.
* Manager status updates are sent as `SYSTEM` with `changedById: null`.

Important: this is still frontend-only permission control. The project still has no authentication, JWT, or Spring Security.

## Endpoint Compatibility Note

 documents these list endpoints:

```text
GET /api/users
GET /api/agents
```

The current backend code in this branch exposes:

```text
GET /api/users/all
GET /api/agents/all
```

To keep the frontend compatible, the API helper now tries the documented endpoint first and falls back to the current `/all` endpoint if the first request returns `404` or `405`.


## Manual Testing Checklist

Use this checklist with the backend running at `http://localhost:8080` and the frontend running at `http://localhost:5173`.

* Manager can create and list users.
* Manager can create and list agents.
* Employee/User sidebar shows only Tickets and Create Ticket.
* Employee/User cannot access `/agents`.
* Agent sidebar shows Dashboard and Tickets.
* Agent cannot access `/tickets/create`.
* Create Ticket uses a populated user dropdown.
* Ticket assignment uses a populated active-agent dropdown.
* Inactive agents do not appear in the assignment dropdown.
* Employee/User status updates use the raising user.
* Agent status updates use the assigned agent and are disabled when no agent is assigned.
* Manager status updates send `changedByType: SYSTEM` and `changedById: null`.

## Backend Verification Status

Backend tests were not rerun as part of this frontend report. The frontend build was verified successfully.
