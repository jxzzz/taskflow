package com.taskflow.service;

import com.taskflow.dto.AddMemberRequest;
import com.taskflow.dto.MemberResponse;
import com.taskflow.dto.UpdateMemberRoleRequest;

import java.util.List;

public interface ProjectMemberService {

    /** 获取项目成员列表 */
    List<MemberResponse> listMembers(Long projectId, Long currentUserId);

    /** 添加成员 */
    void addMember(Long projectId, AddMemberRequest request, Long currentUserId);

    /** 更新成员角色 */
    void updateMemberRole(Long projectId, Long userId, UpdateMemberRoleRequest request, Long currentUserId);

    /** 移除成员 */
    void removeMember(Long projectId, Long userId, Long currentUserId);
}
