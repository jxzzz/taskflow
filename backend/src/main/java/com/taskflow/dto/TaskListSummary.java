package com.taskflow.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 列表摘要（嵌套在看板详情下，含卡片列表）
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "看板列表摘要（含卡片）")
public class TaskListSummary {

    @Schema(description = "列表ID")
    private Long id;

    @Schema(description = "列表名称")
    private String name;

    @Schema(description = "排序号")
    private Integer sortOrder;

    @Schema(description = "该列表下的卡片列表")
    private List<TaskCardBrief> tasks;

    @Schema(description = "卡片数量")
    private Integer taskCount;
}
