-- Marketing performance numbers per project, entered manually (mirrors the reference CRM's
-- Hisobotlar/Reports page) - distinct from `budget` above, which is the client contract value
-- used as revenue in the Finance dashboard.
ALTER TABLE projects
    ADD COLUMN report_budget NUMERIC(14, 2),
    ADD COLUMN report_leads INT,
    ADD COLUMN report_cpl NUMERIC(12, 2),
    ADD COLUMN report_sales INT,
    ADD COLUMN report_roi NUMERIC(6, 2);
