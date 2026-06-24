package com.taskflow.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.taskflow.dto.ProjectCreateRequest;
import com.taskflow.dto.ProjectResponse;
import com.taskflow.dto.ProjectUpdateRequest;
import com.taskflow.dto.ChecklistItemResponse;
import com.taskflow.dto.TaskCardBrief;
import com.taskflow.dto.TaskListSummary;
import com.taskflow.entity.ChecklistItem;
import com.taskflow.entity.Project;
import com.taskflow.entity.ProjectMember;
import com.taskflow.entity.Task;
import com.taskflow.entity.TaskList;
import com.taskflow.entity.User;
import com.taskflow.exception.BusinessException;
import com.taskflow.mapper.ProjectMapper;
import com.taskflow.mapper.ProjectMemberMapper;
import com.taskflow.mapper.ChecklistItemMapper;
import com.taskflow.mapper.TaskListMapper;
import com.taskflow.mapper.TaskMapper;
import com.taskflow.mapper.UserMapper;
import com.taskflow.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {

    private final ProjectMapper projectMapper;
    private final ProjectMemberMapper projectMemberMapper;
    private final UserMapper userMapper;
    private final TaskListMapper taskListMapper;
    private final TaskMapper taskMapper;
    private final ChecklistItemMapper checklistItemMapper;

    @Override
    @Transactional
    public ProjectResponse create(ProjectCreateRequest request, Long currentUserId) {
        // 1. 插入看板
        Project project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .projectUrl(request.getProjectUrl())
                .isPublic(request.getIsPublic() != null ? request.getIsPublic() : false)
                .ownerId(currentUserId)
                .build();
        projectMapper.insert(project);

        // 2. 创建者自动成为 admin 成员
        ProjectMember member = ProjectMember.builder()
                .projectId(project.getId())
                .userId(currentUserId)
                .role(1) // admin
                .build();
        projectMemberMapper.insert(member);

        // 3. 重新查询以获取数据库生成的 createTime
        project = projectMapper.selectById(project.getId());
        return buildResponse(project, currentUserId);
    }

    @Override
    public IPage<ProjectResponse> listMyProjects(int page, int size, String filter, Long currentUserId) {
        // 查询当前用户参与的所有 project_id
        List<ProjectMember> memberships = projectMemberMapper.selectList(
                new LambdaQueryWrapper<ProjectMember>()
                        .eq(ProjectMember::getUserId, currentUserId));
        Set<Long> memberProjectIds = memberships.stream()
                .map(ProjectMember::getProjectId)
                .collect(Collectors.toSet());

        Page<Project> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<Project> query = new LambdaQueryWrapper<>();

        if ("my".equals(filter)) {
            // 只查我参与的
            if (memberProjectIds.isEmpty()) {
                IPage<ProjectResponse> emptyPage = new Page<>(page, size);
                emptyPage.setTotal(0);
                emptyPage.setRecords(Collections.emptyList());
                return emptyPage;
            }
            query.in(Project::getId, memberProjectIds);
        } else if ("public".equals(filter)) {
            // 只查公开且非参与的
            query.eq(Project::getIsPublic, true);
            if (!memberProjectIds.isEmpty()) {
                query.notIn(Project::getId, memberProjectIds);
            }
        } else {
            // 全部：我参与的 OR 公开的
            if (!memberProjectIds.isEmpty()) {
                query.and(w -> w.in(Project::getId, memberProjectIds).or().eq(Project::getIsPublic, true));
            } else {
                query.eq(Project::getIsPublic, true);
            }
        }

        query.orderByDesc(Project::getCreateTime);
        IPage<Project> projectPage = projectMapper.selectPage(pageParam, query);
        return projectPage.convert(p -> buildResponse(p, currentUserId));
    }

    @Override
    public ProjectResponse getById(Long id, Long currentUserId) {
        Project project = getProjectOrThrow(id);
        // 公开项目允许任何人查看
        if (!Boolean.TRUE.equals(project.getIsPublic())) {
            checkMember(id, currentUserId);
        }
        return buildDetailResponse(project);
    }

    @Override
    @Transactional
    public ProjectResponse update(Long id, ProjectUpdateRequest request, Long currentUserId) {
        Project project = getProjectOrThrow(id);
        checkAdminOrOwner(id, currentUserId);

        if (StringUtils.hasText(request.getName())) {
            project.setName(request.getName());
        }
        if (request.getDescription() != null) {
            project.setDescription(request.getDescription());
        }
        if (request.getProjectUrl() != null) {
            project.setProjectUrl(request.getProjectUrl());
        }
        if (request.getIsPublic() != null) {
            project.setIsPublic(request.getIsPublic());
        }

        projectMapper.updateById(project);
        return buildResponse(project, currentUserId);
    }

    @Override
    @Transactional
    public void delete(Long id, Long currentUserId) {
        Project project = getProjectOrThrow(id);
        checkOwner(id, currentUserId);

        // 1. 级联软删除该看板所有列表下的所有卡片
        List<TaskList> lists = taskListMapper.selectList(
                new LambdaQueryWrapper<TaskList>()
                        .eq(TaskList::getProjectId, id));
        List<Long> listIds = lists.stream()
                .map(TaskList::getId)
                .collect(Collectors.toList());

        if (!listIds.isEmpty()) {
            // 软删除所有卡片
            List<Task> tasks = taskMapper.selectList(
                    new LambdaQueryWrapper<Task>()
                            .in(Task::getListId, listIds));
            for (Task task : tasks) {
                taskMapper.deleteById(task.getId());
            }

            // 删除所有列表
            for (TaskList list : lists) {
                taskListMapper.deleteById(list.getId());
            }
        }

        // 2. 删除所有成员关系
        projectMemberMapper.delete(
                new LambdaQueryWrapper<ProjectMember>()
                        .eq(ProjectMember::getProjectId, id));

        // 3. 删除看板本身
        projectMapper.deleteById(id);
    }

    // ==================== 权限校验方法 ====================

    /**
     * 校验当前用户是否是该看板的成员
     */
    private void checkMember(Long projectId, Long userId) {
        if (!isMember(projectId, userId)) {
            throw BusinessException.forbidden("你不是该看板的成员，无法访问");
        }
    }

    /**
     * 校验当前用户是否是 admin 或 owner
     */
    private void checkAdminOrOwner(Long projectId, Long userId) {
        Project project = projectMapper.selectById(projectId);
        if (project != null && project.getOwnerId().equals(userId)) {
            return; // owner 拥有最高权限
        }
        ProjectMember member = projectMemberMapper.selectOne(
                new LambdaQueryWrapper<ProjectMember>()
                        .eq(ProjectMember::getProjectId, projectId)
                        .eq(ProjectMember::getUserId, userId));
        if (member == null || member.getRole() != 1) {
            throw BusinessException.forbidden("仅看板管理员或创建者可以执行此操作");
        }
    }

    /**
     * 校验当前用户是否是 owner
     */
    private void checkOwner(Long projectId, Long userId) {
        Project project = projectMapper.selectById(projectId);
        if (project == null || !project.getOwnerId().equals(userId)) {
            throw BusinessException.forbidden("仅看板创建者可以执行此操作");
        }
    }

    /**
     * 判断是否是成员
     */
    private boolean isMember(Long projectId, Long userId) {
        return projectMemberMapper.selectCount(
                new LambdaQueryWrapper<ProjectMember>()
                        .eq(ProjectMember::getProjectId, projectId)
                        .eq(ProjectMember::getUserId, userId)) > 0;
    }

    // ==================== 辅助方法 ====================

    private Project getProjectOrThrow(Long id) {
        Project project = projectMapper.selectById(id);
        if (project == null) {
            throw BusinessException.notFound("看板");
        }
        return project;
    }

    /**
     * 构建 ProjectResponse，包含成员数量和列表数量
     */
    private ProjectResponse buildResponse(Project project, Long currentUserId) {
        // 查询 owner 用户名
        User owner = userMapper.selectById(project.getOwnerId());
        String ownerName = owner != null ? owner.getUsername() : null;

        // 统计成员数量
        Long memberCount = projectMemberMapper.selectCount(
                new LambdaQueryWrapper<ProjectMember>()
                        .eq(ProjectMember::getProjectId, project.getId()));

        // 当前用户是否为成员
        boolean isMember = currentUserId != null && isMember(project.getId(), currentUserId);

        // 统计列表数量
        Long listCount = taskListMapper.selectCount(
                new LambdaQueryWrapper<TaskList>()
                        .eq(TaskList::getProjectId, project.getId()));

        return ProjectResponse.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .projectUrl(project.getProjectUrl())
                .isPublic(project.getIsPublic() != null ? project.getIsPublic() : false)
                .isMember(isMember)
                .ownerId(project.getOwnerId())
                .ownerName(ownerName)
                .memberCount(memberCount != null ? memberCount.intValue() : 0)
                .listCount(listCount != null ? listCount.intValue() : 0)
                .createTime(project.getCreateTime())
                .build();
    }

    /**
     * 构建包含列表和卡片的看板详情
     */
    private ProjectResponse buildDetailResponse(Project project) {
        ProjectResponse response = buildResponse(project);

        // 查询所有列表（按 sortOrder 排序）
        List<TaskList> lists = taskListMapper.selectList(
                new LambdaQueryWrapper<TaskList>()
                        .eq(TaskList::getProjectId, project.getId())
                        .orderByAsc(TaskList::getSortOrder));

        // 为每个列表构建 TaskListSummary（含卡片）
        List<TaskListSummary> listSummaries = lists.stream()
                .map(this::buildListSummary)
                .collect(Collectors.toList());

        response.setLists(listSummaries);
        return response;
    }

    /**
     * 构建单个列表摘要（含卡片列表）
     */
    private TaskListSummary buildListSummary(TaskList list) {
        // 查询该列表下未删除的卡片
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

    /**
     * 构建卡片简要信息
     */
    private TaskCardBrief buildCardBrief(Task task) {
        String assigneeName = null;
        if (task.getAssigneeId() != null) {
            User assignee = userMapper.selectById(task.getAssigneeId());
            assigneeName = assignee != null ? assignee.getUsername() : null;
        }

        // Content snippet: first 120 chars, strip markdown markers
        String contentSnippet = null;
        if (task.getContent() != null && !task.getContent().isEmpty()) {
            String plain = task.getContent()
                    .replaceAll("[#*`>\\[\\]()!]", "")
                    .replaceAll("\\s+", " ")
                    .trim();
            contentSnippet = plain.length() > 120 ? plain.substring(0, 120) + "..." : plain;
        }

        boolean isOverdue = task.getDueDate() != null
                && task.getDueDate().isBefore(LocalDateTime.now());

        // Checklist counts + first 5 items
        List<ChecklistItem> allItems = checklistItemMapper.selectList(
                new LambdaQueryWrapper<ChecklistItem>()
                        .eq(ChecklistItem::getTaskId, task.getId())
                        .orderByAsc(ChecklistItem::getSortOrder));
        int checklistCount = allItems.size();
        int completedCount = (int) allItems.stream()
                .filter(i -> i.getCompleted() != null && i.getCompleted())
                .count();
        List<ChecklistItemResponse> previewItems = allItems.stream()
                .limit(5)
                .map(ChecklistItemResponse::from)
                .collect(Collectors.toList());

        return TaskCardBrief.builder()
                .id(task.getId())
                .title(task.getTitle())
                .contentSnippet(contentSnippet)
                .priority(task.getPriority())
                .assigneeId(task.getAssigneeId())
                .assigneeName(assigneeName)
                .dueDate(task.getDueDate())
                .isOverdue(isOverdue)
                .coverColor(task.getCoverColor())
                .sortOrder(task.getSortOrder())
                .completedChecklistCount(completedCount)
                .checklistCount(checklistCount)
                .commentCount(0)
                .labelCount(0)
                .checklistItems(previewItems)
                .build();
    }
}
