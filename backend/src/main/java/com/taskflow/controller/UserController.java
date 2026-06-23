package com.taskflow.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.taskflow.dto.ApiResponse;
import com.taskflow.dto.UserResponse;
import com.taskflow.dto.UserUpdateRequest;
import com.taskflow.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Tag(name = "用户接口", description = "用户 CRUD")
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @Operation(summary = "获取用户列表")
    @GetMapping
    public ApiResponse<IPage<UserResponse>> list(
            @Parameter(description = "页码") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "每页大小") @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(userService.list(page, size));
    }

    @Operation(summary = "获取用户详情")
    @GetMapping("/{id}")
    public ApiResponse<UserResponse> getById(@Parameter(description = "用户 ID") @PathVariable Long id) {
        return ApiResponse.success(userService.getById(id));
    }

    @Operation(summary = "更新用户信息")
    @PutMapping("/{id}")
    public ApiResponse<UserResponse> update(
            @Parameter(description = "用户 ID") @PathVariable Long id,
            @Valid @RequestBody UserUpdateRequest request) {
        return ApiResponse.success("更新成功", userService.update(id, request));
    }

    @Operation(summary = "删除用户")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@Parameter(description = "用户 ID") @PathVariable Long id) {
        userService.delete(id);
        return ApiResponse.success("删除成功", null);
    }
}
