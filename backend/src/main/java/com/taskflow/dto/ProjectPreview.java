package com.taskflow.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "看板预览（Dashboard 用）")
public class ProjectPreview {

    @Schema(description = "看板ID")
    private Long id;

    @Schema(description = "看板名称")
    private String name;

    @Schema(description = "看板描述")
    private String description;

    @Schema(description = "创建者用户名")
    private String ownerName;

    @Schema(description = "成员数量")
    private Integer memberCount;

    @Schema(description = "列表数量")
    private Integer listCount;

    @Schema(description = "卡片总数")
    private Integer taskCount;

    @Schema(description = "是否公开")
    private Boolean isPublic;

    @Schema(description = "项目状态: active=进行中, completed=已完成, archived=已归档")
    private String status;

    @Schema(description = "项目开始日期")
    private LocalDate startDate;

    @Schema(description = "项目截止日期")
    private LocalDate endDate;

    @Schema(description = "创建时间")
    private LocalDateTime createTime;
}
