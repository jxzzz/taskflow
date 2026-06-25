package com.taskflow.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
@Schema(description = "更新看板请求")
public class ProjectUpdateRequest {

    @Size(min = 1, max = 100, message = "看板名称不能超过100个字符")
    @Schema(description = "看板名称")
    private String name;

    @Size(max = 255, message = "看板描述不能超过255个字符")
    @Schema(description = "看板描述")
    private String description;

    @Size(max = 500, message = "项目地址不能超过500个字符")
    @Schema(description = "项目地址")
    private String projectUrl;

    @Schema(description = "是否公开: 默认false仅自己可见, true所有人可见")
    private Boolean isPublic;

    @Schema(description = "项目状态: active=进行中, completed=已完成, archived=已归档")
    private String status;

    @Schema(description = "项目开始日期")
    private LocalDate startDate;

    @Schema(description = "项目截止日期")
    private LocalDate endDate;
}
