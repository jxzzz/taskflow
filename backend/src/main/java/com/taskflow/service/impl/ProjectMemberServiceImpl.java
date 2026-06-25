package com.taskflow.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.taskflow.dto.AddMemberRequest;
import com.taskflow.dto.MemberResponse;
import com.taskflow.dto.UpdateMemberRoleRequest;
import com.taskflow.entity.Project;
import com.taskflow.entity.ProjectMember;
import com.taskflow.entity.User;
import com.taskflow.exception.BusinessException;
import com.taskflow.mapper.ProjectMapper;
import com.taskflow.mapper.ProjectMemberMapper;
import com.taskflow.mapper.UserMapper;
import com.taskflow.service.ProjectMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectMemberServiceImpl implements ProjectMemberService {

    private final ProjectMemberMapper projectMemberMapper;
    private final ProjectMapper projectMapper;
    private final UserMapper userMapper;

    @Override
    public List<MemberResponse> listMembers(Long projectId, Long currentUserId) {
        checkMember(projectId, currentUserId);

        List<ProjectMember> members = projectMemberMapper.selectList(
                new LambdaQueryWrapper<ProjectMember>()
                        .eq(ProjectMember::getProjectId, projectId)
                        .orderByAsc(ProjectMember::getJoinTime));

        if (members.isEmpty()) {
            return new ArrayList<>();
        }

        // 批量查用户信息
        List<Long> userIds = members.stream().map(ProjectMember::getUserId).toList();
        List<User> users = userMapper.selectBatchIds(userIds);
        Map<Long, User> userMap = users.stream().collect(Collectors.toMap(User::getId, u -> u));

        return members.stream().map(m -> {
            User u = userMap.get(m.getUserId());
            return MemberResponse.builder()
                    .userId(m.getUserId())
                    .username(u != null ? u.getUsername() : "未知用户")
                    .avatar(u != null ? u.getAvatar() : null)
                    .role(m.getRole())
                    .joinTime(m.getJoinTime())
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void addMember(Long projectId, AddMemberRequest request, Long currentUserId) {
        checkAdminOrOwner(projectId, currentUserId);

        // 检查用户是否存在
        User user = userMapper.selectById(request.getUserId());
        if (user == null) {
            throw BusinessException.notFound("用户");
        }

        // 检查是否已是成员
        Long count = projectMemberMapper.selectCount(
                new LambdaQueryWrapper<ProjectMember>()
                        .eq(ProjectMember::getProjectId, projectId)
                        .eq(ProjectMember::getUserId, request.getUserId()));
        if (count > 0) {
            throw BusinessException.badRequest("该用户已是项目成员");
        }

        int role = request.getRole() != null ? request.getRole() : 0;

        ProjectMember member = ProjectMember.builder()
                .projectId(projectId)
                .userId(request.getUserId())
                .role(role)
                .build();
        projectMemberMapper.insert(member);
    }

    @Override
    @Transactional
    public void updateMemberRole(Long projectId, Long userId, UpdateMemberRoleRequest request, Long currentUserId) {
        checkOwner(projectId, currentUserId);

        ProjectMember member = projectMemberMapper.selectOne(
                new LambdaQueryWrapper<ProjectMember>()
                        .eq(ProjectMember::getProjectId, projectId)
                        .eq(ProjectMember::getUserId, userId));
        if (member == null) {
            throw BusinessException.notFound("成员");
        }

        member.setRole(request.getRole());
        projectMemberMapper.updateById(member);
    }

    @Override
    @Transactional
    public void removeMember(Long projectId, Long userId, Long currentUserId) {
        // owner 不能被移除
        Project project = projectMapper.selectById(projectId);
        if (project != null && project.getOwnerId().equals(userId)) {
            throw BusinessException.badRequest("不能移除项目所有者");
        }

        // 普通成员只能由 admin/owner 移除；admin 只能由 owner 移除
        ProjectMember target = projectMemberMapper.selectOne(
                new LambdaQueryWrapper<ProjectMember>()
                        .eq(ProjectMember::getProjectId, projectId)
                        .eq(ProjectMember::getUserId, userId));
        if (target == null) {
            throw BusinessException.notFound("成员");
        }

        // 自己可以退出项目（不需要 admin 权限）
        if (userId.equals(currentUserId)) {
            projectMemberMapper.delete(
                    new LambdaQueryWrapper<ProjectMember>()
                            .eq(ProjectMember::getProjectId, projectId)
                            .eq(ProjectMember::getUserId, userId));
            return;
        }

        // 移除他人需要 admin/owner 权限
        checkAdminOrOwner(projectId, currentUserId);

        // admin 只能被 owner 移除
        if (target.getRole() == 1) {
            checkOwner(projectId, currentUserId);
        }

        projectMemberMapper.delete(
                new LambdaQueryWrapper<ProjectMember>()
                        .eq(ProjectMember::getProjectId, projectId)
                        .eq(ProjectMember::getUserId, userId));
    }

    // ==================== 权限校验 ====================

    private void checkMember(Long projectId, Long userId) {
        Long count = projectMemberMapper.selectCount(
                new LambdaQueryWrapper<ProjectMember>()
                        .eq(ProjectMember::getProjectId, projectId)
                        .eq(ProjectMember::getUserId, userId));
        if (count == 0) {
            throw BusinessException.forbidden("你不是该项目的成员");
        }
    }

    private void checkAdminOrOwner(Long projectId, Long userId) {
        Project project = projectMapper.selectById(projectId);
        if (project != null && project.getOwnerId().equals(userId)) {
            return;
        }
        ProjectMember member = projectMemberMapper.selectOne(
                new LambdaQueryWrapper<ProjectMember>()
                        .eq(ProjectMember::getProjectId, projectId)
                        .eq(ProjectMember::getUserId, userId));
        if (member == null || member.getRole() != 1) {
            throw BusinessException.forbidden("仅管理员或所有者可以执行此操作");
        }
    }

    private void checkOwner(Long projectId, Long userId) {
        Project project = projectMapper.selectById(projectId);
        if (project == null || !project.getOwnerId().equals(userId)) {
            throw BusinessException.forbidden("仅项目所有者可以执行此操作");
        }
    }
}
