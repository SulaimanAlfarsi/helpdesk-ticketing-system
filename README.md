# Helpdesk Ticketing System API

## 1. Project Overview

Helpdesk Ticketing System API is a backend REST API for managing internal company support tickets. Employees can create tickets, support agents can be assigned to tickets, tickets move through a fixed status lifecycle, comments can be added to tickets, and the system supports searching, overdue ticket detection, and average resolution time calculation.

The project focuses on:

* Java OOP
* Spring Boot REST API development
* SQL database design
* Business rules
* Ticket status state machine
* Layered architecture

The main purpose of this project is to demonstrate how a real backend application can be designed using clean layers, database relationships, DTOs, validation, and service-level business logic.

## 2. Scenario

A company wants to track internal support tickets raised by employees and handled by support agents. Any employee can raise a ticket with title, description, priority, and category. Tickets may be assigned to support agents, updated through a fixed lifecycle, and include comments between users and agents. Management can search tickets by status, priority, category, or assigned agent, and can view overdue tickets and average resolution time.

## 3. Main Features

* Create users: Register employees who can raise support tickets.
* Create agents: Register support agents who can be assigned to tickets.
* Create tickets: Allow employees to submit new tickets with priority and category.
* Assign ticket to agent: Assign an active support agent to an open or active ticket.
* Update ticket status: Move tickets through the allowed lifecycle only.
* Add comments to ticket: Allow the raising user or assigned agent to add messages.
* Get ticket details with comments and status history: View complete ticket information in one response.
* Search/filter tickets: Filter tickets by status, priority, category, or assigned agent.
* Calculate average resolution time: Report average time from ticket creation to resolution.
* List overdue tickets: Find tickets that passed their SLA due time and are still unresolved.
* Enforce ticket status transition rules: Reject invalid lifecycle transitions with clear errors.

## 4. Business Rules

Every ticket starts with this status:

```text
OPEN
```

Valid normal status flow:

```text
OPEN -> IN_PROGRESS -> RESOLVED -> CLOSED
```

Valid reopen flow:

```text
CLOSED -> REOPENED -> IN_PROGRESS -> RESOLVED -> CLOSED
```

Invalid transitions include:

* `OPEN -> CLOSED`
* `OPEN -> RESOLVED`
* `RESOLVED -> OPEN`
* `IN_PROGRESS -> OPEN`
* `CLOSED -> IN_PROGRESS`

Invalid transitions return:

```text
409 Conflict
```

Other rules:

* A `CLOSED` ticket cannot be assigned to an agent.
* An inactive agent cannot be assigned to a ticket.
* A ticket must be created by an existing user.
* A ticket priority must have an SLA policy.
* A comment can be written by the raising user or the assigned agent.
* Average resolution time is calculated from `created_at` to `resolved_at`.
* Overdue tickets are tickets that are not `RESOLVED` or `CLOSED` and current time is after `sla_due_at`.

## 5. SLA Rules

SLA policies define how long the company has to resolve a ticket based on priority:

* `CRITICAL` = 4 hours
* `HIGH` = 24 hours
* `MEDIUM` = 72 hours
* `LOW` = 168 hours

When a ticket is created, the API finds the SLA policy for the selected priority and calculates:

```text
sla_due_at = created_at + sla_hours
```

For example, if a `HIGH` priority ticket is created at `2026-06-22T10:00:00`, its SLA due time will be 24 hours later.

## 6. Database Design

The system uses PostgreSQL and contains the following main tables.

### users

Stores employees who raise tickets.

### agents

Stores support staff who handle tickets. Agents can be active or inactive.

### sla_policies

Stores SLA hours for each priority level.

### tickets

Stores the main ticket information, including title, description, priority, category, status, assigned agent, SLA due time, resolution time, and close time.

### comments

Stores ticket comments written by either the raising user or the assigned agent.

### ticket_status_history

Stores every ticket status change, including the previous status, new status, who changed it, and when it changed.

Relationship summary:

* One user can raise many tickets.
* One agent can be assigned to many tickets.
* One SLA policy can apply to many tickets.
* One ticket can have many comments.
* One ticket can have many status history records.

