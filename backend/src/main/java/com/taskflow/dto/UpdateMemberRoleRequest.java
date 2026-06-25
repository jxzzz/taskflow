package com.taskflow.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Schema(description = "更新成员角色请求")
public class UpdateMemberRoleRequest {

    @NotNull(message = "角色不能为空")
    @Min(value = 0, message = "角色值无效")
    @Max(value = 1, message = "角色值无效")
    @Schema(description = "角色: 0-普通成员, 1-管理员")
    private Integer role;
}
