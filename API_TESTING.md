# Manual API Testing Guide

Project: Helpdesk Ticketing System API

Base URL:

```text
http://localhost:8080
```

Use Postman, Insomnia, Thunder Client, or any REST client to test these endpoints manually.

Important Postman setting for every `POST` request:

```text
Body -> raw -> JSON
```

Do not leave the raw body type as `Text`. If it is set to `Text`, Postman sends the request as `text/plain`, and Spring Boot will not treat the body as JSON.

Also confirm this header exists:

```text
Content-Type: application/json
```

Before testing:

1. Start PostgreSQL locally.
2. Make sure database `helpdesk_db` exists.
3. Run the SQL script:

```text
desgin/schema.sql
```

4. Start the Spring Boot app:

```powershell
cd helpdesk
mvn spring-boot:run
```

The API should run on:

```text
http://localhost:8080
```

## 1. Create User

Method:

```text
POST
```

URL:

```text
http://localhost:8080/api/users
```

Body:

```json
{
  "name": "Ahmed",
  "email": "ahmed1@company.com"
}
```

Expected result:

```text
201 Created
```

Expected response example:

```json
{
  "id": 1,
  "name": "Ahmed",
  "email": "ahmed1@company.com",
  "createdAt": "2026-06-22T10:30:00"
}
```

Important:

Use a new email each time because user email must be unique.

Postman check:

```text
Body tab -> raw -> JSON
```

If Postman shows `Text` next to the raw body option, change it to `JSON`.

## 2. Create Agent

Method:

```text
POST
```

URL:

```text
http://localhost:8080/api/agents
```

Body:

```json
{
  "name": "Sara Support",
  "email": "sara1@company.com",
  "active": true
}
```

Expected result:

```text
201 Created
```

Expected response example:

```json
{
  "id": 1,
  "name": "Sara Support",
  "email": "sara1@company.com",
  "active": true,
  "createdAt": "2026-06-22T10:31:00"
}
```

Important:

Use a new email each time because agent email must be unique.

## 3. Create Inactive Agent

This is useful for testing the inactive-agent assignment rule.

Method:

```text
POST
```

URL:

```text
http://localhost:8080/api/agents
```

Body:

```json
{
  "name": "Inactive Agent",
  "email": "inactive1@company.com",
  "active": false
}
```

Expected result:

```text
201 Created
```

Save the returned `id` for the inactive-agent test.

## 4. Create Ticket

Method:

```text
POST
```

URL:

```text
http://localhost:8080/api/tickets
```

Body:

```json
{
  "title": "Laptop not working",
  "description": "My laptop cannot connect to Wi-Fi",
  "priority": "HIGH",
  "category": "IT",
  "raisedByUserId": 1
}
```

Expected result:

```text
201 Created
```

Expected response checks:

```text
status = OPEN
assignedAgent = null
priority = HIGH
slaDueAt is not null
statusHistory contains one OPEN record
```

Important:

`raisedByUserId` must be an existing user ID.

## 5. Create Ticket With Missing User

This tests `404 Not Found`.

Method:

```text
POST
```

URL:

```text
http://localhost:8080/api/tickets
```

Body:

```json
{
  "title": "Missing user test",
  "description": "This should fail because the user does not exist",
  "priority": "HIGH",
  "category": "IT",
  "raisedByUserId": 99999
}
```

Expected result:

```text
404 Not Found
```

## 6. Assign Ticket to Active Agent

Method:

```text
POST
```

URL:

```text
http://localhost:8080/api/tickets/1/assign
```

Body:

```json
{
  "agentId": 1
}
```

Expected result:

```text
200 OK
```

Expected response checks:

```text
assignedAgent.id = 1
assignedAgent.active = true
```

Important:

Replace `1` in `/api/tickets/1/assign` with the real ticket ID.

## 7. Assign Ticket to Inactive Agent

This tests `409 Conflict`.

Method:

```text
POST
```

URL:

```text
http://localhost:8080/api/tickets/1/assign
```

