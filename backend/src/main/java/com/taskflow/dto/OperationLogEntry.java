package com.taskflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * MQ 操作日志消息体
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OperationLogEntry {

    private String actionType;

    private String entityType;

    private Long entityId;

    private String entityName;

    private Long userId;

    private String username;

    private Long projectId;

    private String description;

    private String oldValue;

    private String newValue;

    private Long timestamp;
}
