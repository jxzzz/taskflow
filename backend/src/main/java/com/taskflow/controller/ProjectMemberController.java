package com.taskflow.controller;

import com.taskflow.dto.*;
import com.taskflow.service.ProjectMemberService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "项目成员接口", description = "项目成员管理")
@RestController
@RequestMapping("/api/v1/projects/{projectId}/members")
@RequiredArgsConstructor
public class ProjectMemberController {

    private final ProjectMemberService projectMemberService;

    @Operation(summary = "获取成员列表")
    @GetMapping
    public ApiResponse<List<MemberResponse>> list(
            @Parameter(description = "项目ID") @PathVariable Long projectId) {
        Long currentUserId = getCurrentUserId();
        return ApiResponse.success(projectMemberService.listMembers(projectId, currentUserId));
    }

    @Operation(summary = "添加成员")
    @PostMapping
    public ApiResponse<Void> add(
            @Parameter(description = "项目ID") @PathVariable Long projectId,
            @Valid @RequestBody AddMemberRequest request) {
        Long currentUserId = getCurrentUserId();
        projectMemberService.addMember(projectId, request, currentUserId);
        return ApiResponse.success("添加成功", null);
    }

    @Operation(summary = "更新成员角色")
    @PutMapping("/{userId}")
    public ApiResponse<Void> updateRole(
            @Parameter(description = "项目ID") @PathVariable Long projectId,
            @Parameter(description = "用户ID") @PathVariable Long userId,
            @Valid @RequestBody UpdateMemberRoleRequest request) {
        Long currentUserId = getCurrentUserId();
        projectMemberService.updateMemberRole(projectId, userId, request, currentUserId);
        return ApiResponse.success("更新成功", null);
    }

    @Operation(summary = "移除成员")
    @DeleteMapping("/{userId}")
    public ApiResponse<Void> remove(
            @Parameter(description = "项目ID") @PathVariable Long projectId,
            @Parameter(description = "用户ID") @PathVariable Long userId) {
        Long currentUserId = getCurrentUserId();
        projectMemberService.removeMember(projectId, userId, currentUserId);
        return ApiResponse.success("移除成功", null);
    }

    private Long getCurrentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
