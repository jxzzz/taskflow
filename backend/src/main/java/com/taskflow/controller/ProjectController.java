package com.taskflow.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.taskflow.dto.ApiResponse;
import com.taskflow.dto.ProjectCreateRequest;
import com.taskflow.dto.ProjectResponse;
import com.taskflow.dto.ProjectUpdateRequest;
import com.taskflow.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@Tag(name = "看板接口", description = "看板(Project) CRUD")
@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @Operation(summary = "创建看板")
    @PostMapping
    public ApiResponse<ProjectResponse> create(@Valid @RequestBody ProjectCreateRequest request) {
        Long currentUserId = getCurrentUserId();
        return ApiResponse.success("创建成功", projectService.create(request, currentUserId));
    }

    @Operation(summary = "获取我的看板列表")
    @GetMapping
    public ApiResponse<IPage<ProjectResponse>> list(
            @Parameter(description = "页码") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "每页大小") @RequestParam(defaultValue = "20") int size) {
        Long currentUserId = getCurrentUserId();
        return ApiResponse.success(projectService.listMyProjects(page, size, currentUserId));
    }

    @Operation(summary = "获取看板详情")
    @GetMapping("/{id}")
    public ApiResponse<ProjectResponse> getById(
            @Parameter(description = "看板ID") @PathVariable Long id) {
        Long currentUserId = getCurrentUserId();
        return ApiResponse.success(projectService.getById(id, currentUserId));
    }

    @Operation(summary = "更新看板")
    @PutMapping("/{id}")
    public ApiResponse<ProjectResponse> update(
            @Parameter(description = "看板ID") @PathVariable Long id,
            @Valid @RequestBody ProjectUpdateRequest request) {
        Long currentUserId = getCurrentUserId();
        return ApiResponse.success("更新成功", projectService.update(id, request, currentUserId));
    }

    @Operation(summary = "删除看板")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(
            @Parameter(description = "看板ID") @PathVariable Long id) {
        Long currentUserId = getCurrentUserId();
        projectService.delete(id, currentUserId);
        return ApiResponse.success("删除成功", null);
    }

    /**
     * 从 JWT SecurityContext 获取当前登录用户 ID
     */
    private Long getCurrentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
