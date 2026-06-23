package com.taskflow.service;

import com.taskflow.dto.MessageEvent;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.connection.CorrelationData;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * MQ 消息生产者，封装可靠性发送逻辑
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class MessageProducer {

    private final RabbitTemplate rabbitTemplate;

    /**
     * 注册确认回调 — 在 Bean 初始化后执行一次
     */
    @PostConstruct
    public void init() {
        // 回调1：消息是否到达交换机
        rabbitTemplate.setConfirmCallback((correlationData, ack, cause) -> {
            if (correlationData == null) return;

            if (ack) {
                log.info("消息已到达交换机: id={}", correlationData.getId());
            } else {
                log.error("消息未到达交换机: id={}, cause={}", correlationData.getId(), cause);
                // 补偿策略：写入数据库、重试、告警
            }
        });

        // 回调2：交换机是否成功路由到队列（routing key 不匹配时触发）
        rabbitTemplate.setReturnsCallback(returned -> {
            log.error("消息无法路由: exchange={}, routingKey={}, replyCode={}, replyText={}",
                    returned.getExchange(),
                    returned.getRoutingKey(),
                    returned.getReplyCode(),
                    returned.getReplyText());
            // 补偿策略：检查 routing key 是否正确、记录异常消息
        });
    }

    /**
     * 发送任务通知消息
     */
    public void sendTaskNotify(String payload) {
        send(com.taskflow.config.RabbitMQConfig.EXCHANGE_TASK,
                com.taskflow.config.RabbitMQConfig.ROUTING_TASK_NOTIFY,
                "task.notify",
                payload);
    }

    /**
     * 发送操作日志消息
     */
    public void sendOperationLog(String payload) {
        send(com.taskflow.config.RabbitMQConfig.EXCHANGE_TASK,
                com.taskflow.config.RabbitMQConfig.ROUTING_OPERATION_LOG,
                "task.operation.log",
                payload);
    }

    /**
     * 通用发送方法
     *
     * @param exchange   交换机
     * @param routingKey 路由键
     * @param type       消息业务类型
     * @param payload    消息体
     */
    private void send(String exchange, String routingKey, String type, String payload) {
        String messageId = UUID.randomUUID().toString();

        MessageEvent event = MessageEvent.builder()
                .messageId(messageId)
                .type(type)
                .payload(payload)
                .sendTime(LocalDateTime.now())
                .build();

        // CorrelationData 用于确认回调中匹配消息
        CorrelationData correlationData = new CorrelationData(messageId);

        // 发送后回调里会拿到同一个 correlationData.id
        rabbitTemplate.convertAndSend(exchange, routingKey, event, correlationData);

        log.info("消息已发送: id={}, type={}", messageId, type);
    }
}
