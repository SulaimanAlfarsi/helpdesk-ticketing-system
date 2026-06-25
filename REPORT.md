# Helpdesk Ticketing System Project Report

Date: 2026-06-25

## 1. Challenges Faced While Working on the Project

### Backend and frontend endpoint alignment

One of the main challenges was keeping the frontend aligned with the backend API. The improvement guide described these list endpoints:

```text
GET /api/users
GET /api/agents
```

However, the backend implementation in the current branch exposes:

```text
GET /api/users/all
GET /api/agents/all
```

This created a mismatch between the documentation and the actual running API. If the frontend only followed the guide, the dropdowns and list pages would fail against the current backend. If the frontend only followed the current backend, it would not match the documented target behavior.

### Moving from manual IDs to data-driven forms

The original frontend required users to manually type IDs when creating tickets or assigning agents. This was difficult to use and easy to break because the user had to know valid database IDs before submitting a form.

The main challenge was replacing manual ID fields with dropdowns while keeping the backend payload format the same. The backend still expects numeric IDs, so the frontend needed to display readable labels while submitting the correct numeric values.

### Role-based UI without real authentication

The project intentionally does not include Spring Security, JWT, login, or backend authorization. This means role behavior is controlled only in the frontend through the selected role stored in local storage.

The challenge was making the UI feel role-aware while being clear that it is not secure authentication. The frontend needed to hide pages and disable actions for the selected role, but the report and UI also needed to avoid implying that this is real security.

### Keeping state synchronized after create and assign actions

After creating a user or agent, the page needed to immediately show the new record. After assigning a ticket, the assigned agent card and status/comment actor options needed to update correctly.

This required reloading data after successful actions and carefully updating local component state so the UI did not show stale information.

### Active-agent filtering

The backend supports inactive agents, and tickets should only be assigned to active agents. The frontend had to load all agents, filter only active ones for the assignment dropdown, and disable assignment if no active agents exist.

### Verification environment issues

The frontend production build worked successfully, but the Vite development server initially failed inside the restricted execution environment because it could not read an ancestor directory while loading the Vite config. The server was then started outside the sandbox and verified successfully.

## 2. Issues and Bugs Identified

### Users page did not list users

The Users page only displayed the most recently created user. It did not fetch or display the full user list from the backend.

Impact:

* Managers could create users but could not confirm the full user list from the UI.
* The manual testing guide expected a users table, but the page did not provide one.

### Agents page did not list agents

The Agents page only displayed the most recently created agent. It did not fetch or display the full agent list from the backend.

Impact:

* Managers could create agents but could not confirm the full agent list from the UI.
* Active and inactive agent status was not visible in a table.

### Create Ticket used a manual user ID field

The Create Ticket page used a text input for `raisedByUserId`.

Impact:

* Employees had to know a valid user ID before creating a ticket.
* Invalid or empty IDs could be submitted more easily.
* The frontend did not match the improvement guide, which required a user dropdown.

### Ticket assignment used a manual agent ID field

The Ticket Details page used a text input for assigning an agent.

Impact:

* Managers and agents had to know valid agent IDs.
* Inactive agents could still be typed manually, causing backend errors.
* The frontend did not match the expected active-agent dropdown behavior.

### API documentation did not exactly match backend routes

The improvement guide documented `GET /api/users` and `GET /api/agents`, while the backend currently exposes `GET /api/users/all` and `GET /api/agents/all`.

Impact:

* A frontend built exactly from the guide would fail against the current branch.
* Manual testers could call the documented endpoints and get unexpected results.

### Backend verification depended on local PostgreSQL

The backend test starts the Spring Boot context and connects to PostgreSQL at:

```text
jdbc:postgresql://localhost:5432/helpdesk_db
```

Impact:

* Tests can fail if PostgreSQL is not running or the database is missing.
* The test is more like an integration environment check than an isolated unit test.

## 3. How the Issues Were Resolved

### Added frontend API helpers for lists

