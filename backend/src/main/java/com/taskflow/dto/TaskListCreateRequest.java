package com.taskflow.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "创建任务列表请求")
public class TaskListCreateRequest {

    @NotBlank(message = "列表名称不能为空")
    @Size(max = 50, message = "列表名称不能超过50个字符")
    @Schema(description = "列表名称", example = "待办")
    private String name;

    @Schema(description = "排序序号（前端传入，新建时默认为当前列表数量）", example = "0")
    private Integer sortOrder;
}
