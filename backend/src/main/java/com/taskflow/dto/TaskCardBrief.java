package com.taskflow.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 卡片简要信息（嵌套在列表下，用于看板视图）
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "卡片简要信息")
public class TaskCardBrief {

    @Schema(description = "卡片ID")
    private Long id;

    @Schema(description = "卡片标题")
    private String title;

    @Schema(description = "优先级: 0-普通, 1-紧急, 2-非常紧急")
    private Integer priority;

    @Schema(description = "负责人ID")
    private Long assigneeId;

    @Schema(description = "负责人用户名")
    private String assigneeName;

    @Schema(description = "截止日期")
    private LocalDateTime dueDate;

    @Schema(description = "排序号")
    private Integer sortOrder;

    @Schema(description = "标签数量")
    private Integer labelCount;
}
