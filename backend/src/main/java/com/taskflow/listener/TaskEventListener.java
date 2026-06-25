package com.taskflow.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskflow.config.RabbitMQConfig;
import com.taskflow.dto.MessageEvent;
import com.taskflow.dto.OperationLogEntry;
import com.taskflow.service.ActivityLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

/**
 * MQ 消费者：AUTO 确认模式 + 重试 + 死信兜底
 *
 * 消息生命周期（全自动）：
 * 1. 消费者收到消息
 * 2. 处理成功 → Spring 自动 ack，删除消息
 * 3. 抛异常    → Spring 自动 nack，按重试配置重新投递
 * 4. 重试 3 次仍失败 → RabbitMQ 自动转发到死信队列
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class TaskEventListener {

    private final ActivityLogService activityLogService;
    private final ObjectMapper objectMapper;

    /**
     * 监听任务通知队列
     */
    @RabbitListener(queues = RabbitMQConfig.QUEUE_TASK_NOTIFY)
    public void handleTaskNotify(MessageEvent event) {
        log.info("收到任务通知: id={}, payload={}", event.getMessageId(), event.getPayload());
        // TODO: 任务通知业务逻辑
    }

    /**
     * 监听操作日志队列 — 反序列化并持久化到 activity_log 表
     */
    @RabbitListener(queues = RabbitMQConfig.QUEUE_OPERATION_LOG)
    public void handleOperationLog(MessageEvent event) {
        log.info("收到操作日志: id={}, type={}", event.getMessageId(), event.getType());
        try {
            OperationLogEntry entry = objectMapper.readValue(
                    event.getPayload(), OperationLogEntry.class);
            activityLogService.create(entry);
            log.info("操作日志已持久化: actionType={}, entityType={}, entityId={}",
                    entry.getActionType(), entry.getEntityType(), entry.getEntityId());
        } catch (Exception e) {
            log.error("处理操作日志失败: id={}, payload={}", event.getMessageId(), event.getPayload(), e);
            throw new RuntimeException("操作日志处理失败", e); // 触发重试
        }
    }

    /**
     * 死信队列：重试耗尽后的消息最终到这里
     */
    @RabbitListener(queues = RabbitMQConfig.QUEUE_TASK_DEAD)
    public void handleDeadMessage(MessageEvent event) {
        log.warn("死信消息: id={}, type={}, payload={} — 请检查原因",
                event.getMessageId(), event.getType(), event.getPayload());
    }
}
