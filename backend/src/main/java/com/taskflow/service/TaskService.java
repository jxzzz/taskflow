package com.taskflow.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.taskflow.dto.ReorderItem;
import com.taskflow.dto.TaskCreateRequest;
import com.taskflow.dto.TaskMoveRequest;
import com.taskflow.dto.TaskResponse;
import com.taskflow.dto.TaskUpdateRequest;

import java.util.List;

public interface TaskService {

    /**
     * 在列表中创建卡片，自动放到最后
     */
    TaskResponse create(Long listId, TaskCreateRequest request, Long currentUserId);

    /**
     * 获取列表下的卡片（分页）
     */
    IPage<TaskResponse> listByList(Long listId, int page, int size, Long currentUserId);

    /**
     * 获取卡片详情
     */
    TaskResponse getById(Long id, Long currentUserId);

    /**
     * 更新卡片字段
     */
    TaskResponse update(Long id, TaskUpdateRequest request, Long currentUserId);

    /**
     * 删除卡片（软删除）
     */
    void delete(Long id, Long currentUserId);

    /**
     * 移动卡片到另一个列表
     */
    TaskResponse move(Long id, TaskMoveRequest request, Long currentUserId);

    /**
     * 同列表内批量排序
     */
    void reorder(Long listId, List<ReorderItem> items, Long currentUserId);
}