Body:

```json
{
  "agentId": 2
}
```

Expected result:

```text
409 Conflict
```

Expected message:

```text
Cannot assign ticket to inactive agent
```

Important:

Use the ID of the inactive agent created earlier.

## 8. Add User Comment

Method:

```text
POST
```

URL:

```text
http://localhost:8080/api/tickets/1/comments
```

Body:

```json
{
  "authorType": "USER",
  "authorId": 1,
  "message": "Please update me about this issue."
}
```

Expected result:

```text
201 Created
```

Expected response checks:

```text
authorType = USER
authorId = 1
message is saved
```

Important:

The user must be the same user who raised the ticket.

## 9. Add Agent Comment

Method:

```text
POST
```

URL:

```text
http://localhost:8080/api/tickets/1/comments
```

Body:

```json
{
  "authorType": "AGENT",
  "authorId": 1,
  "message": "I am checking the laptop network settings."
}
```

Expected result:

```text
201 Created
```

Expected response checks:

```text
authorType = AGENT
authorId = assigned agent ID
message is saved
```

Important:

The agent must be assigned to the ticket before adding an agent comment.

## 10. Add Comment From Wrong User

This tests invalid comment author.

First create another user:

```text
POST http://localhost:8080/api/users
```

Body:

```json
{
  "name": "Wrong User",
  "email": "wronguser1@company.com"
}
```

Then try to comment on ticket `1` using that new user ID.

Method:

```text
POST
```

URL:

```text
http://localhost:8080/api/tickets/1/comments
```

Body:

```json
{
  "authorType": "USER",
  "authorId": 2,
  "message": "I should not be allowed to comment as user."
}
```

Expected result:

```text
409 Conflict
```

Expected message:

```text
Only the user who raised the ticket can add a user comment
```

## 11. Invalid Status Transition: OPEN to CLOSED

This confirms the status state machine rejects invalid transitions.

Method:

```text
POST
```

URL:

```text
http://localhost:8080/api/tickets/1/status
```

Body:

```json
{
  "newStatus": "CLOSED",
  "changedByType": "AGENT",
  "changedById": 1
}
```

Expected result:

```text
409 Conflict
```

Expected message:

```text
Invalid status transition from OPEN to CLOSED
```

## 12. Valid Status Update: OPEN to IN_PROGRESS

Method:

```text
POST
```

URL:

```text
http://localhost:8080/api/tickets/1/status
```

Body:

```json
{
  "newStatus": "IN_PROGRESS",
  "changedByType": "AGENT",
  "changedById": 1
}
```

Expected result:

```text
200 OK
```

Expected response checks:

```text
status = IN_PROGRESS
statusHistory contains OPEN -> IN_PROGRESS
```

## 13. Invalid Status Transition: IN_PROGRESS to OPEN

Method:

```text
POST
```

URL:

```text
http://localhost:8080/api/tickets/1/status
```

Body:

```json
{
  "newStatus": "OPEN",
  "changedByType": "AGENT",
  "changedById": 1
}
```

Expected result:

```text
409 Conflict
```

Expected message:

```text
Invalid status transition from IN_PROGRESS to OPEN
```

## 14. Valid Status Update: IN_PROGRESS to RESOLVED

Method:

```text
POST
```

URL:

```text
http://localhost:8080/api/tickets/1/status
```

Body:

```json
{
  "newStatus": "RESOLVED",
  "changedByType": "AGENT",
  "changedById": 1
}
```

Expected result:

```text
200 OK
```

Expected response checks:

```text
status = RESOLVED
resolvedAt is not null
statusHistory contains IN_PROGRESS -> RESOLVED
```

## 15. Invalid Status Transition: RESOLVED to OPEN

Method:

```text
POST
```

URL:

```text
http://localhost:8080/api/tickets/1/status
```

Body:

```json
{
  "newStatus": "OPEN",
  "changedByType": "USER",
  "changedById": 1
}
```

Expected result:

```text
409 Conflict
```

Expected message:

