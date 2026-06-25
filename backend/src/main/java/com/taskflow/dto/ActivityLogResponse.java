package com.taskflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 活动日志 API 响应
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityLogResponse {

    private Long id;

    private Long projectId;

    private String projectName;

    private Long userId;

    private String username;

    private String actionType;

    private String entityType;

    private Long entityId;

    private String entityName;

    private String description;

    private String oldValue;

    private String newValue;

    private LocalDateTime createTime;
}
