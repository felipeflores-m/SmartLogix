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
- `identity-service`: `8084`

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
| `postgres-identity` | `smartlogix_identity_db` | `5436` | `5432` |

### RabbitMQ

| Servicio Docker | Uso | Puerto local |
| --- | --- | --- |
| `rabbitmq` | AMQP | `5672` |
| `rabbitmq` | Panel web de administración | `15672` |

## Autenticación JWT

SmartLogix usa `identity-service` como servicio central de autenticación. El login se realiza a través del API Gateway y devuelve un access token JWT firmado para acceder a rutas protegidas.

Login:

```http
POST http://localhost:8080/api/auth/login
```

Ejemplo:

```json
{
  "email": "admin@smartlogix.cl",
  "password": "admin123"
}
```

Usar el token en Bruno o en otro cliente HTTP:

```text
Authorization: Bearer <accessToken>
```

Usuarios demo:

| Rol | Email | Password |
| --- | --- | --- |
| `ADMIN` | `admin@smartlogix.cl` | `admin123` |
| `OPERATOR` | `operator@smartlogix.cl` | `operator123` |
| `VIEWER` | `viewer@smartlogix.cl` | `viewer123` |

Las credenciales y la clave JWT configurada son solo para entorno académico local. No son secretos productivos.

## Flujo backend completo

1. El usuario inicia sesion en `identity-service` mediante el API Gateway.
2. El frontend consulta inventario mediante `/api/inventory/**`.
3. El usuario crea un pedido mediante `/api/orders`.
4. Al confirmar el pedido, `order-service` publica `OrderCreatedEvent` en RabbitMQ.
5. `inventory-service` consume el evento y descuenta stock con movimientos `ORDER_OUT`.
6. `shipping-service` consume el mismo evento y crea un envio en estado `PENDING_ASSIGNMENT`.
7. `shipping-service` permite asignar transportista y avanzar el despacho.

Este flujo demuestra comunicacion asincrona y el patron Observer/Event Driven
mediante RabbitMQ, manteniendo bases de datos independientes por microservicio.

## Pruebas con Bruno

Las colecciones versionadas estan en:

```text
docs/SmartLogix/collections/
```

Las colecciones usan formato Bruno v3/OpenCollection YAML:

- `opencollection.yml`
- requests `.yml`
- environments `.yml`

Abrir Bruno, seleccionar `Open Collection` y usar primero:

```text
docs/SmartLogix/collections/smartlogix
```

Las requests usan URLs absolutas `http://localhost:*`, por lo que no dependen
del environment para evitar errores `Invalid URL`. Seleccionar igualmente el
environment `Local` para ver y persistir `token`, `orderId`, `orderNumber`,
`shipmentId` y `shipmentNumber`.

Orden recomendado para el Runner:

1. `00 Health`
2. `01 Auth / Login Admin`
3. `01 Auth / Me`
4. `02 Inventory`
5. `03 Orders`
6. `04 Event Driven Validation`
7. `05 Shipping`

El login intenta guardar automaticamente `token`. Si el script de Bruno no se
ejecuta en la version instalada, copiar `data.accessToken` manualmente al
environment. Lo mismo aplica para `orderId`, `orderNumber`, `shipmentId` y
`shipmentNumber`.

Guias:

- `docs/bruno-guide.md`
- `docs/demo-flujo-completo.md`
- `docs/evidencia-defensa.md`
