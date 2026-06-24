package com.taskflow.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "工作台概览响应")
public class DashboardResponse {

    @Schema(description = "我参与的项目数量")
    private Long totalProjects;

    @Schema(description = "系统用户总数")
    private Long totalUsers;

    @Schema(description = "我参与的项目中所有任务总数")
    private Long totalTasks;

    @Schema(description = "我的项目预览列表")
    private List<ProjectPreview> projects;

    @Schema(description = "公开项目总数")
    private Long totalPublicProjects;

    @Schema(description = "公开项目预览列表（不包含已参与的）")
    private List<ProjectPreview> publicProjects;
}
