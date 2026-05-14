package cl.duoc.smartlogix.orders.infrastructure.messaging.publisher;

import cl.duoc.smartlogix.orders.config.RabbitMQConfig;
import cl.duoc.smartlogix.orders.infrastructure.messaging.event.OrderCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.AmqpException;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishOrderCreated(OrderCreatedEvent event) {
        try {
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.ORDERS_EXCHANGE,
                    RabbitMQConfig.ORDER_CREATED_ROUTING_KEY,
                    event
            );
        } catch (AmqpException exception) {
            log.warn("OrderCreatedEvent could not be published for orderNumber={}", event.getOrderNumber());
        }
    }
}
