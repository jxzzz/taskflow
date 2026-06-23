package com.taskflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * MQ 消息体：生产者发给消费者的统一结构
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageEvent {

    /** 消息唯一 ID，用于回调匹配和幂等检查 */
    private String messageId;
    /** 业务类型（task.notify / task.operation.log） */
    private String type;
    /** 业务数据，JSON 字符串 */
    private String payload;
    /** 发送时间 */
    private LocalDateTime sendTime;
}
