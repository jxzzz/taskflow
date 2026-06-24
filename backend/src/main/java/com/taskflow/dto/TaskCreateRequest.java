package com.taskflow.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Schema(description = "创建卡片请求")
public class TaskCreateRequest {

    @NotBlank(message = "卡片标题不能为空")
    @Size(max = 255, message = "卡片标题不能超过255个字符")
    @Schema(description = "卡片标题", example = "用户登录优化")
    private String title;

    @Schema(description = "卡片详细描述（Markdown格式）")
    private String content;

    @Schema(description = "负责人用户ID")
    private Long assigneeId;

    @Schema(description = "优先级: 0-普通, 1-紧急, 2-非常紧急", example = "0")
    private Integer priority;

    @Schema(description = "截止日期")
    private LocalDateTime dueDate;
}
