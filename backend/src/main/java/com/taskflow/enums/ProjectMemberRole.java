package com.taskflow.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ProjectMemberRole {

    MEMBER(0, "普通成员"),
    ADMIN(1, "管理员");

    @EnumValue
    private final Integer code;
    private final String desc;
}
