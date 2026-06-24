package com.taskflow.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "卡片响应")
public class TaskResponse {

    @Schema(description = "卡片ID")
    private Long id;

    @Schema(description = "所属列表ID")
    private Long listId;

    @Schema(description = "所属列表名称")
    private String listName;

    @Schema(description = "卡片标题")
    private String title;

    @Schema(description = "优先级: 0-普通, 1-紧急, 2-非常紧急")
    private Integer priority;

    @Schema(description = "优先级文本: 普通/紧急/非常紧急")
    private String priorityLabel;

    @Schema(description = "卡片详细描述（Markdown）")
    private String content;

    @Schema(description = "负责人ID")
    private Long assigneeId;

    @Schema(description = "负责人用户名")
    private String assigneeName;

    @Schema(description = "负责人头像")
    private String assigneeAvatar;

    @Schema(description = "截止日期")
    private LocalDateTime dueDate;

    @Schema(description = "是否已逾期")
    private Boolean isOverdue;

    @Schema(description = "封面颜色(hex)")
    private String coverColor;

    @Schema(description = "封面图片URL")
    private String coverImage;

    @Schema(description = "排序号")
    private Integer sortOrder;

    @Schema(description = "标签数量")
    private Integer labelCount;

    @Schema(description = "清单数量")
    private Integer checklistCount;

    @Schema(description = "已完成清单数")
    private Integer completedChecklistCount;

    @Schema(description = "评论数量")
    private Integer commentCount;

    @Schema(description = "附件数量")
    private Integer attachmentCount;

    @Schema(description = "检查项列表")
    private List<ChecklistItemResponse> checklistItems;

    @Schema(description = "创建时间")
    private LocalDateTime createTime;

    @Schema(description = "更新时间")
    private LocalDateTime updateTime;
}
