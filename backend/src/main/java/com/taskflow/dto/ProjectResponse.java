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
@Schema(description = "看板响应")
public class ProjectResponse {

    @Schema(description = "看板ID")
    private Long id;

    @Schema(description = "看板名称")
    private String name;

    @Schema(description = "看板描述")
    private String description;

    @Schema(description = "创建者ID")
    private Long ownerId;

    @Schema(description = "创建者用户名")
    private String ownerName;

    @Schema(description = "成员数量")
    private Integer memberCount;

    @Schema(description = "列表数量")
    private Integer listCount;

    @Schema(description = "创建时间")
    private LocalDateTime createTime;
}
