package cl.duoc.smartlogix.orders.application.service.impl;

import cl.duoc.smartlogix.orders.application.mapper.OrderItemMapper;
import cl.duoc.smartlogix.orders.application.mapper.OrderMapper;
import cl.duoc.smartlogix.orders.application.mapper.OrderStatusHistoryMapper;
import cl.duoc.smartlogix.orders.application.service.OrderService;
import cl.duoc.smartlogix.orders.domain.enums.OrderStatus;
import cl.duoc.smartlogix.orders.domain.exception.BusinessRuleException;
import cl.duoc.smartlogix.orders.domain.exception.ResourceNotFoundException;
import cl.duoc.smartlogix.orders.infrastructure.messaging.event.OrderCreatedEvent;
import cl.duoc.smartlogix.orders.infrastructure.messaging.event.OrderCreatedItemEvent;
import cl.duoc.smartlogix.orders.infrastructure.messaging.publisher.OrderEventPublisher;
import cl.duoc.smartlogix.orders.infrastructure.persistence.entity.CustomerEntity;
import cl.duoc.smartlogix.orders.infrastructure.persistence.entity.OrderEntity;
import cl.duoc.smartlogix.orders.infrastructure.persistence.entity.OrderItemEntity;
import cl.duoc.smartlogix.orders.infrastructure.persistence.entity.OrderStatusHistoryEntity;
import cl.duoc.smartlogix.orders.infrastructure.persistence.repository.CustomerRepository;
import cl.duoc.smartlogix.orders.infrastructure.persistence.repository.OrderRepository;
import cl.duoc.smartlogix.orders.infrastructure.persistence.repository.OrderStatusHistoryRepository;
import cl.duoc.smartlogix.orders.presentation.dto.request.CreateOrderItemRequest;
import cl.duoc.smartlogix.orders.presentation.dto.request.CreateOrderRequest;
import cl.duoc.smartlogix.orders.presentation.dto.request.UpdateOrderStatusRequest;
import cl.duoc.smartlogix.orders.presentation.dto.response.OrderResponse;
import cl.duoc.smartlogix.orders.presentation.dto.response.OrderStatusHistoryResponse;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ThreadLocalRandom;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private static final DateTimeFormatter ORDER_DATE_FORMAT = DateTimeFormatter.BASIC_ISO_DATE;

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final OrderEventPublisher orderEventPublisher;

    @Override
    @Transactional
    public OrderResponse create(CreateOrderRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BusinessRuleException("Order must contain at least one item");
        }

        CustomerEntity customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + request.getCustomerId()));

        OrderEntity order = OrderEntity.builder()
                .orderNumber(generateOrderNumber())
                .customer(customer)
                .status(OrderStatus.CREATED)
                .notes(request.getNotes())
                .totalAmount(BigDecimal.ZERO)
                .build();

        BigDecimal total = BigDecimal.ZERO;
        for (CreateOrderItemRequest itemRequest : request.getItems()) {
            BigDecimal subtotal = calculateSubtotal(itemRequest);
            total = total.add(subtotal);
            order.addItem(OrderItemMapper.toEntity(itemRequest, subtotal));
        }

        order.setTotalAmount(total);
        order.addHistory(buildHistory(null, OrderStatus.CREATED, "Order created"));

        return OrderMapper.toResponse(orderRepository.save(order));
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> findAll() {
        return orderRepository.findAll().stream()
                .map(OrderMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse findById(Long id) {
        return OrderMapper.toResponse(findOrderEntityById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse findByOrderNumber(String orderNumber) {
        OrderEntity order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with number: " + orderNumber));
        return OrderMapper.toResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> findByCustomer(Long customerId) {
        if (!customerRepository.existsById(customerId)) {
            throw new ResourceNotFoundException("Customer not found with id: " + customerId);
        }

        return orderRepository.findByCustomerId(customerId).stream()
                .map(OrderMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public OrderResponse updateStatus(Long id, UpdateOrderStatusRequest request) {
        OrderEntity order = findOrderEntityById(id);
        changeStatus(order, request.getStatus(), request.getComment());
        OrderEntity savedOrder = orderRepository.save(order);

        if (request.getStatus() == OrderStatus.CONFIRMED) {
            orderEventPublisher.publishOrderCreated(toOrderCreatedEvent(savedOrder));
        }

        return OrderMapper.toResponse(savedOrder);
    }

    @Override
    @Transactional
    public OrderResponse confirm(Long id) {
        OrderEntity order = findOrderEntityById(id);

        if (order.getStatus() != OrderStatus.CREATED) {
            throw new BusinessRuleException("Only CREATED orders can be confirmed");
        }

        changeStatus(order, OrderStatus.CONFIRMED, "Order confirmed");
        OrderEntity savedOrder = orderRepository.save(order);
        orderEventPublisher.publishOrderCreated(toOrderCreatedEvent(savedOrder));
        return OrderMapper.toResponse(savedOrder);
    }

    @Override
    @Transactional
    public OrderResponse cancel(Long id) {
        OrderEntity order = findOrderEntityById(id);

        if (!Set.of(OrderStatus.CREATED, OrderStatus.CONFIRMED).contains(order.getStatus())) {
            throw new BusinessRuleException("Only CREATED or CONFIRMED orders can be cancelled");
        }

        changeStatus(order, OrderStatus.CANCELLED, "Order cancelled");
        return OrderMapper.toResponse(orderRepository.save(order));
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderStatusHistoryResponse> getHistory(Long id) {
        if (!orderRepository.existsById(id)) {
            throw new ResourceNotFoundException("Order not found with id: " + id);
        }

        return orderStatusHistoryRepository.findByOrderIdOrderByCreatedAtAsc(id).stream()
                .map(OrderStatusHistoryMapper::toResponse)
                .toList();
    }

    private OrderEntity findOrderEntityById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
    }

    private BigDecimal calculateSubtotal(CreateOrderItemRequest itemRequest) {
        return itemRequest.getUnitPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity()));
    }

    private void changeStatus(OrderEntity order, OrderStatus newStatus, String comment) {
        OrderStatus previousStatus = order.getStatus();

        if (previousStatus == newStatus) {
            throw new BusinessRuleException("Order already has status: " + newStatus);
        }

        if (!isValidTransition(previousStatus, newStatus)) {
            throw new BusinessRuleException("Invalid order status transition from " + previousStatus + " to " + newStatus);
        }

        order.setStatus(newStatus);
        order.addHistory(buildHistory(previousStatus, newStatus, comment));
    }

    private boolean isValidTransition(OrderStatus currentStatus, OrderStatus newStatus) {
        return switch (currentStatus) {
            case CREATED -> Set.of(OrderStatus.CONFIRMED, OrderStatus.CANCELLED).contains(newStatus);
            case CONFIRMED -> Set.of(OrderStatus.PREPARING, OrderStatus.CANCELLED).contains(newStatus);
            case PREPARING -> newStatus == OrderStatus.READY_FOR_SHIPPING;
            case READY_FOR_SHIPPING -> newStatus == OrderStatus.SHIPPED;
            case SHIPPED -> newStatus == OrderStatus.DELIVERED;
            case CANCELLED, DELIVERED -> false;
        };
    }

    private OrderStatusHistoryEntity buildHistory(OrderStatus previousStatus, OrderStatus newStatus, String comment) {
        return OrderStatusHistoryEntity.builder()
                .previousStatus(previousStatus)
                .newStatus(newStatus)
                .comment(comment)
                .build();
    }

    private String generateOrderNumber() {
        String date = LocalDate.now().format(ORDER_DATE_FORMAT);
        String orderNumber;

        do {
            int sequence = ThreadLocalRandom.current().nextInt(10000, 100000);
            orderNumber = "ORD-" + date + "-" + sequence;
        } while (orderRepository.existsByOrderNumber(orderNumber));

        return orderNumber;
    }

    private OrderCreatedEvent toOrderCreatedEvent(OrderEntity order) {
        return OrderCreatedEvent.builder()
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .customerId(order.getCustomer().getId())
                .totalAmount(order.getTotalAmount())
                .items(order.getItems().stream()
                        .map(this::toOrderCreatedItemEvent)
                        .toList())
                .createdAt(LocalDateTime.now())
                .build();
    }

    private OrderCreatedItemEvent toOrderCreatedItemEvent(OrderItemEntity item) {
        return OrderCreatedItemEvent.builder()
                .productId(item.getProductId())
                .warehouseId(item.getWarehouseId())
                .sku(item.getSku())
                .productName(item.getProductName())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .build();
    }
}
