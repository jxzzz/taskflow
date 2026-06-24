package com.taskflow.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.taskflow.dto.ChecklistItemResponse;
import com.taskflow.entity.ChecklistItem;
import com.taskflow.entity.ProjectMember;
import com.taskflow.entity.Task;
import com.taskflow.entity.TaskList;
import com.taskflow.exception.BusinessException;
import com.taskflow.mapper.ChecklistItemMapper;
import com.taskflow.mapper.ProjectMemberMapper;
import com.taskflow.mapper.TaskListMapper;
import com.taskflow.mapper.TaskMapper;
import com.taskflow.service.ChecklistService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChecklistServiceImpl implements ChecklistService {

    private final ChecklistItemMapper checklistItemMapper;
    private final TaskMapper taskMapper;
    private final TaskListMapper taskListMapper;
    private final ProjectMemberMapper projectMemberMapper;

    @Override
    public List<ChecklistItemResponse> listByTask(Long taskId, Long currentUserId) {
        Task task = getTaskOrThrow(taskId);
        checkMember(task, currentUserId);

        return checklistItemMapper.selectList(
                new LambdaQueryWrapper<ChecklistItem>()
                        .eq(ChecklistItem::getTaskId, taskId)
                        .orderByAsc(ChecklistItem::getSortOrder))
                .stream()
                .map(ChecklistItemResponse::from)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ChecklistItemResponse create(Long taskId, String title, Long currentUserId) {
        Task task = getTaskOrThrow(taskId);
        checkMember(task, currentUserId);

        // Compute next sort order
        Long count = checklistItemMapper.selectCount(
                new LambdaQueryWrapper<ChecklistItem>()
                        .eq(ChecklistItem::getTaskId, taskId));

        ChecklistItem item = ChecklistItem.builder()
                .taskId(taskId)
                .title(title)
                .completed(false)
                .sortOrder(count.intValue())
                .build();
        checklistItemMapper.insert(item);
        return ChecklistItemResponse.from(checklistItemMapper.selectById(item.getId()));
    }

    @Override
    @Transactional
    public ChecklistItemResponse toggle(Long id, Long currentUserId) {
        ChecklistItem item = getItemOrThrow(id);
        checkMember(getTaskOrThrow(item.getTaskId()), currentUserId);

        item.setCompleted(!(item.getCompleted() != null && item.getCompleted()));
        checklistItemMapper.updateById(item);
        return ChecklistItemResponse.from(item);
    }

    @Override
    @Transactional
    public void delete(Long id, Long currentUserId) {
        ChecklistItem item = getItemOrThrow(id);
        checkMember(getTaskOrThrow(item.getTaskId()), currentUserId);
        checklistItemMapper.deleteById(id);
    }

    private Task getTaskOrThrow(Long id) {
        Task task = taskMapper.selectById(id);
        if (task == null || (task.getIsDeleted() != null && task.getIsDeleted() == 1)) {
            throw BusinessException.notFound("卡片");
        }
        return task;
    }

    private ChecklistItem getItemOrThrow(Long id) {
        ChecklistItem item = checklistItemMapper.selectById(id);
        if (item == null) {
            throw BusinessException.notFound("检查项");
        }
        return item;
    }

    private void checkMember(Task task, Long userId) {
        TaskList list = taskListMapper.selectById(task.getListId());
        if (list == null) return;
        boolean isMember = projectMemberMapper.selectCount(
                new LambdaQueryWrapper<ProjectMember>()
                        .eq(ProjectMember::getProjectId, list.getProjectId())
                        .eq(ProjectMember::getUserId, userId)) > 0;
        if (!isMember) {
            throw BusinessException.forbidden("你不是该看板的成员");
        }
    }
}
