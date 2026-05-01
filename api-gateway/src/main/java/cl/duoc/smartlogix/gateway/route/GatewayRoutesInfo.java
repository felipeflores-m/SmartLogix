package cl.duoc.smartlogix.gateway.route;

public final class GatewayRoutesInfo {

    public static final String INVENTORY_PREFIX = "/api/inventory/**";
    public static final String ORDERS_PREFIX = "/api/orders/**";
    public static final String SHIPPING_PREFIX = "/api/shipping/**";

    private GatewayRoutesInfo() {
        throw new UnsupportedOperationException("Utility class");
    }
}
