-- Optional link from a task to a parent task, making it a subtask (e.g. a Dizayn bo'limi "TZ"
-- containing several independent sub-tasks). ON DELETE CASCADE - unlike project_id's SET NULL -
-- because a subtask is meaningless once its parent TZ is gone.
ALTER TABLE tasks
    ADD COLUMN parent_task_id BIGINT REFERENCES tasks(id) ON DELETE CASCADE;

CREATE INDEX idx_tasks_parent ON tasks (parent_task_id) WHERE deleted_at IS NULL;
