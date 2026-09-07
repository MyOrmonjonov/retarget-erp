package uz.taskapp.project;

import org.springframework.stereotype.Component;
import uz.taskapp.task.TaskEntity;
import uz.taskapp.task.TaskRepository;
import uz.taskapp.task.TaskStatus;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * A project's progress is purely its own tasks' completion ratio (completed / total, both
 * counting only non-deleted tasks linked to the project) - explicitly NOT blended with content
 * plan items, per the user's own spec: completing every task in a project must bring it to
 * 100%, regardless of what state its content plan is in. An earlier version of this calculator
 * folded content plan items into the same ratio (ported from the reference CRM's
 * calculateProjectAggregate); that meant a project with all tasks done but a content plan still
 * in progress never reached 100%, which is exactly the bug this was rewritten to fix.
 *
 * Shared between ProjectService (project list/detail responses) and DashboardService (the
 * "Loyihalar holati" panel) so both surfaces show the same live-computed percentage instead
 * of the unused, always-zero ProjectEntity.progress column.
 */
@Component
public class ProjectProgressCalculator {
    private final TaskRepository taskRepository;

    public ProjectProgressCalculator(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    /** total/done task counts alongside the rounded percentage, so the UI can show the raw
     *  "done/total" fraction next to the ring, not just the percentage. */
    public record ProgressStat(int total, int done, int percentage) {
    }

    public Map<Long, ProgressStat> computeStats(List<Long> projectIds) {
        if (projectIds.isEmpty()) return Map.of();
        Map<Long, long[]> totals = new LinkedHashMap<>(); // [total, done]
        for (Long id : projectIds) totals.put(id, new long[2]);
        for (TaskEntity task : taskRepository.findAllByProjectIdInAndDeletedAtIsNull(projectIds)) {
            long[] stat = totals.get(task.getProjectId());
            if (stat == null) continue;
            stat[0]++;
            if (task.getStatus() == TaskStatus.COMPLETED) stat[1]++;
        }
        Map<Long, ProgressStat> result = new LinkedHashMap<>();
        totals.forEach((id, stat) -> result.put(id, new ProgressStat((int) stat[0], (int) stat[1],
                stat[0] == 0 ? 0 : (int) Math.round(stat[1] * 100.0 / stat[0]))));
        return result;
    }

    public Map<Long, Integer> computeProgress(List<Long> projectIds) {
        Map<Long, Integer> result = new LinkedHashMap<>();
        computeStats(projectIds).forEach((id, stat) -> result.put(id, stat.percentage()));
        return result;
    }
}
