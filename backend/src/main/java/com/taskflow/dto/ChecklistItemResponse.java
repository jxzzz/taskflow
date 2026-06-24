package com.taskflow.dto;

import com.taskflow.entity.ChecklistItem;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "清单检查项")
public class ChecklistItemResponse {

    @Schema(description = "检查项ID")
    private Long id;

    @Schema(description = "所属任务ID")
    private Long taskId;

    @Schema(description = "检查项标题")
    private String title;

    @Schema(description = "是否完成")
    private Boolean completed;

    @Schema(description = "排序号")
    private Integer sortOrder;

    @Schema(description = "创建时间")
    private LocalDateTime createTime;

    public static ChecklistItemResponse from(ChecklistItem item) {
        return ChecklistItemResponse.builder()
                .id(item.getId())
                .taskId(item.getTaskId())
                .title(item.getTitle())
                .completed(item.getCompleted() != null && item.getCompleted())
                .sortOrder(item.getSortOrder())
                .createTime(item.getCreateTime())
                .build();
    }
}
