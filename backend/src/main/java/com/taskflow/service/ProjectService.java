package com.taskflow.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.taskflow.dto.ProjectCreateRequest;
import com.taskflow.dto.ProjectResponse;
import com.taskflow.dto.ProjectUpdateRequest;

public interface ProjectService {

    /**
     * 创建看板，创建者自动成为 admin 成员
     */
    ProjectResponse create(ProjectCreateRequest request, Long currentUserId);

    /**
     * 获取看板列表（分页），支持 filter 过滤
     * @param filter my=我参与的, public=公开的, null=全部
     */
    IPage<ProjectResponse> listMyProjects(int page, int size, String filter, Long currentUserId);

    /**
     * 获取看板详情，非成员无法查看
     */
    ProjectResponse getById(Long id, Long currentUserId);

    /**
     * 更新看板，仅 owner/admin 可操作
     */
    ProjectResponse update(Long id, ProjectUpdateRequest request, Long currentUserId);

    /**
     * 删除看板，仅 owner 可操作，级联删除
     */
    void delete(Long id, Long currentUserId);
}
