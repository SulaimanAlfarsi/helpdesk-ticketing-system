INSERT INTO sla_policies (priority, sla_hours)
VALUES
    ('CRITICAL', 4),
    ('HIGH', 24),
    ('MEDIUM', 72),
    ('LOW', 168)
    ON CONFLICT (priority) DO UPDATE
                                  SET sla_hours = EXCLUDED.sla_hours;
