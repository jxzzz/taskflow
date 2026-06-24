package com.taskflow.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.taskflow.dto.ProjectCreateRequest;
import com.taskflow.dto.ProjectResponse;
import com.taskflow.dto.ProjectUpdateRequest;
import com.taskflow.entity.Project;
import com.taskflow.entity.ProjectMember;
import com.taskflow.entity.Task;
import com.taskflow.entity.TaskList;
import com.taskflow.entity.User;
import com.taskflow.exception.BusinessException;
import com.taskflow.mapper.ProjectMapper;
import com.taskflow.mapper.ProjectMemberMapper;
import com.taskflow.mapper.TaskListMapper;
import com.taskflow.mapper.TaskMapper;
import com.taskflow.mapper.UserMapper;
import com.taskflow.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

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

    @Override
    @Transactional
    public ProjectResponse create(ProjectCreateRequest request, Long currentUserId) {
        // 1. 插入看板
        Project project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
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
        return buildResponse(project);
    }

    @Override
    public IPage<ProjectResponse> listMyProjects(int page, int size, Long currentUserId) {
        // 1. 查询当前用户参与的所有 project_id
        List<ProjectMember> memberships = projectMemberMapper.selectList(
                new LambdaQueryWrapper<ProjectMember>()
                        .eq(ProjectMember::getUserId, currentUserId));
        Set<Long> projectIds = memberships.stream()
                .map(ProjectMember::getProjectId)
                .collect(Collectors.toSet());

        if (projectIds.isEmpty()) {
            // 没有参与任何看板，返回空分页
            IPage<ProjectResponse> emptyPage = new Page<>(page, size);
            emptyPage.setTotal(0);
            emptyPage.setRecords(Collections.emptyList());
            return emptyPage;
        }

        // 2. 分页查询这些看板
        Page<Project> pageParam = new Page<>(page, size);
        IPage<Project> projectPage = projectMapper.selectPage(pageParam,
                new LambdaQueryWrapper<Project>()
                        .in(Project::getId, projectIds)
                        .orderByDesc(Project::getCreateTime));

        // 3. 转换为 ProjectResponse
        return projectPage.convert(this::buildResponse);
    }

    @Override
    public ProjectResponse getById(Long id, Long currentUserId) {
        Project project = getProjectOrThrow(id);
        checkMember(id, currentUserId);
        return buildResponse(project);
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

        projectMapper.updateById(project);
        return buildResponse(project);
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
                task.setIsDeleted(1);
                taskMapper.updateById(task);
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
    private ProjectResponse buildResponse(Project project) {
        // 查询 owner 用户名
        User owner = userMapper.selectById(project.getOwnerId());
        String ownerName = owner != null ? owner.getUsername() : null;

        // 统计成员数量
        Long memberCount = projectMemberMapper.selectCount(
                new LambdaQueryWrapper<ProjectMember>()
                        .eq(ProjectMember::getProjectId, project.getId()));

        // 统计列表数量
        Long listCount = taskListMapper.selectCount(
                new LambdaQueryWrapper<TaskList>()
                        .eq(TaskList::getProjectId, project.getId()));

        return ProjectResponse.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .ownerId(project.getOwnerId())
                .ownerName(ownerName)
                .memberCount(memberCount != null ? memberCount.intValue() : 0)
                .listCount(listCount != null ? listCount.intValue() : 0)
                .createTime(project.getCreateTime())
                .build();
    }
}
