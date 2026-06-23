package com.taskflow.listener;

import com.taskflow.config.RabbitMQConfig;
import com.taskflow.dto.MessageEvent;
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
 *
 * 这种模式下不需要手动 ack/nack，Spring 根据方法是否抛异常自动判断。
 */
@Slf4j
@Component
public class TaskEventListener {

    /**
     * 监听任务通知队列
     */
    @RabbitListener(queues = RabbitMQConfig.QUEUE_TASK_NOTIFY)
    public void handleTaskNotify(MessageEvent event) {
        log.info("收到任务通知: id={}, payload={}", event.getMessageId(), event.getPayload());

        // ====== 业务处理 ======
        doBusiness(event);
        // 方法正常结束 → Spring 自动 ack，消息删除
        // 方法抛异常   → Spring 自动 nack，触发重试
    }

    /**
     * 监听操作日志队列
     */
    @RabbitListener(queues = RabbitMQConfig.QUEUE_OPERATION_LOG)
    public void handleOperationLog(MessageEvent event) {
        log.info("收到操作日志: id={}, payload={}", event.getMessageId(), event.getPayload());

        doBusiness(event);
    }

    /**
     * 死信队列：重试耗尽后的消息最终到这里
     * 只记录日志和 ack（不重试，防止死信堆积）
     */
    @RabbitListener(queues = RabbitMQConfig.QUEUE_TASK_DEAD)
    public void handleDeadMessage(MessageEvent event) {
        log.warn("死信消息: id={}, type={}, payload={} — 请检查原因",
                event.getMessageId(), event.getType(), event.getPayload());
        // 生产环境：写入数据库告警表 / 发送钉钉通知
        // 方法正常结束 → 自动 ack，不留堆积
    }

    private void doBusiness(MessageEvent event) {
        log.info("执行业务逻辑: type={}", event.getType());
        // 真实业务写在这里
    }
}
