package cl.duoc.smartlogix.inventory.application.service.impl;

import cl.duoc.smartlogix.inventory.application.service.InventoryOrderEventService;
import cl.duoc.smartlogix.inventory.application.service.StockService;
import cl.duoc.smartlogix.inventory.domain.enums.StockMovementType;
import cl.duoc.smartlogix.inventory.domain.exception.BusinessRuleException;
import cl.duoc.smartlogix.inventory.infrastructure.messaging.event.OrderCreatedEvent;
import cl.duoc.smartlogix.inventory.infrastructure.messaging.event.OrderCreatedItemEvent;
import cl.duoc.smartlogix.inventory.infrastructure.persistence.repository.StockMovementRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryOrderEventServiceImpl implements InventoryOrderEventService {

    private static final String ORDER_OUT_REASON = "Stock descontado por pedido confirmado";

    private final StockService stockService;
    private final StockMovementRepository stockMovementRepository;

    @Override
    @Transactional
    public void processOrderCreated(OrderCreatedEvent event) {
        validateEvent(event);

        for (OrderCreatedItemEvent item : event.getItems()) {
            validateItem(item, event.getOrderNumber());

            if (isAlreadyProcessed(event.getOrderNumber(), item)) {
                log.info(
                        "Stock movement already processed for orderNumber={} productId={} warehouseId={}",
                        event.getOrderNumber(),
                        item.getProductId(),
                        item.getWarehouseId()
                );
                continue;
            }

            stockService.createOrderOutMovement(
                    item.getProductId(),
                    item.getWarehouseId(),
                    item.getQuantity(),
                    ORDER_OUT_REASON,
                    event.getOrderNumber()
            );
        }
    }

    private void validateEvent(OrderCreatedEvent event) {
        if (event == null) {
            throw new BusinessRuleException("OrderCreatedEvent cannot be null");
        }

        if (!StringUtils.hasText(event.getOrderNumber())) {
            throw new BusinessRuleException("OrderCreatedEvent orderNumber is required");
        }

        List<OrderCreatedItemEvent> items = event.getItems();
        if (items == null || items.isEmpty()) {
            throw new BusinessRuleException("OrderCreatedEvent must contain at least one item");
        }
    }

    private void validateItem(OrderCreatedItemEvent item, String orderNumber) {
        if (item == null) {
            throw new BusinessRuleException("OrderCreatedEvent contains a null item for orderNumber: " + orderNumber);
        }

        if (item.getProductId() == null) {
            throw new BusinessRuleException("OrderCreatedEvent item productId is required for orderNumber: " + orderNumber);
        }

        if (item.getWarehouseId() == null) {
            throw new BusinessRuleException("OrderCreatedEvent item warehouseId is required for orderNumber: " + orderNumber);
        }

        if (item.getQuantity() == null || item.getQuantity() <= 0) {
            throw new BusinessRuleException("OrderCreatedEvent item quantity must be greater than zero for orderNumber: " + orderNumber);
        }
    }

    private boolean isAlreadyProcessed(String orderNumber, OrderCreatedItemEvent item) {
        return stockMovementRepository.existsByReferenceCodeAndProductIdAndWarehouseIdAndType(
                orderNumber,
                item.getProductId(),
                item.getWarehouseId(),
                StockMovementType.ORDER_OUT
        );
    }
}
