package com.taskflow.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.taskflow.dto.ChecklistItemResponse;
import com.taskflow.dto.ReorderItem;
import com.taskflow.dto.TaskCreateRequest;
import com.taskflow.dto.TaskMoveRequest;
import com.taskflow.dto.TaskResponse;
import com.taskflow.dto.TaskUpdateRequest;
import com.taskflow.entity.ChecklistItem;
import com.taskflow.entity.Project;
import com.taskflow.entity.ProjectMember;
import com.taskflow.entity.Task;
import com.taskflow.entity.TaskList;
import com.taskflow.entity.User;
import com.taskflow.exception.BusinessException;
import com.taskflow.mapper.ChecklistItemMapper;
import com.taskflow.mapper.ProjectMapper;
import com.taskflow.mapper.ProjectMemberMapper;
import com.taskflow.mapper.TaskListMapper;
import com.taskflow.mapper.TaskMapper;
import com.taskflow.mapper.UserMapper;
import com.taskflow.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService {

    private final TaskMapper taskMapper;
    private final TaskListMapper taskListMapper;
    private final ProjectMapper projectMapper;
    private final ProjectMemberMapper projectMemberMapper;
    private final UserMapper userMapper;
    private final ChecklistItemMapper checklistItemMapper;

    @Override
    @Transactional
    public TaskResponse create(Long listId, TaskCreateRequest request, Long currentUserId) {
        TaskList list = getTaskListOrThrow(listId);
        checkMemberByProjectId(list.getProjectId(), currentUserId);

        // 自动计算 sortOrder
        Long count = taskMapper.selectCount(
                new LambdaQueryWrapper<Task>()
                        .eq(Task::getListId, listId)
                        .eq(Task::getIsDeleted, 0));

        // 校验负责人是否是看板成员
        if (request.getAssigneeId() != null) {
            checkMemberByProjectId(list.getProjectId(), request.getAssigneeId());
        }

        Task task = Task.builder()
                .listId(listId)
                .title(request.getTitle())
                .content(request.getContent())
                .assigneeId(request.getAssigneeId())
                .priority(request.getPriority() != null ? request.getPriority() : 0)
                .dueDate(request.getDueDate())
                .sortOrder(count.intValue())
                .build();
        taskMapper.insert(task);

        // 批量创建检查项
        if (request.getChecklistItems() != null && !request.getChecklistItems().isEmpty()) {
            for (int i = 0; i < request.getChecklistItems().size(); i++) {
                String itemTitle = request.getChecklistItems().get(i);
                if (itemTitle != null && !itemTitle.isBlank()) {
                    ChecklistItem item = ChecklistItem.builder()
                            .taskId(task.getId())
                            .title(itemTitle.trim())
                            .completed(false)
                            .sortOrder(i)
                            .build();
                    checklistItemMapper.insert(item);
                }
            }
        }

        task = taskMapper.selectById(task.getId());
        return buildResponse(task);
    }

    @Override
    public IPage<TaskResponse> listByList(Long listId, int page, int size, Long currentUserId) {
        TaskList list = getTaskListOrThrow(listId);
        // 公开项目允许任何人查看
        if (!isProjectPublic(list.getProjectId())) {
            checkMemberByProjectId(list.getProjectId(), currentUserId);
        }

        Page<Task> pageParam = new Page<>(page, size);
        IPage<Task> taskPage = taskMapper.selectPage(pageParam,
                new LambdaQueryWrapper<Task>()
                        .eq(Task::getListId, listId)
                        .eq(Task::getIsDeleted, 0)
                        .orderByAsc(Task::getSortOrder));

        return taskPage.convert(this::buildResponse);
    }

    @Override
    public TaskResponse getById(Long id, Long currentUserId) {
        Task task = getTaskOrThrow(id);
        TaskList list = taskListMapper.selectById(task.getListId());
        // 公开项目允许任何人查看
        if (!isProjectPublic(list.getProjectId())) {
            checkMemberByProjectId(list.getProjectId(), currentUserId);
        }
        return buildResponse(task);
    }

    @Override
    @Transactional
    public TaskResponse update(Long id, TaskUpdateRequest request, Long currentUserId) {
        Task task = getTaskOrThrow(id);
        TaskList list = taskListMapper.selectById(task.getListId());
        checkMemberByProjectId(list.getProjectId(), currentUserId);

        if (StringUtils.hasText(request.getTitle())) {
            task.setTitle(request.getTitle());
        }
        if (request.getContent() != null) {
            task.setContent(request.getContent());
        }
        if (request.getPriority() != null) {
            task.setPriority(request.getPriority());
        }
        if (request.getDueDate() != null) {
            task.setDueDate(request.getDueDate());
        }
        // assigneeId 允许设为 null（取消指派）
        if (request.getAssigneeId() != null) {
            checkMemberByProjectId(list.getProjectId(), request.getAssigneeId());
        }
        task.setAssigneeId(request.getAssigneeId());

        taskMapper.updateById(task);
        task = taskMapper.selectById(id);
        return buildResponse(task);
    }

    @Override
    @Transactional
    public void delete(Long id, Long currentUserId) {
        Task task = getTaskOrThrow(id);
        TaskList list = taskListMapper.selectById(task.getListId());
        checkMemberByProjectId(list.getProjectId(), currentUserId);

        // 软删除：用 setSql 绕过 MyBatis-Plus @TableLogic 对 update 语句的字段拦截
        taskMapper.update(null,
                new LambdaUpdateWrapper<Task>()
                        .eq(Task::getId, id)
                        .setSql("is_deleted = 1"));
    }

    @Override
    @Transactional
    public TaskResponse move(Long id, TaskMoveRequest request, Long currentUserId) {
        Task task = getTaskOrThrow(id);
        TaskList sourceList = taskListMapper.selectById(task.getListId());
        checkMemberByProjectId(sourceList.getProjectId(), currentUserId);

        // 校验目标列表在同一个看板内
        TaskList targetList = taskListMapper.selectById(request.getTargetListId());
        if (targetList == null) {
            throw BusinessException.notFound("目标列表");
        }
        if (!targetList.getProjectId().equals(sourceList.getProjectId())) {
            throw BusinessException.badRequest("不能跨看板移动卡片");
        }

        task.setListId(request.getTargetListId());
        task.setSortOrder(request.getSortOrder());
        taskMapper.updateById(task);

        task = taskMapper.selectById(id);
        return buildResponse(task);
    }

    @Override
    @Transactional
    public void reorder(Long projectId, Long listId, List<ReorderItem> items, Long currentUserId) {
        TaskList list = getTaskListOrThrow(listId);
        if (!list.getProjectId().equals(projectId)) {
            throw BusinessException.badRequest("列表不属于该项目");
        }
        checkMemberByProjectId(projectId, currentUserId);

        // 任务 ID 全局唯一，直接按 ID 更新即可
        for (ReorderItem item : items) {
            Task task = taskMapper.selectById(item.getId());
            if (task != null) {
                task.setSortOrder(item.getSortOrder());
                taskMapper.updateById(task);
            }
        }
    }

    // ==================== 权限校验 ====================

    private boolean isProjectPublic(Long projectId) {
        Project project = projectMapper.selectById(projectId);
        return project != null && Boolean.TRUE.equals(project.getIsPublic());
    }

    private void checkMemberByProjectId(Long projectId, Long userId) {
        boolean isMember = projectMemberMapper.selectCount(
                new LambdaQueryWrapper<ProjectMember>()
                        .eq(ProjectMember::getProjectId, projectId)
                        .eq(ProjectMember::getUserId, userId)) > 0;
        if (!isMember) {
            throw BusinessException.forbidden("你不是该看板的成员");
        }
    }

    // ==================== 辅助方法 ====================

    private TaskList getTaskListOrThrow(Long id) {
        TaskList list = taskListMapper.selectById(id);
        if (list == null) {
            throw BusinessException.notFound("列表");
        }
        return list;
    }

    private Task getTaskOrThrow(Long id) {
        Task task = taskMapper.selectById(id);
        if (task == null || task.getIsDeleted() == 1) {
            throw BusinessException.notFound("卡片");
        }
        return task;
    }

    private TaskResponse buildResponse(Task task) {
        TaskList list = taskListMapper.selectById(task.getListId());
        String listName = list != null ? list.getName() : null;

        String assigneeName = null;
        String assigneeAvatar = null;
        if (task.getAssigneeId() != null) {
            User assignee = userMapper.selectById(task.getAssigneeId());
            if (assignee != null) {
                assigneeName = assignee.getUsername();
                assigneeAvatar = assignee.getAvatar();
            }
        }

        // 是否逾期
        boolean isOverdue = task.getDueDate() != null
                && task.getDueDate().isBefore(LocalDateTime.now());

        // 优先级文本
        String priorityLabel;
        if (task.getPriority() == null || task.getPriority() == 0) {
            priorityLabel = "普通";
        } else if (task.getPriority() == 1) {
            priorityLabel = "紧急";
        } else {
            priorityLabel = "非常紧急";
        }

        // 查询检查项统计
        List<ChecklistItem> checklistItems = checklistItemMapper.selectList(
                new LambdaQueryWrapper<ChecklistItem>()
                        .eq(ChecklistItem::getTaskId, task.getId()));
        int checklistCount = checklistItems.size();
        int completedChecklistCount = (int) checklistItems.stream()
                .filter(i -> i.getCompleted() != null && i.getCompleted())
                .count();
        List<ChecklistItemResponse> checklistItemResponses = checklistItems.stream()
                .map(ChecklistItemResponse::from)
                .collect(Collectors.toList());

        return TaskResponse.builder()
                .id(task.getId())
                .listId(task.getListId())
                .listName(listName)
                .title(task.getTitle())
                .priority(task.getPriority())
                .priorityLabel(priorityLabel)
                .content(task.getContent())
                .assigneeId(task.getAssigneeId())
                .assigneeName(assigneeName)
                .assigneeAvatar(assigneeAvatar)
                .dueDate(task.getDueDate())
                .isOverdue(isOverdue)
                .coverColor(task.getCoverColor())
                .coverImage(task.getCoverImage())
                .sortOrder(task.getSortOrder())
                .labelCount(0)
                .checklistCount(checklistCount)
                .completedChecklistCount(completedChecklistCount)
                .checklistItems(checklistItemResponses)
                .commentCount(0)
                .attachmentCount(0)
                .createTime(task.getCreateTime())
                .updateTime(task.getUpdateTime())
                .build();
    }
}
