# Improvements Testing Guide

This file documents the latest project improvements and how to test them manually.

Base backend URL:

```text
http://localhost:8080
```

Frontend URL:

```text
http://localhost:5173
```

## 1. What Was Improved

### Backend API additions

New endpoints were added:

```text
GET http://localhost:8080/api/users
GET http://localhost:8080/api/agents
```

These endpoints make the frontend easier to use because users and agents can now be selected from dropdowns instead of manually typing IDs.

### Frontend improvements

The frontend now uses the new APIs for:

* Listing users on the Users page.
* Listing agents on the Agents page.
* Selecting a user when creating a ticket.
* Selecting an active agent when assigning a ticket.

### Frontend role permission improvements

The role selector still has no authentication, but the UI now limits pages and actions by selected role.

Employee/User:

* Can create tickets.
* Can view tickets.
* Cannot create users.
* Cannot create agents.
* Cannot open reports.
* Cannot assign tickets.

Agent:

* Can view dashboard.
* Can view tickets.
* Can assign tickets.
* Can update assigned tickets.
* Cannot create tickets.
* Cannot create users.
* Cannot create agents.
* Cannot open reports.

Manager:

* Can view dashboard.
* Can create/list users.
* Can create/list agents.
* Can view tickets.
* Can assign tickets.
* Can open reports.
* Status updates are sent as `SYSTEM`.

Important:

This is frontend-only permission control. The project still intentionally has no authentication, JWT, or Spring Security.

## 2. Backend Test: List Users

Method:

```text
GET
```

URL:

```text
http://localhost:8080/api/users
```

Expected result:

```text
200 OK
```

Expected response:

```json
[
  {
    "id": 1,
    "name": "Ahmed",
    "email": "ahmed@company.com",
    "createdAt": "2026-06-24T17:00:00"
  }
]
```

If the response is an empty array:

```json
[]
```

Create a user first using:

```text
POST http://localhost:8080/api/users
```

Body:

```json
{
  "name": "Ahmed",
  "email": "ahmed.test@company.com"
}
```

## 3. Backend Test: List Agents

Method:

```text
GET
```

URL:

```text
http://localhost:8080/api/agents
```

Expected result:

```text
200 OK
```

Expected response:

```json
[
  {
    "id": 1,
    "name": "Sara Support",
    "email": "sara@company.com",
    "active": true,
    "createdAt": "2026-06-24T17:00:00"
  }
]
```

If the response is an empty array, create an agent first:

```text
POST http://localhost:8080/api/agents
```

Body:

```json
{
  "name": "Sara Support",
  "email": "sara.test@company.com",
  "active": true
}
```

## 4. Frontend Test: Manager Can Create and List Users

1. Open:

```text
http://localhost:5173
```

2. Choose:

```text
Continue as Manager
```

3. Open:

```text
Users
```

4. Create a user.

Expected:

* User is created.
* User appears in the users table.
* No manual database check is needed.

## 5. Frontend Test: Manager Can Create and List Agents

1. Choose Manager role.
2. Open:

```text
Agents
```

3. Create an active agent.

Expected:

* Agent is created.
* Agent appears in the agents table.

## 6. Frontend Test: Employee Cannot Create Agent

1. Open:

```text
http://localhost:5173
```

2. Choose:

```text
Continue as Employee/User
```

Expected sidebar:

* Tickets
* Create Ticket

Expected:

* Users page is not visible.
* Agents page is not visible.
* Dashboard page is not visible.
* Reports page is not visible.

Manual URL test:

```text
http://localhost:5173/agents
```

Expected:

```text
Page not available for this role
```

## 7. Frontend Test: Agent Cannot Create Ticket

1. Choose:

```text
Continue as Agent
```

Expected sidebar:

* Dashboard
* Tickets

Manual URL test:

```text
http://localhost:5173/tickets/create
```

Expected:

```text
Page not available for this role
```

## 8. Frontend Test: Create Ticket Uses User Dropdown

1. Choose Employee/User role.
2. Open:

```text
Create Ticket
```

Expected:

* The `Raised by user ID` field is now a dropdown.
* The dropdown is populated from:

```text
GET http://localhost:8080/api/users
```

3. Select a user.
4. Create a ticket.

Expected:

* Ticket is created successfully.
* You are redirected to the ticket details page.

## 9. Frontend Test: Assign Ticket Uses Active Agent Dropdown

1. Choose Manager or Agent role.
2. Open a ticket details page.
3. Find the Assign Agent panel.

Expected:

* Agent field is a dropdown.
* Only active agents should appear.
* The dropdown is populated from:

```text
GET http://localhost:8080/api/agents
```

4. Assign an active agent.

Expected:

* Ticket assigned successfully.
* Assigned agent card updates.

## 10. Frontend Test: Status Update Role Behavior

Employee/User:

* `Changed by` is the raising user.
* Employee cannot act as agent or system.

Agent:

* `Changed by` is the assigned agent.
* If no agent is assigned, status action is disabled.

Manager:

* `Changed by` is System / Manager action.
* Request is sent as:

```json
{
  "changedByType": "SYSTEM",
  "changedById": null
}
```

## 11. Regression Test: Existing Ticket APIs Still Work

These existing endpoints should still work:

```text
GET  http://localhost:8080/api/tickets
POST http://localhost:8080/api/tickets
GET  http://localhost:8080/api/tickets/{ticketId}
POST http://localhost:8080/api/tickets/{ticketId}/assign
POST http://localhost:8080/api/tickets/{ticketId}/status
POST http://localhost:8080/api/tickets/{ticketId}/comments
GET  http://localhost:8080/api/tickets/overdue
GET  http://localhost:8080/api/tickets/metrics/avg-resolution-time
```

## 12. Verification Commands

Backend:

```bash
mvn test
```

Frontend:

```bash
cd frontend
npm run build
```

Expected:

```text
BUILD SUCCESS
```

and:

```text
vite build completed successfully
```