```text
Invalid status transition from RESOLVED to OPEN
```

## 16. Valid Status Update: RESOLVED to CLOSED

Method:

```text
POST
```

URL:

```text
http://localhost:8080/api/tickets/1/status
```

Body:

```json
{
  "newStatus": "CLOSED",
  "changedByType": "AGENT",
  "changedById": 1
}
```

Expected result:

```text
200 OK
```

Expected response checks:

```text
status = CLOSED
closedAt is not null
statusHistory contains RESOLVED -> CLOSED
```

## 17. Assign CLOSED Ticket

This tests that closed tickets cannot be assigned.

Method:

```text
POST
```

URL:

```text
http://localhost:8080/api/tickets/1/assign
```

Body:

```json
{
  "agentId": 1
}
```

Expected result:

```text
409 Conflict
```

Expected message:

```text
Cannot assign a CLOSED ticket
```

## 18. Invalid Status Transition: CLOSED to IN_PROGRESS

Method:

```text
POST
```

URL:

```text
http://localhost:8080/api/tickets/1/status
```

Body:

```json
{
  "newStatus": "IN_PROGRESS",
  "changedByType": "AGENT",
  "changedById": 1
}
```

Expected result:

```text
409 Conflict
```

Expected message:

```text
Invalid status transition from CLOSED to IN_PROGRESS
```

## 19. Valid Reopen: CLOSED to REOPENED

Method:

```text
POST
```

URL:

```text
http://localhost:8080/api/tickets/1/status
```

Body:

```json
{
  "newStatus": "REOPENED",
  "changedByType": "USER",
  "changedById": 1
}
```

Expected result:

```text
200 OK
```

Expected response checks:

```text
status = REOPENED
statusHistory contains CLOSED -> REOPENED
```

## 20. Valid Reopen Flow: REOPENED to IN_PROGRESS

Method:

```text
POST
```

URL:

```text
http://localhost:8080/api/tickets/1/status
```

Body:

```json
{
  "newStatus": "IN_PROGRESS",
  "changedByType": "AGENT",
  "changedById": 1
}
```

Expected result:

```text
200 OK
```

Expected response checks:

```text
status = IN_PROGRESS
statusHistory contains REOPENED -> IN_PROGRESS
```

## 21. Get Ticket Details

Method:

```text
GET
```

URL:

```text
http://localhost:8080/api/tickets/1
```

Expected result:

```text
200 OK
```

Expected response contains:

```text
ticket information
raisedByUser
assignedAgent
comments
statusHistory
```

## 22. Get Missing Ticket

Method:

```text
GET
```

URL:

```text
http://localhost:8080/api/tickets/99999
```

Expected result:

```text
404 Not Found
```

## 23. Search Tickets by Status

Method:

```text
GET
```

URL:

```text
http://localhost:8080/api/tickets?status=IN_PROGRESS
```

Expected result:

```text
200 OK
```

Expected response:

```text
List of tickets with status IN_PROGRESS
```

## 24. Search Tickets by Priority and Category

Method:

```text
GET
```

URL:

```text
http://localhost:8080/api/tickets?priority=HIGH&category=IT
```

Expected result:

```text
200 OK
```

Expected response:

```text
List of HIGH priority tickets in category IT
```

## 25. Search Tickets by Assigned Agent and Status

Method:

```text
GET
```

URL:

```text
http://localhost:8080/api/tickets?assignedAgentId=1&status=IN_PROGRESS
```

Expected result:

```text
200 OK
```

Expected response:

```text
List of tickets assigned to agent 1 with status IN_PROGRESS
```

## 26. Average Resolution Time

Method:

```text
GET
```

URL:

```text
http://localhost:8080/api/tickets/metrics/avg-resolution-time
```

Expected result:

```text
200 OK
```

Expected response example:

```json
{
  "agentId": null,
  "category": null,
  "averageResolutionHours": 0.25,
  "averageResolutionSeconds": 900.0
}
```

Important:

Only tickets with `resolvedAt` not null are included.

