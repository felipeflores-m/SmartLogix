package cl.duoc.smartlogix.inventory.infrastructure.messaging.consumer;

import cl.duoc.smartlogix.inventory.application.service.InventoryOrderEventService;
import cl.duoc.smartlogix.inventory.config.RabbitMQConfig;
import cl.duoc.smartlogix.inventory.infrastructure.messaging.event.OrderCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderCreatedConsumer {

    private final InventoryOrderEventService inventoryOrderEventService;

    @RabbitListener(queues = RabbitMQConfig.INVENTORY_ORDER_CREATED_QUEUE)
    public void consume(OrderCreatedEvent event) {
        try {
            log.info(
                    "OrderCreatedEvent received in inventory orderId={} orderNumber={}",
                    event == null ? null : event.getOrderId(),
                    event == null ? null : event.getOrderNumber()
            );
            inventoryOrderEventService.processOrderCreated(event);
        } catch (Exception exception) {
            log.warn(
                    "OrderCreatedEvent could not be processed in inventory orderId={} orderNumber={} reason={}",
                    event == null ? null : event.getOrderId(),
                    event == null ? null : event.getOrderNumber(),
                    exception.getMessage()
            );
        }
    }
}
