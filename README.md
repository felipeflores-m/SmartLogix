# SmartLogix

Plataforma logística eCommerce con microservicios Spring Boot: API Gateway, Inventario, Pedidos y Envíos.

## Arquitectura

Los microservicios backend de SmartLogix deben usar Arquitectura de Capas obligatoria, separando `presentation`, `application`, `domain`, `infrastructure`, `config` y `shared`. Esta regla está documentada en `AGENTS.md` y debe considerarse antes de crear o modificar código en `inventory-service`, `order-service`, `shipping-service` y `api-gateway`.

El `api-gateway` no debe incluir JPA, entities ni repositories en este MVP; su responsabilidad es enrutar, centralizar la entrada del frontend y aplicar configuración transversal básica.

## Infraestructura local

SmartLogix usa Docker Compose para levantar la infraestructura base del MVP académico:

- PostgreSQL para Inventario.
- PostgreSQL para Pedidos.
- PostgreSQL para Envíos.
- RabbitMQ para eventos entre microservicios.
- pgAdmin opcional para administración visual de bases de datos.

Los microservicios Spring Boot todavía no están dockerizados en esta etapa. Deben ejecutarse localmente en sus puertos definidos cuando corresponda:

- `api-gateway`: `8080`
- `inventory-service`: `8081`
- `order-service`: `8082`
- `shipping-service`: `8083`

### Comandos Docker Compose

Levantar infraestructura:

```bash
docker compose up -d
```

Detener infraestructura:

```bash
docker compose down
```

Ver logs:

```bash
docker compose logs -f
```

### URLs importantes

- RabbitMQ Management: `http://localhost:15672`
- pgAdmin: `http://localhost:5050`

### Credenciales de desarrollo

Estas credenciales son solo para entorno académico local. No deben usarse en producción ni publicarse como secretos reales.

| Servicio | Usuario / Email | Contraseña |
| --- | --- | --- |
| PostgreSQL | `smartlogix` | `smartlogix123` |
| RabbitMQ | `smartlogix` | `smartlogix123` |
| pgAdmin | `admin@smartlogix.cl` | `admin123` |

### Bases de datos

| Servicio Docker | Base de datos | Puerto local | Puerto contenedor |
| --- | --- | --- | --- |
| `postgres-inventory` | `smartlogix_inventory_db` | `5433` | `5432` |
| `postgres-orders` | `smartlogix_orders_db` | `5434` | `5432` |
| `postgres-shipping` | `smartlogix_shipping_db` | `5435` | `5432` |

### RabbitMQ

| Servicio Docker | Uso | Puerto local |
| --- | --- | --- |
| `rabbitmq` | AMQP | `5672` |
| `rabbitmq` | Panel web de administración | `15672` |
