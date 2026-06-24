package com.taskflow.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "创建看板请求")
public class ProjectCreateRequest {

    @NotBlank(message = "看板名称不能为空")
    @Size(max = 100, message = "看板名称不能超过100个字符")
    @Schema(description = "看板名称", example = "产品研发")
    private String name;

    @Size(max = 255, message = "看板描述不能超过255个字符")
    @Schema(description = "看板描述", example = "产品研发团队任务看板")
    private String description;

    @Size(max = 500, message = "项目地址不能超过500个字符")
    @Schema(description = "项目地址（GitHub / 部署链接等）", example = "https://github.com/org/repo")
    private String projectUrl;

    @Schema(description = "是否公开: 默认false仅自己可见, true所有人可见", example = "false")
    private Boolean isPublic = false;
}
