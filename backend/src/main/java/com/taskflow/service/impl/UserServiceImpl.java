package com.taskflow.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.taskflow.dto.UserRegisterRequest;
import com.taskflow.dto.UserResponse;
import com.taskflow.dto.UserUpdateRequest;
import com.taskflow.entity.User;
import com.taskflow.exception.BusinessException;
import com.taskflow.mapper.UserMapper;
import com.taskflow.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public UserResponse register(UserRegisterRequest request) {
        // 检查用户名重复
        if (userMapper.selectCount(new LambdaQueryWrapper<User>()
                .eq(User::getUsername, request.getUsername())) > 0) {
            throw BusinessException.badRequest("用户名已存在");
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .avatar(request.getAvatar())
                .build();

        userMapper.insert(user);
        return toResponse(user);
    }

    @Override
    public UserResponse getById(Long id) {
        User user = userMapper.selectById(id);
        if (user == null) {
            throw BusinessException.notFound("用户");
        }
        return toResponse(user);
    }

    @Override
    public UserResponse getByUsername(String username) {
        User user = userMapper.selectOne(new LambdaQueryWrapper<User>()
                .eq(User::getUsername, username));
        if (user == null) {
            throw BusinessException.notFound("用户");
        }
        return toResponse(user);
    }

    @Override
    public List<UserResponse> search(String keyword) {
        List<User> users = userMapper.selectList(
                new LambdaQueryWrapper<User>()
                        .like(User::getUsername, keyword)
                        .last("LIMIT 10"));
        return users.stream().map(this::toResponse).toList();
    }

    @Override
    public IPage<UserResponse> list(int page, int size) {
        Page<User> pageParam = new Page<>(page, size);
        IPage<User> userPage = userMapper.selectPage(pageParam,
                new LambdaQueryWrapper<User>().orderByDesc(User::getCreateTime));

        return userPage.convert(this::toResponse);
    }

    @Override
    @Transactional
    public UserResponse update(Long id, UserUpdateRequest request) {
        User user = userMapper.selectById(id);
        if (user == null) {
            throw BusinessException.notFound("用户");
        }

        if (StringUtils.hasText(request.getUsername())) {
            // 检查新用户名是否被占用
            User existUser = userMapper.selectOne(new LambdaQueryWrapper<User>()
                    .eq(User::getUsername, request.getUsername())
                    .ne(User::getId, id));
            if (existUser != null) {
                throw BusinessException.badRequest("用户名已存在");
            }
            user.setUsername(request.getUsername());
        }

        if (StringUtils.hasText(request.getPassword())) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        if (request.getAvatar() != null) {
            user.setAvatar(request.getAvatar());
        }

        userMapper.updateById(user);
        return toResponse(userMapper.selectById(id));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        User user = userMapper.selectById(id);
        if (user == null) {
            throw BusinessException.notFound("用户");
        }
        userMapper.deleteById(id);
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .avatar(user.getAvatar())
                .createTime(user.getCreateTime())
                .updateTime(user.getUpdateTime())
                .build();
    }
}
