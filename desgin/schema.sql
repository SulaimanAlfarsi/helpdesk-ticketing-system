DROP TABLE IF EXISTS ticket_status_history;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS tickets;
DROP TABLE IF EXISTS sla_policies;
DROP TABLE IF EXISTS agents;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
                       id BIGSERIAL PRIMARY KEY,
                       name VARCHAR(100) NOT NULL,
                       email VARCHAR(255) NOT NULL UNIQUE,
                       created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE agents (
                        id BIGSERIAL PRIMARY KEY,
                        name VARCHAR(100) NOT NULL,
                        email VARCHAR(255) NOT NULL UNIQUE,
                        active BOOLEAN NOT NULL DEFAULT TRUE,
                        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sla_policies (
                              id BIGSERIAL PRIMARY KEY,
                              priority VARCHAR(20) NOT NULL UNIQUE,
                              sla_hours INTEGER NOT NULL,

                              CONSTRAINT chk_sla_priority
                                  CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),

                              CONSTRAINT chk_sla_hours_positive
                                  CHECK (sla_hours > 0)
);

CREATE TABLE tickets (
                         id BIGSERIAL PRIMARY KEY,
                         title VARCHAR(200) NOT NULL,
                         description TEXT NOT NULL,
                         priority VARCHAR(20) NOT NULL,
                         category VARCHAR(100) NOT NULL,
                         status VARCHAR(30) NOT NULL DEFAULT 'OPEN',

                         raised_by_user_id BIGINT NOT NULL,
                         assigned_agent_id BIGINT NULL,
                         sla_policy_id BIGINT NOT NULL,

                         created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                         updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                         sla_due_at TIMESTAMP NOT NULL,
                         resolved_at TIMESTAMP NULL,
                         closed_at TIMESTAMP NULL,

                         CONSTRAINT fk_ticket_user
                             FOREIGN KEY (raised_by_user_id) REFERENCES users(id),

                         CONSTRAINT fk_ticket_agent
                             FOREIGN KEY (assigned_agent_id) REFERENCES agents(id),

                         CONSTRAINT fk_ticket_sla
                             FOREIGN KEY (sla_policy_id) REFERENCES sla_policies(id),

                         CONSTRAINT chk_ticket_priority
                             CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),

                         CONSTRAINT chk_ticket_status
                             CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REOPENED'))
);

CREATE TABLE comments (
                          id BIGSERIAL PRIMARY KEY,
                          ticket_id BIGINT NOT NULL,
                          author_type VARCHAR(20) NOT NULL,
                          author_id BIGINT NOT NULL,
                          message TEXT NOT NULL,
                          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                          CONSTRAINT fk_comment_ticket
                              FOREIGN KEY (ticket_id) REFERENCES tickets(id),

                          CONSTRAINT chk_comment_author_type
                              CHECK (author_type IN ('USER', 'AGENT'))
);

CREATE TABLE ticket_status_history (
                                       id BIGSERIAL PRIMARY KEY,
                                       ticket_id BIGINT NOT NULL,
                                       from_status VARCHAR(30) NULL,
                                       to_status VARCHAR(30) NOT NULL,
                                       changed_by_type VARCHAR(20) NOT NULL,
                                       changed_by_id BIGINT NULL,
                                       changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                                       CONSTRAINT fk_history_ticket
                                           FOREIGN KEY (ticket_id) REFERENCES tickets(id),

                                       CONSTRAINT chk_history_from_status
                                           CHECK (
                                               from_status IS NULL
                                                   OR from_status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REOPENED')
                                               ),

                                       CONSTRAINT chk_history_to_status
                                           CHECK (to_status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REOPENED')),

                                       CONSTRAINT chk_history_changed_by_type
                                           CHECK (changed_by_type IN ('USER', 'AGENT', 'SYSTEM'))
);