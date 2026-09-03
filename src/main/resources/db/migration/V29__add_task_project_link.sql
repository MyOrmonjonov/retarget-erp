-- Optional link from a task to a project. Nullable and ON DELETE SET NULL so tasks survive a
-- project deletion (unlinked) rather than being cascade-deleted - tasks are workspace-wide in
-- this app, not owned by a project the way the reference CRM's task model is.
ALTER TABLE tasks
    ADD COLUMN project_id BIGINT REFERENCES projects(id) ON DELETE SET NULL;

CREATE INDEX idx_tasks_project ON tasks (project_id) WHERE deleted_at IS NULL;
