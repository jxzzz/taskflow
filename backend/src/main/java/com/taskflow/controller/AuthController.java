package com.taskflow.controller;

import com.taskflow.dto.*;
import com.taskflow.entity.User;
import com.taskflow.exception.BusinessException;
import com.taskflow.mapper.UserMapper;
import com.taskflow.service.UserService;
import com.taskflow.utils.JwtUtils;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@Tag(name = "认证接口", description = "登录、注册")
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Operation(summary = "用户注册")
    @PostMapping("/register")
    public ApiResponse<UserResponse> register(@Valid @RequestBody UserRegisterRequest request) {
        UserResponse user = userService.register(request);
        return ApiResponse.success("注册成功", user);
    }

    @Operation(summary = "用户登录")
    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody UserLoginRequest request) {
        User user = userMapper.selectOne(new LambdaQueryWrapper<User>()
                .eq(User::getUsername, request.getUsername()));
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw BusinessException.unauthorized("用户名或密码错误");
        }

        String token = jwtUtils.generateToken(user.getId(), user.getUsername());

        LoginResponse loginResponse = LoginResponse.builder()
                .token(token)
                .user(UserResponse.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .avatar(user.getAvatar())
                        .createTime(user.getCreateTime())
                        .updateTime(user.getUpdateTime())
                        .build())
                .build();

        return ApiResponse.success("登录成功", loginResponse);
    }

    @Operation(summary = "获取当前用户信息（用于页面刷新恢复登录态）")
    @GetMapping("/me")
    public ApiResponse<UserResponse> me() {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ApiResponse.success(userService.getById(userId));
    }
}
