package com.taskflow.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.taskflow.dto.ReorderItem;
import com.taskflow.dto.TaskCardBrief;
import com.taskflow.dto.TaskListCreateRequest;
import com.taskflow.dto.TaskListSummary;
import com.taskflow.entity.ProjectMember;
import com.taskflow.entity.Task;
import com.taskflow.entity.TaskList;
import com.taskflow.entity.User;
import com.taskflow.exception.BusinessException;
import com.taskflow.mapper.ProjectMemberMapper;
import com.taskflow.mapper.TaskListMapper;
import com.taskflow.mapper.TaskMapper;
import com.taskflow.mapper.UserMapper;
import com.taskflow.service.TaskListService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskListServiceImpl implements TaskListService {

    private final TaskListMapper taskListMapper;
    private final TaskMapper taskMapper;
    private final ProjectMemberMapper projectMemberMapper;
    private final UserMapper userMapper;

    @Override
    @Transactional
    public TaskListSummary create(Long projectId, TaskListCreateRequest request, Long currentUserId) {
        checkMember(projectId, currentUserId);

        // 优先使用前端传的 sortOrder，否则自动计算 = 当前最大 + 1
        int sortOrder;
        if (request.getSortOrder() != null) {
            sortOrder = request.getSortOrder();
        } else {
            TaskList last = taskListMapper.selectOne(
                    new LambdaQueryWrapper<TaskList>()
                            .select(TaskList::getSortOrder)
                            .eq(TaskList::getProjectId, projectId)
                            .orderByDesc(TaskList::getSortOrder)
                            .last("LIMIT 1"));
            sortOrder = (last != null) ? last.getSortOrder() + 1 : 0;
        }

        TaskList list = TaskList.builder()
                .projectId(projectId)
                .name(request.getName())
                .sortOrder(sortOrder)
                .build();
        taskListMapper.insert(list);

        return buildSummary(list);
    }

    @Override
    public List<TaskListSummary> listByProject(Long projectId, Long currentUserId) {
        checkMember(projectId, currentUserId);

        List<TaskList> lists = taskListMapper.selectList(
                new LambdaQueryWrapper<TaskList>()
                        .eq(TaskList::getProjectId, projectId)
                        .orderByAsc(TaskList::getSortOrder));

        return lists.stream()
                .map(this::buildSummary)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TaskListSummary update(Long projectId, Long id, String name, Long currentUserId) {
        checkMember(projectId, currentUserId);

        TaskList list = taskListMapper.selectById(id);
        if (list == null || !list.getProjectId().equals(projectId)) {
            throw BusinessException.notFound("列表");
        }

        if (StringUtils.hasText(name)) {
            list.setName(name);
            taskListMapper.updateById(list);
        }

        return buildSummary(list);
    }

    @Override
    @Transactional
    public void delete(Long projectId, Long id, Long currentUserId) {
        checkAdminOrOwner(projectId, currentUserId);

        TaskList list = taskListMapper.selectById(id);
        if (list == null || !list.getProjectId().equals(projectId)) {
            throw BusinessException.notFound("列表");
        }

        // 级联软删除该列表下所有卡片
        List<Task> tasks = taskMapper.selectList(
                new LambdaQueryWrapper<Task>()
                        .eq(Task::getListId, id));
        for (Task task : tasks) {
            task.setIsDeleted(1);
            taskMapper.updateById(task);
        }

        // 硬删除列表
        taskListMapper.deleteById(id);
    }

    @Override
    @Transactional
    public void reorder(Long projectId, List<ReorderItem> items, Long currentUserId) {
        checkMember(projectId, currentUserId);

        for (ReorderItem item : items) {
            TaskList list = taskListMapper.selectById(item.getId());
            if (list != null && list.getProjectId().equals(projectId)) {
                list.setSortOrder(item.getSortOrder());
                taskListMapper.updateById(list);
            }
        }
    }

    // ==================== 权限校验 ====================

    private void checkMember(Long projectId, Long userId) {
        if (!isMember(projectId, userId)) {
            throw BusinessException.forbidden("你不是该看板的成员");
        }
    }

    private void checkAdminOrOwner(Long projectId, Long userId) {
        // 简化：只要 admin role = 1 或 owner
        ProjectMember member = projectMemberMapper.selectOne(
                new LambdaQueryWrapper<ProjectMember>()
                        .eq(ProjectMember::getProjectId, projectId)
                        .eq(ProjectMember::getUserId, userId));
        if (member == null || member.getRole() != 1) {
            throw BusinessException.forbidden("仅管理员或创建者可执行此操作");
        }
    }

    private boolean isMember(Long projectId, Long userId) {
        return projectMemberMapper.selectCount(
                new LambdaQueryWrapper<ProjectMember>()
                        .eq(ProjectMember::getProjectId, projectId)
                        .eq(ProjectMember::getUserId, userId)) > 0;
    }

    // ==================== 辅助方法 ====================

    private TaskListSummary buildSummary(TaskList list) {
        List<Task> tasks = taskMapper.selectList(
                new LambdaQueryWrapper<Task>()
                        .eq(Task::getListId, list.getId())
                        .eq(Task::getIsDeleted, 0)
                        .orderByAsc(Task::getSortOrder));

        List<TaskCardBrief> cards = tasks.stream()
                .map(this::buildCardBrief)
                .collect(Collectors.toList());

        return TaskListSummary.builder()
                .id(list.getId())
                .name(list.getName())
                .sortOrder(list.getSortOrder())
                .taskCount(cards.size())
                .tasks(cards)
                .build();
    }

    private TaskCardBrief buildCardBrief(Task task) {
        String assigneeName = null;
        if (task.getAssigneeId() != null) {
            User assignee = userMapper.selectById(task.getAssigneeId());
            assigneeName = assignee != null ? assignee.getUsername() : null;
        }

        return TaskCardBrief.builder()
                .id(task.getId())
                .title(task.getTitle())
                .priority(task.getPriority())
                .assigneeId(task.getAssigneeId())
                .assigneeName(assigneeName)
                .dueDate(task.getDueDate())
                .sortOrder(task.getSortOrder())
                .labelCount(0)
                .build();
    }
}
