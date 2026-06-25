package com.taskflow.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

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

    @Schema(description = "项目地址（GitHub / 部署链接等）")
    private String projectUrl;

    @Schema(description = "是否公开: 默认false仅自己可见, true所有人可见")
    private Boolean isPublic;

    @Schema(description = "当前用户是否为项目成员")
    private Boolean isMember;

    @Schema(description = "项目状态: active=进行中, completed=已完成, archived=已归档")
    private String status;

    @Schema(description = "项目开始日期")
    private LocalDate startDate;

    @Schema(description = "项目截止日期")
    private LocalDate endDate;

    @Schema(description = "创建时间")
    private LocalDateTime createTime;

    @Schema(description = "看板列表（含卡片），仅详情接口返回")
    private List<TaskListSummary> lists;
}
