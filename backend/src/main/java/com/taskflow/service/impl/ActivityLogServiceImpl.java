package com.taskflow.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.taskflow.dto.ActivityLogResponse;
import com.taskflow.dto.OperationLogEntry;
import com.taskflow.entity.ActivityLog;
import com.taskflow.entity.Project;
import com.taskflow.entity.ProjectMember;
import com.taskflow.mapper.ActivityLogMapper;
import com.taskflow.mapper.ProjectMapper;
import com.taskflow.mapper.ProjectMemberMapper;
import com.taskflow.service.ActivityLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActivityLogServiceImpl implements ActivityLogService {

    private final ActivityLogMapper activityLogMapper;
    private final ProjectMemberMapper projectMemberMapper;
    private final ProjectMapper projectMapper;

    @Override
    @Transactional
    public void create(OperationLogEntry entry) {
        ActivityLog log = ActivityLog.builder()
                .projectId(entry.getProjectId())
                .userId(entry.getUserId())
                .username(entry.getUsername())
                .actionType(entry.getActionType())
                .entityType(entry.getEntityType())
                .entityId(entry.getEntityId())
                .entityName(entry.getEntityName())
                .description(entry.getDescription())
                .oldValue(entry.getOldValue())
                .newValue(entry.getNewValue())
                .build();
        activityLogMapper.insert(log);
    }

    @Override
    public IPage<ActivityLogResponse> listByUser(Long userId, int page, int size) {
        // 1. 查用户参与的所有项目
        List<ProjectMember> memberships = projectMemberMapper.selectList(
                new LambdaQueryWrapper<ProjectMember>()
                        .eq(ProjectMember::getUserId, userId));
        Set<Long> memberProjectIds = memberships.stream()
                .map(ProjectMember::getProjectId)
                .collect(Collectors.toSet());

        if (memberProjectIds.isEmpty()) {
            IPage<ActivityLogResponse> emptyPage = new Page<>(page, size);
            emptyPage.setTotal(0);
            emptyPage.setRecords(Collections.emptyList());
            return emptyPage;
        }

        // 2. 分页查 activity_log
        Page<ActivityLog> pageParam = new Page<>(page, size);
        IPage<ActivityLog> logPage = activityLogMapper.selectPage(pageParam,
                new LambdaQueryWrapper<ActivityLog>()
                        .in(ActivityLog::getProjectId, memberProjectIds)
                        .orderByDesc(ActivityLog::getCreateTime));

        // 3. 批量查项目名
        Set<Long> projectIds = logPage.getRecords().stream()
                .map(ActivityLog::getProjectId)
                .collect(Collectors.toSet());
        List<Project> projects = projectMapper.selectBatchIds(projectIds);
        Map<Long, String> projectNameMap = projects.stream()
                .collect(Collectors.toMap(Project::getId, Project::getName));

        // 4. 转换
        return logPage.convert(log -> ActivityLogResponse.builder()
                .id(log.getId())
                .projectId(log.getProjectId())
                .projectName(projectNameMap.getOrDefault(log.getProjectId(), "未知项目"))
                .userId(log.getUserId())
                .username(log.getUsername())
                .actionType(log.getActionType())
                .entityType(log.getEntityType())
                .entityId(log.getEntityId())
                .entityName(log.getEntityName())
                .description(log.getDescription())
                .oldValue(log.getOldValue())
                .newValue(log.getNewValue())
                .createTime(log.getCreateTime())
                .build());
    }
}
