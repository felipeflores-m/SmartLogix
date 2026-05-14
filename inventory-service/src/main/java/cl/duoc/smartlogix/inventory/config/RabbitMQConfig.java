package cl.duoc.smartlogix.inventory.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String ORDERS_EXCHANGE = "smartlogix.orders.exchange";
    public static final String ORDER_CREATED_ROUTING_KEY = "order.created";
    public static final String INVENTORY_ORDER_CREATED_QUEUE = "smartlogix.inventory.order-created.queue";

    @Bean
    public DirectExchange ordersExchange() {
        return new DirectExchange(ORDERS_EXCHANGE, true, false);
    }

    @Bean
    public Queue inventoryOrderCreatedQueue() {
        return new Queue(INVENTORY_ORDER_CREATED_QUEUE, true);
    }

    @Bean
    public Binding inventoryOrderCreatedBinding(Queue inventoryOrderCreatedQueue, DirectExchange ordersExchange) {
        return BindingBuilder.bind(inventoryOrderCreatedQueue)
                .to(ordersExchange)
                .with(ORDER_CREATED_ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new JacksonJsonMessageConverter();
    }
}
