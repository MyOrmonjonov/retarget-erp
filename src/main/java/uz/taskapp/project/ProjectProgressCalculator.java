package uz.taskapp.project;

import org.springframework.stereotype.Component;
import uz.taskapp.contentplan.ContentPlanItemEntity;
import uz.taskapp.contentplan.ContentPlanItemRepository;
import uz.taskapp.task.TaskEntity;
import uz.taskapp.task.TaskRepository;
import uz.taskapp.task.TaskStatus;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Ported from the reference CRM's calculateProjectAggregate - only the reachable subset:
 * the reference's other 4 sources (mediaPlan, project-scoped targetTasks, plans, calls) feed
 * tabs that are dead code in the reference's own UI, so for any project a real user could
 * actually build there, the formula already reduces to tasks + contentPlan (+ design tasks,
 * which in our schema are just regular tasks with a format tag, already counted once).
 *
 * Shared between ProjectService (project list/detail responses) and DashboardService (the
 * "Loyihalar holati" panel) so both surfaces show the same live-computed percentage instead
 * of the unused, always-zero ProjectEntity.progress column.
 */
@Component
public class ProjectProgressCalculator {
    private final TaskRepository taskRepository;
    private final ContentPlanItemRepository contentPlanItemRepository;

    public ProjectProgressCalculator(TaskRepository taskRepository, ContentPlanItemRepository contentPlanItemRepository) {
        this.taskRepository = taskRepository;
        this.contentPlanItemRepository = contentPlanItemRepository;
    }

    /** total/done item counts (tasks + content plan) alongside the rounded percentage, so the UI
     *  can show the raw "done/total" fraction next to the ring, not just the percentage. */
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
        for (ContentPlanItemEntity item : contentPlanItemRepository.findAllByProjectIdIn(projectIds)) {
            long[] stat = totals.get(item.getProjectId());
            if (stat == null) continue;
            stat[0]++;
            if (item.getStatuses() != null && item.getStatuses().contains("Post qilindi")) stat[1]++;
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
