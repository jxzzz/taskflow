package com.taskflow.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.taskflow.dto.UserRegisterRequest;
import com.taskflow.dto.UserResponse;
import com.taskflow.dto.UserUpdateRequest;

import java.util.List;

public interface UserService {

    UserResponse register(UserRegisterRequest request);

    UserResponse getById(Long id);

    UserResponse getByUsername(String username);

    List<UserResponse> search(String keyword);

    IPage<UserResponse> list(int page, int size);

    UserResponse update(Long id, UserUpdateRequest request);

    void delete(Long id);
}
