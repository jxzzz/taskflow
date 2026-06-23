package com.taskflow.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "用户信息更新请求")
public class UserUpdateRequest {

    @Size(min = 3, max = 50, message = "用户名长度 3-50")
    @Schema(description = "用户名")
    private String username;

    @Size(min = 6, max = 100, message = "密码长度 6-100")
    @Schema(description = "密码")
    private String password;

    @Schema(description = "头像 URL")
    private String avatar;
}
