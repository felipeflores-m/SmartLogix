package cl.duoc.smartlogix.gateway.route;

import java.util.List;
import org.springframework.boot.actuate.endpoint.annotation.Endpoint;
import org.springframework.boot.actuate.endpoint.annotation.ReadOperation;
import org.springframework.boot.actuate.endpoint.annotation.Selector;
import org.springframework.stereotype.Component;

@Component
@Endpoint(id = "gateway")
public class GatewayRoutesEndpoint {

    @ReadOperation
    public List<GatewayRouteView> routes(@Selector String operation) {
        if (!"routes".equalsIgnoreCase(operation)) {
            return List.of();
        }

        return routes();
    }

    @ReadOperation
    public List<GatewayRouteView> routes() {
        return List.of(
                new GatewayRouteView(
                        "identity-service",
                        GatewayRoutesInfo.AUTH_URI,
                        GatewayRoutesInfo.AUTH_PREFIX
                ),
                new GatewayRouteView(
                        "inventory-service",
                        GatewayRoutesInfo.INVENTORY_URI,
                        GatewayRoutesInfo.INVENTORY_PREFIX
                ),
                new GatewayRouteView(
                        "order-service",
                        GatewayRoutesInfo.ORDERS_URI,
                        GatewayRoutesInfo.ORDERS_PREFIX
                ),
                new GatewayRouteView(
                        "shipping-service",
                        GatewayRoutesInfo.SHIPPING_URI,
                        GatewayRoutesInfo.SHIPPING_PREFIX
                )
        );
    }

    public record GatewayRouteView(String id, String uri, String path) {
    }
}