Polymorphic fields:

`comments.author_id`:

* If `author_type = USER`, `author_id` refers to `users(id)`.
* If `author_type = AGENT`, `author_id` refers to `agents(id)`.

`ticket_status_history.changed_by_id`:

* If `changed_by_type = USER`, `changed_by_id` refers to `users(id)`.
* If `changed_by_type = AGENT`, `changed_by_id` refers to `agents(id)`.
* If `changed_by_type = SYSTEM`, `changed_by_id` can be `null`.

## 7. ERD

The ERD diagram is included in the project documentation folder.

Current project path:

```text
desgin/ERD.png
```

Example documentation path:

```text
docs/ERD.png
```

## 8. Project Structure

The main Java package is:

```text
com.example.helpdesk
```

Package responsibilities:

* `controller`: REST API endpoints.
* `service`: Business logic and rules.
* `repository`: Database access using Spring Data JPA.
* `entity`: JPA entity classes mapped to database tables.
* `dto`: Request and response objects used by the API.
* `enums`: Fixed values such as `Priority`, `TicketStatus`, `AuthorType`, and `ChangedByType`.
* `exception`: Custom exceptions and global exception handler.

Business rules are placed in the service layer, not in the controller. Controllers are responsible only for receiving HTTP requests and returning HTTP responses.

## 9. API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/users` | Create user |
| `POST` | `/api/agents` | Create agent |
| `POST` | `/api/tickets` | Create ticket |
| `POST` | `/api/tickets/{ticketId}/assign` | Assign ticket to agent |
| `POST` | `/api/tickets/{ticketId}/status` | Update ticket status |
| `POST` | `/api/tickets/{ticketId}/comments` | Add comment |
| `GET` | `/api/tickets/{ticketId}` | Get ticket details with comments and history |
| `GET` | `/api/tickets` | Search/filter tickets |
| `GET` | `/api/tickets/metrics/avg-resolution-time` | Get average resolution time |
| `GET` | `/api/tickets/overdue` | List overdue tickets |

## 10. Example API Requests

### Create user

`POST /api/users`

```json
{
  "name": "Ahmed",
  "email": "ahmed@company.com"
}
```

### Create agent

`POST /api/agents`

```json
{
  "name": "Sara Support",
  "email": "sara@company.com",
  "active": true
}
```

### Create ticket

`POST /api/tickets`

```json
{
  "title": "Laptop not working",
  "description": "My laptop cannot connect to Wi-Fi",
  "priority": "HIGH",
  "category": "IT",
  "raisedByUserId": 1
}
```

### Assign ticket

`POST /api/tickets/1/assign`

```json
{
  "agentId": 1
}
```

### Update status

`POST /api/tickets/1/status`

```json
{
  "newStatus": "IN_PROGRESS",
  "changedByType": "AGENT",
  "changedById": 1
}
```

### Add comment

`POST /api/tickets/1/comments`

```json
{
  "authorType": "USER",
  "authorId": 1,
  "message": "Please update me about this issue."
}
```

### Search tickets

```text
GET /api/tickets?status=OPEN
GET /api/tickets?priority=HIGH&category=IT
GET /api/tickets?assignedAgentId=1&status=IN_PROGRESS
```

### Average resolution time

```text
GET /api/tickets/metrics/avg-resolution-time
GET /api/tickets/metrics/avg-resolution-time?agentId=1&category=IT
```

### Overdue tickets

```text
GET /api/tickets/overdue
```

## 11. Error Handling

The API uses a global exception handler to return clear JSON errors.

HTTP status codes:

* `201 Created`: Resource created successfully.
* `200 OK`: Request successful.
* `400 Bad Request`: Invalid input or validation error.
* `404 Not Found`: User, agent, ticket, or SLA policy not found.
* `409 Conflict`: Business rule violation, such as invalid ticket status transition or assigning a closed ticket.

Example error response:

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

Validation error response example:

```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "timestamp": "2026-06-22T10:30:00",
  "path": "/api/users",
  "details": {
    "email": "email must be a valid email address",
    "name": "name must not be blank"
  }
}
```

