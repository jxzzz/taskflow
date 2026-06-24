package com.taskflow.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

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

    @Schema(description = "内容摘要（前120字符）")
    private String contentSnippet;

    @Schema(description = "优先级: 0-普通, 1-紧急, 2-非常紧急")
    private Integer priority;

    @Schema(description = "负责人ID")
    private Long assigneeId;

    @Schema(description = "负责人用户名")
    private String assigneeName;

    @Schema(description = "截止日期")
    private LocalDateTime dueDate;

    @Schema(description = "是否已逾期")
    private Boolean isOverdue;

    @Schema(description = "封面颜色(hex)")
    private String coverColor;

    @Schema(description = "排序号")
    private Integer sortOrder;

    @Schema(description = "清单进度: 已完成数")
    private Integer completedChecklistCount;

    @Schema(description = "清单进度: 总数")
    private Integer checklistCount;

    @Schema(description = "评论数")
    private Integer commentCount;

    @Schema(description = "标签数量")
    private Integer labelCount;

    @Schema(description = "前5个检查项")
    private List<ChecklistItemResponse> checklistItems;
}
