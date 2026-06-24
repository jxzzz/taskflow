package com.taskflow.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
@Schema(description = "排序项")
public class ReorderItem {

    @NotNull(message = "ID不能为空")
    @Schema(description = "要排序的元素ID")
    private Long id;

    @NotNull(message = "排序号不能为空")
    @PositiveOrZero(message = "排序号不能为负数")
    @Schema(description = "新的排序号")
    private Integer sortOrder;
}
