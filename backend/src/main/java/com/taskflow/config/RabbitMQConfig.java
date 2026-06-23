package com.taskflow.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // ============ 交换机定义 ============

    /** 任务交换机 */
    public static final String EXCHANGE_TASK = "task.exchange";
    /** 死信交换机 */
    public static final String EXCHANGE_TASK_DEAD = "task.dead.exchange";

    // ============ 队列定义 ============

    /** 任务通知队列 */
    public static final String QUEUE_TASK_NOTIFY = "task.notify.queue";
    /** 操作日志队列 */
    public static final String QUEUE_OPERATION_LOG = "task.operation.log.queue";
    /** 死信队列（所有失败消息最终到这里） */
    public static final String QUEUE_TASK_DEAD = "task.dead.queue";

    // ============ 路由键 ============

    public static final String ROUTING_TASK_NOTIFY = "task.notify";
    public static final String ROUTING_OPERATION_LOG = "task.operation.log";
    public static final String ROUTING_TASK_DEAD = "task.dead";

    // ============ 交换机 ============

    @Bean
    public TopicExchange taskExchange() {
        return new TopicExchange(EXCHANGE_TASK);
    }

    /** 死信交换机：接收重试耗尽的消息，转发到死信队列 */
    @Bean
    public TopicExchange taskDeadExchange() {
        return new TopicExchange(EXCHANGE_TASK_DEAD);
    }

    // ============ 业务队列（绑定死信） ============

    @Bean
    public Queue taskNotifyQueue() {
        return QueueBuilder.durable(QUEUE_TASK_NOTIFY)
                // 绑定死信交换机：重试 3 次失败后，消息自动转到这里
                .deadLetterExchange(EXCHANGE_TASK_DEAD)
                .deadLetterRoutingKey(ROUTING_TASK_DEAD)
                .build();
    }

    @Bean
    public Queue operationLogQueue() {
        return QueueBuilder.durable(QUEUE_OPERATION_LOG)
                .deadLetterExchange(EXCHANGE_TASK_DEAD)
                .deadLetterRoutingKey(ROUTING_TASK_DEAD)
                .build();
    }

    /** 死信队列：存放最终失败的消息，供人工排查 */
    @Bean
    public Queue taskDeadQueue() {
        return QueueBuilder.durable(QUEUE_TASK_DEAD).build();
    }

    // ============ 业务绑定 ============

    @Bean
    public Binding taskNotifyBinding() {
        return BindingBuilder.bind(taskNotifyQueue())
                .to(taskExchange())
                .with(ROUTING_TASK_NOTIFY);
    }

    @Bean
    public Binding operationLogBinding() {
        return BindingBuilder.bind(operationLogQueue())
                .to(taskExchange())
                .with(ROUTING_OPERATION_LOG);
    }

    // ============ 死信绑定 ============

    @Bean
    public Binding deadLetterBinding() {
        return BindingBuilder.bind(taskDeadQueue())
                .to(taskDeadExchange())
                .with(ROUTING_TASK_DEAD);
    }

    // ============ 序列化 ============

    @Bean
    public MessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
