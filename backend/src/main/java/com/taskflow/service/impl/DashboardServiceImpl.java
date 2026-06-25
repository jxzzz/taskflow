package com.taskflow.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.taskflow.dto.DashboardResponse;
import com.taskflow.dto.ProjectPreview;
import com.taskflow.entity.Project;
import com.taskflow.entity.ProjectMember;
import com.taskflow.entity.Task;
import com.taskflow.entity.TaskList;
import com.taskflow.entity.User;
import com.taskflow.mapper.ProjectMapper;
import com.taskflow.mapper.ProjectMemberMapper;
import com.taskflow.mapper.TaskListMapper;
import com.taskflow.mapper.TaskMapper;
import com.taskflow.mapper.UserMapper;
import com.taskflow.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final ProjectMapper projectMapper;
    private final ProjectMemberMapper projectMemberMapper;
    private final UserMapper userMapper;
    private final TaskListMapper taskListMapper;
    private final TaskMapper taskMapper;

    @Override
    public DashboardResponse getOverview(Long currentUserId) {
        // 1. 当前用户参与的所有成员关系
        List<ProjectMember> memberships = projectMemberMapper.selectList(
                new LambdaQueryWrapper<ProjectMember>()
                        .eq(ProjectMember::getUserId, currentUserId));

        Set<Long> projectIds = memberships.stream()
                .map(ProjectMember::getProjectId)
                .collect(Collectors.toSet());

        long totalProjects = projectIds.size();

        // 2. 系统用户总数
        long totalUsers = userMapper.selectCount(null);

        // 3. 构建项目预览列表
        List<ProjectPreview> projectPreviews;
        if (projectIds.isEmpty()) {
            projectPreviews = Collections.emptyList();
        } else {
            List<Project> projects = projectMapper.selectList(
                    new LambdaQueryWrapper<Project>()
                            .in(Project::getId, projectIds)
                            .orderByDesc(Project::getCreateTime));

            projectPreviews = projects.stream()
                    .map(this::buildPreview)
                    .collect(Collectors.toList());
        }

        // 4. 汇总所有项目的任务总数
        long totalTasks = projectPreviews.stream()
                .mapToLong(p -> p.getTaskCount() != null ? p.getTaskCount() : 0)
                .sum();

        // 5. 公开项目（排除已参与的）
        List<Project> publicProjects = projectMapper.selectList(
                new LambdaQueryWrapper<Project>()
                        .eq(Project::getIsPublic, true)
                        .notIn(!projectIds.isEmpty(), Project::getId, projectIds)
                        .orderByDesc(Project::getCreateTime)
                        .last("LIMIT 6"));
        List<ProjectPreview> publicPreviews = publicProjects.stream()
                .map(this::buildPreview)
                .collect(Collectors.toList());
        long totalPublicProjects = projectMapper.selectCount(
                new LambdaQueryWrapper<Project>()
                        .eq(Project::getIsPublic, true)
                        .notIn(!projectIds.isEmpty(), Project::getId, projectIds));

        return DashboardResponse.builder()
                .totalProjects(totalProjects)
                .totalUsers(totalUsers)
                .totalTasks(totalTasks)
                .projects(projectPreviews)
                .totalPublicProjects(totalPublicProjects)
                .publicProjects(publicPreviews)
                .build();
    }

    /**
     * 构建单个项目的预览信息
     */
    private ProjectPreview buildPreview(Project project) {
        User owner = userMapper.selectById(project.getOwnerId());
        String ownerName = owner != null ? owner.getUsername() : null;

        long memberCount = projectMemberMapper.selectCount(
                new LambdaQueryWrapper<ProjectMember>()
                        .eq(ProjectMember::getProjectId, project.getId()));

        // 查询该项目所有列表
        List<TaskList> lists = taskListMapper.selectList(
                new LambdaQueryWrapper<TaskList>()
                        .eq(TaskList::getProjectId, project.getId()));

        int listCount = lists.size();

        // 统计该项目下所有未删除的卡片数量
        int taskCount = 0;
        if (!lists.isEmpty()) {
            List<Long> listIds = lists.stream()
                    .map(TaskList::getId)
                    .collect(Collectors.toList());
            taskCount = Math.toIntExact(taskMapper.selectCount(
                    new LambdaQueryWrapper<Task>()
                            .in(Task::getListId, listIds)
                            .eq(Task::getIsDeleted, 0)));
        }

        return ProjectPreview.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .ownerName(ownerName)
                .memberCount(Math.toIntExact(memberCount))
                .listCount(listCount)
                .taskCount(taskCount)
                .isPublic(project.getIsPublic() != null ? project.getIsPublic() : false)
                .status(project.getStatus() != null ? project.getStatus() : "active")
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .createTime(project.getCreateTime())
                .build();
    }
}