## 27. Average Resolution Time by Agent

Method:

```text
GET
```

URL:

```text
http://localhost:8080/api/tickets/metrics/avg-resolution-time?agentId=1
```

Expected result:

```text
200 OK
```

## 28. Average Resolution Time by Category

Method:

```text
GET
```

URL:

```text
http://localhost:8080/api/tickets/metrics/avg-resolution-time?category=IT
```

Expected result:

```text
200 OK
```

## 29. Average Resolution Time by Agent and Category

Method:

```text
GET
```

URL:

```text
http://localhost:8080/api/tickets/metrics/avg-resolution-time?agentId=1&category=IT
```

Expected result:

```text
200 OK
```

## 30. List Overdue Tickets

Method:

```text
GET
```

URL:

```text
http://localhost:8080/api/tickets/overdue
```

Expected result:

```text
200 OK
```

Expected response:

```text
List of tickets where:
- status is not RESOLVED
- status is not CLOSED
- current time is after slaDueAt
```

Important:

New tickets may not appear as overdue because their SLA due time is in the future.

## 31. Force an Overdue Ticket for Manual Testing

Create a new ticket:

```text
POST http://localhost:8080/api/tickets
```

Body:

```json
{
  "title": "Printer not working",
  "description": "The printer is not printing documents",
  "priority": "LOW",
  "category": "Office",
  "raisedByUserId": 1
}
```

Then update it directly in PostgreSQL:

```sql
UPDATE tickets
SET sla_due_at = NOW() - INTERVAL '1 hour'
WHERE id = 2;
```

Then test:

```text
GET http://localhost:8080/api/tickets/overdue
```

Expected result:

```text
The ticket appears in the overdue list.
```

## 32. Validation Error Test

Method:

```text
POST
```

URL:

```text
http://localhost:8080/api/users
```

Body:

```json
{
  "name": "",
  "email": "not-an-email"
}
```

Expected result:

```text
400 Bad Request
```

Expected response includes validation errors.

## 33. Invalid Enum Test

Method:

```text
POST
```

URL:

```text
http://localhost:8080/api/tickets
```

Body:

```json
{
  "title": "Invalid priority",
  "description": "This should fail",
  "priority": "URGENT",
  "category": "IT",
  "raisedByUserId": 1
}
```

Expected result:

```text
400 Bad Request
```

Reason:

```text
URGENT is not a valid Priority enum.
```

## 34. Expected Error Response Format

Example:

```json
{
  "status": 409,
  "error": "Conflict",
  "message": "Invalid status transition from OPEN to CLOSED",
  "timestamp": "2026-06-22T10:30:00",
  "path": "/api/tickets/1/status",
  "details": null
}
```

## 35. Database Verification

After manual API testing, verify data in PostgreSQL:

```sql
SELECT * FROM users;
SELECT * FROM agents;
SELECT * FROM sla_policies;
SELECT * FROM tickets;
SELECT * FROM comments;
SELECT * FROM ticket_status_history;
```

If the records appear in these tables, the API is connected to local PostgreSQL correctly.

## 36. Recommended Manual Test Order

Use this order for a clean test:

1. Create user.
2. Create active agent.
3. Create inactive agent.
4. Create ticket.
5. Assign ticket to active agent.
6. Add user comment.
7. Add agent comment.
8. Try invalid `OPEN -> CLOSED`.
9. Update `OPEN -> IN_PROGRESS`.
10. Try invalid `IN_PROGRESS -> OPEN`.
11. Update `IN_PROGRESS -> RESOLVED`.
12. Try invalid `RESOLVED -> OPEN`.
13. Update `RESOLVED -> CLOSED`.
14. Try assigning the closed ticket.
15. Try invalid `CLOSED -> IN_PROGRESS`.
16. Reopen ticket using `CLOSED -> REOPENED`.
17. Continue reopen flow using `REOPENED -> IN_PROGRESS`.
18. Get ticket details.
19. Search tickets.
20. Check average resolution time.
21. Check overdue tickets.
