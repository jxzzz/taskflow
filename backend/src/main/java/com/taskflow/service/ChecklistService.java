package com.taskflow.service;

import com.taskflow.dto.ChecklistItemResponse;

import java.util.List;

public interface ChecklistService {

    /** 获取任务下所有检查项 */
    List<ChecklistItemResponse> listByTask(Long taskId, Long currentUserId);

    /** 添加检查项 */
    ChecklistItemResponse create(Long taskId, String title, Long currentUserId);

    /** 切换完成状态 */
    ChecklistItemResponse toggle(Long id, Long currentUserId);

    /** 删除检查项 */
    void delete(Long id, Long currentUserId);
}
