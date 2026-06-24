package com.taskflow.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;
import lombok.Data;

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
}
