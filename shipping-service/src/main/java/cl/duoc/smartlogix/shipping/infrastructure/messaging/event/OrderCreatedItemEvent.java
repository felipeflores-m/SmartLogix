package cl.duoc.smartlogix.shipping.infrastructure.messaging.event;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderCreatedItemEvent {

    private Long productId;
    private Long warehouseId;
    private String sku;
    private String productName;
    private Integer quantity;
    private BigDecimal unitPrice;
}
