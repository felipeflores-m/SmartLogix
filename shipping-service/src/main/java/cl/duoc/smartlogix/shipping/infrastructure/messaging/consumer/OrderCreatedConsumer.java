package cl.duoc.smartlogix.shipping.infrastructure.messaging.consumer;

import cl.duoc.smartlogix.shipping.application.service.ShipmentService;
import cl.duoc.smartlogix.shipping.config.RabbitMQConfig;
import cl.duoc.smartlogix.shipping.infrastructure.messaging.event.OrderCreatedEvent;
import cl.duoc.smartlogix.shipping.presentation.dto.response.ShipmentResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderCreatedConsumer {

    private final ShipmentService shipmentService;

    @RabbitListener(queues = RabbitMQConfig.SHIPPING_ORDER_CREATED_QUEUE)
    public void consume(OrderCreatedEvent event) {
        try {
            ShipmentResponse shipment = shipmentService.createFromOrderEvent(event);
            log.info(
                    "OrderCreatedEvent processed orderId={} orderNumber={} shipmentNumber={}",
                    event.getOrderId(),
                    event.getOrderNumber(),
                    shipment.getShipmentNumber()
            );
        } catch (Exception exception) {
            log.warn(
                    "OrderCreatedEvent could not be processed orderId={} orderNumber={}",
                    event.getOrderId(),
                    event.getOrderNumber()
            );
        }
    }
}
