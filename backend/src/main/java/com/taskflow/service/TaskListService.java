package com.taskflow.service;

import com.taskflow.dto.ReorderItem;
import com.taskflow.dto.TaskListCreateRequest;
import com.taskflow.dto.TaskListSummary;

import java.util.List;

public interface TaskListService {

    /**
     * 在看板中创建新列表，自动放到最后
     */
    TaskListSummary create(Long projectId, TaskListCreateRequest request, Long currentUserId);

    /**
     * 获取看板下所有列表（含卡片），按 sortOrder 排序
     */
    List<TaskListSummary> listByProject(Long projectId, Long currentUserId);

    /**
     * 更新列表名称
     */
    TaskListSummary update(Long projectId, Long id, String name, Long currentUserId);

    /**
     * 删除列表，级联软删除其下所有卡片
     */
    void delete(Long projectId, Long id, Long currentUserId);

    /**
     * 批量更新列表排序
     */
    void reorder(Long projectId, List<ReorderItem> items, Long currentUserId);
}