## 12. How to Run the Project Locally

1. Install Java 17.

2. Install Maven.

3. Install PostgreSQL.

4. Create the PostgreSQL database:

```sql
CREATE DATABASE helpdesk_db;
```

5. Update `helpdesk/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/helpdesk_db
spring.datasource.username=postgres
spring.datasource.password=admin123
spring.jpa.hibernate.ddl-auto=none
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
server.port=8080
```

6. Run the SQL DDL script to create the tables.

7. Insert the required SLA policies:

```text
CRITICAL = 4
HIGH = 24
MEDIUM = 72
LOW = 168
```

The included SQL script already contains these SLA seed values.

8. Run the project from the `helpdesk` directory:

```bash
mvn spring-boot:run
```

If using the Maven wrapper on Windows:

```bash
.\mvnw.cmd spring-boot:run
```

9. Test the API using Postman or curl.

## 13. Frontend Setup

The project includes a modern React + Vite frontend in the `frontend` folder.

Frontend technology:

* React + Vite
* JavaScript
* Tailwind CSS
* Axios
* React Router DOM
* Lucide React icons
* Framer Motion animations
* Google Font: Inter

Backend must be running on:

```text
http://localhost:8080
```

Frontend runs on:

```text
http://localhost:5173
```

Start the frontend:

```bash
cd frontend
npm install
npm install lucide-react framer-motion
npm run dev
```

The backend has CORS enabled for:

```text
http://localhost:5173
```

Frontend features:

* Role selector without authentication.
* Modern black-and-white admin dashboard UI.
* Sidebar navigation and top header.
* Dashboard metric cards with icons.
* Create users.
* Create agents.
* Create and search tickets.
* Ticket details with assignment, status update, comments, and status timeline.
* Reports for overdue tickets and average resolution time.

## 14. Database Setup SQL

The full PostgreSQL DDL script is included in the project under:

```text
desgin/schema.sql
```

Common documentation locations for the same script are:

```text
docs/schema.sql
src/main/resources/schema.sql
```

## 15. Testing Evidence

The API should be tested with Postman or curl. Testing should confirm both successful flows and rejected business rule violations.

Required tests:

* Create user.
* Create agent.
* Create ticket.
* Assign ticket.
* Update status using the valid flow: `OPEN -> IN_PROGRESS -> RESOLVED -> CLOSED`.
* Try invalid status transition `OPEN -> CLOSED` and confirm `409 Conflict`.
* Try assigning a `CLOSED` ticket and confirm `409 Conflict`.
* Add comment.
* Search tickets.
* Check overdue tickets.
* Check average resolution time.

The project can also be checked with Maven:

```bash
mvn test
```

Or on Windows using the Maven wrapper:

```bash
.\mvnw.cmd test
```

## 16. Assumptions

* Authentication is not required because the assignment focuses on backend domain logic.
* A ticket always starts as `OPEN`.
* A ticket can be created without an assigned agent.
* SLA is based on the ticket priority.
* The ticket priority is stored in `tickets` for easy filtering, and `sla_policy_id` is used to link the SLA rule.
* `comments.author_id` and `ticket_status_history.changed_by_id` are polymorphic references.
* `from_status` in `ticket_status_history` can be `null` only for the first ticket creation history record.
* Business rules are enforced in the service layer.

## 17. Important Design Notes

This project is designed using layered architecture. Controllers are responsible only for HTTP requests and responses. Services contain business rules such as status transition validation, SLA calculations, and assignment restrictions. Repositories are responsible only for database access.

The ticket `status` field is not freely editable. It is controlled by a state machine in the service layer. This prevents invalid transitions and keeps the ticket lifecycle consistent.

The application also uses DTOs instead of exposing entity objects directly. This makes the API clearer, safer, and easier to change in the future.

## 18. Future Improvements

* Add authentication and roles.
* Add email notifications.
* Add dashboard analytics.
* Add file attachments for tickets.
* Add pagination and sorting.
* Add unit and integration tests.
