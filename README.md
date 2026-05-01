# SmartLogix

Plataforma logística eCommerce con microservicios Spring Boot: API Gateway, Inventario, Pedidos y Envíos.

## Arquitectura

Los microservicios backend de SmartLogix deben usar Arquitectura de Capas obligatoria, separando `presentation`, `application`, `domain`, `infrastructure`, `config` y `shared`. Esta regla está documentada en `AGENTS.md` y debe considerarse antes de crear o modificar código en `inventory-service`, `order-service`, `shipping-service` y `api-gateway`.

El `api-gateway` no debe incluir JPA, entities ni repositories en este MVP; su responsabilidad es enrutar, centralizar la entrada del frontend y aplicar configuración transversal básica.
