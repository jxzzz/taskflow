package com.taskflow.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Schema(description = "添加成员请求")
public class AddMemberRequest {

    @NotNull(message = "用户ID不能为空")
    @Schema(description = "用户 ID")
    private Long userId;

    @Schema(description = "角色: 0-普通成员, 1-管理员，默认0")
    private Integer role;
}
