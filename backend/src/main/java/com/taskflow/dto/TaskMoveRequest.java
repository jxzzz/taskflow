package com.taskflow.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
@Schema(description = "移动卡片请求")
public class TaskMoveRequest {

    @NotNull(message = "目标列表ID不能为空")
    @Schema(description = "目标列表ID")
    private Long targetListId;

    @NotNull(message = "排序号不能为空")
    @PositiveOrZero(message = "排序号不能为负数")
    @Schema(description = "在目标列表中的排序位置")
    private Integer sortOrder;
}
