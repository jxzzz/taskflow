package com.taskflow.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "成员信息响应")
public class MemberResponse {

    @Schema(description = "用户 ID")
    private Long userId;

    @Schema(description = "用户名")
    private String username;

    @Schema(description = "头像 URL")
    private String avatar;

    @Schema(description = "角色: 0-普通成员, 1-管理员")
    private Integer role;

    @Schema(description = "加入时间")
    private LocalDateTime joinTime;
}