The frontend API layer now includes helpers for loading users and agents.

Resolution:

* Added `getUsers`.
* Added `getAgents`.
* Each helper first tries the documented endpoint.
* If the documented endpoint returns `404` or `405`, the helper falls back to the current `/all` endpoint.

This keeps the frontend compatible with both the improvement guide and the current backend branch.

### Updated the Users page

The Users page now loads users from the backend when the page opens.

Resolution:

* Added loading state.
* Added users table.
* Added empty state text.
* Reloaded the user list after successfully creating a user.
* Added required fields for name and email.

### Updated the Agents page

The Agents page now loads agents from the backend when the page opens.

Resolution:

* Added loading state.
* Added agents table.
* Displayed each agent active status.
* Reloaded the agent list after successfully creating an agent.
* Added required fields for name and email.

### Updated the Create Ticket page

The Create Ticket page now uses a dropdown populated from the backend user list.

Resolution:

* Loaded users when the page opens.
* Replaced the manual user ID input with a select field.
* Displayed readable user labels with IDs.
* Submitted the selected user ID as a number.
* Disabled ticket creation when no users are available.

### Updated the Ticket Details assignment panel

The ticket assignment panel now uses a dropdown populated from the backend agent list.

Resolution:

* Loaded agents for Agent and Manager roles.
* Filtered the dropdown to active agents only.
* Disabled assignment when no active agents are available.
* Submitted the selected agent ID as a number.
* Updated ticket state after successful assignment.

### Verified the implementation

The backend was verified with:

```bash
cd helpdesk
mvn test
```

Result:

```text
BUILD SUCCESS
Tests run: 1, Failures: 0, Errors: 0, Skipped: 0
```

The frontend was verified with:

```bash
cd frontend
npm run build
```

Result:

```text
vite build completed successfully
```

The frontend development server was also verified at:

```text
http://127.0.0.1:5173
```

Result:

```text
200 OK
```

## 4. Technical Decisions Made by the Team

### Keep permissions frontend-only

The project requirement states that there is no authentication, JWT, or Spring Security. Because of that, the team kept role restrictions in the frontend only.

Decision:

* Continue using the selected local role for UI behavior.
* Hide pages from the sidebar when a role should not access them.
* Show an access denied page for restricted manual URLs.
* Clearly document that this is not real backend security.

Reason:

This matches the current project scope and avoids adding a large security layer outside the assignment requirement.

### Use dropdowns instead of manual IDs

The team decided to replace manual ID entry with dropdowns wherever possible.

Decision:

* Use a user dropdown when creating tickets.
* Use an active-agent dropdown when assigning tickets.
* Still submit numeric IDs to the backend.

Reason:

This improves usability while preserving the backend API contract.

### Preserve backend API compatibility

Because the guide and backend routes did not match exactly, the frontend was made compatible with both.

Decision:

* Try `GET /api/users` and `GET /api/agents` first.
* Fall back to `GET /api/users/all` and `GET /api/agents/all`.

Reason:

This prevents the frontend from breaking while the backend and documentation are being aligned.

### Filter inactive agents in the frontend assignment workflow

The backend rejects assignment to inactive agents. The frontend now prevents inactive agents from being selected in the first place.

Decision:

* Display all agents on the Agents page.
* Show only active agents in the ticket assignment dropdown.

Reason:

This reduces avoidable backend validation errors and makes the UI behavior match the business rule.

### Keep changes scoped

The team avoided unrelated refactoring and focused on the improvements required by the testing guide.

Decision:

* Update only the API helper and affected pages.
* Keep existing page layout, role system, and backend DTOs.
* Avoid introducing new state management libraries.

Reason:

The existing React component state was sufficient for the current workflows, and adding a larger architecture would increase complexity without clear benefit.

## 5. Suggestions for Improving the Original Project

### Align backend routes with the documentation

The project should choose one route style and use it consistently.

Recommended option:

```text
GET /api/users
GET /api/agents
```

Reason:

