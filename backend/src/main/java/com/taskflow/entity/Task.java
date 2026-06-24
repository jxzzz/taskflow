package com.taskflow.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("task")
public class Task {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long listId;

    private String title;

    /** 优先级: 0-普通, 1-紧急, 2-非常紧急 */
    private Integer priority;

    /** 截止日期 */
    private LocalDateTime dueDate;

    /** 封面颜色(hex) */
    private String coverColor;

    /** 封面图片URL */
    private String coverImage;

    private String content;

    private Long assigneeId;

    private Integer sortOrder;

    @TableLogic
    private Integer isDeleted;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