These routes are REST-friendly and already documented in `IMPROVEMENTS_TESTING.md`.

### Add backend tests for the new list endpoints

The current backend test only verifies that the Spring context loads. More useful tests should be added.

Suggested tests:

* Creating a user and then listing users.
* Creating an agent and then listing agents.
* Verifying inactive agents are returned by the list endpoint.
* Verifying duplicate email validation.
* Verifying invalid email validation.

### Add frontend automated tests

The frontend currently relies on manual testing and production build verification.

Suggested tests:

* Role sidebar visibility.
* Access denied page behavior.
* Users page list rendering.
* Agents page list rendering.
* Create Ticket dropdown population.
* Active-agent filtering in the assignment dropdown.

### Add a dedicated test database setup

Backend tests currently depend on local PostgreSQL configuration.

Suggested improvements:

* Use Testcontainers for PostgreSQL integration tests.
* Or use a separate test profile with a predictable test database.
* Ensure tests can run cleanly on another machine without manual database setup.

### Add real authentication and authorization for production use

The current frontend role selector is useful for testing, but it is not secure.

Suggested improvements:

* Add Spring Security.
* Add login.
* Add JWT or session-based authentication.
* Enforce permissions in backend controllers or services.
* Keep frontend role checks only as a usability layer.

### Improve API error handling in the frontend

The frontend already displays backend error messages, but it could be improved.

Suggested improvements:

* Show field-level validation errors near form inputs.
* Add retry actions for failed list loads.
* Add clearer empty states for missing users or agents.
* Add toast notifications for successful actions.

### Add update and deactivate workflows

The project supports creating users and agents, but not editing them from the frontend.

Suggested improvements:

* Edit user name and email.
* Edit agent name and email.
* Activate or deactivate agents from the Agents page.
* Prevent deactivation warnings when an agent has open tickets.

### Improve ticket workflow guidance

The ticket status machine has valid and invalid transitions, but the frontend currently shows all statuses.

Suggested improvements:

* Only show valid next statuses for the current ticket.
* Disable invalid transitions before submitting.
* Display a clear status lifecycle.
* Show who is allowed to perform each transition.

## 6. Lessons Learned from the Exercise

### Documentation and implementation must stay synchronized

The endpoint mismatch showed that even small differences between documentation and code can create confusion and bugs. API documentation should be updated at the same time as backend routes, and frontend code should be checked against the real running API.

### User-friendly frontend design reduces backend errors

Replacing manual ID inputs with dropdowns made the frontend easier to use and reduced the chance of invalid requests. A better UI can prevent many avoidable backend validation failures.

### Frontend permissions are not security

The role selector is useful for testing workflows, but it does not protect the backend. Real security must be enforced on the server. This distinction is important when explaining project behavior.

### State refresh matters after mutations

Create and assign actions change backend data. If the frontend does not reload or update state after those actions, the UI becomes stale. Refreshing users, agents, and ticket details after successful actions keeps the interface accurate.

### Business rules should be reflected in the UI

The backend rule that inactive agents cannot receive assignments is now reflected in the frontend by filtering inactive agents out of the assignment dropdown. This makes the workflow clearer and avoids preventable errors.

### Build verification is necessary but not enough

`npm run build` confirms that the frontend compiles, but it does not confirm that dropdowns are populated correctly or that role behavior works in the browser. Manual or automated interaction tests are still needed.

### Integration tests need reliable infrastructure

The backend test passed, but it depends on a running local PostgreSQL database. For stronger reliability, tests should manage their own database environment or use a dedicated test setup.

## 7. Conclusion

The project improvements made the Helpdesk Ticketing System more practical to use. Managers can now list users and agents, employees can create tickets using a user dropdown, and tickets can be assigned using an active-agent dropdown. The role-based UI behavior remains consistent with the assignment scope, and both backend and frontend verification passed.

The most important remaining improvement is to align the backend list endpoints with the documented API routes, then add automated tests for the new backend and frontend behavior.
