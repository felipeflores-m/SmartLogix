# SmartLogix API Gateway

El `api-gateway` es el Backend For Frontend/API Gateway del MVP académico SmartLogix. Su responsabilidad es ser el punto de entrada del frontend y enrutar las solicitudes hacia los microservicios de Inventario, Pedidos y Envíos.

Este componente no contiene lógica de negocio, JPA, entities ni repositories. En esta etapa del MVP solo enruta solicitudes, expone configuración básica de seguridad/CORS, agrega trazabilidad por request y entrega endpoints de monitoreo con Actuator.

## Puerto

- API Gateway: `8080`

## Rutas disponibles

| Ruta del gateway | Microservicio destino | Puerto destino |
| --- | --- | --- |
| `/api/inventory/**` | `inventory-service` | `http://localhost:8081` |
| `/api/orders/**` | `order-service` | `http://localhost:8082` |
| `/api/shipping/**` | `shipping-service` | `http://localhost:8083` |

## Microservicios esperados

- `inventory-service`: `8081`
- `order-service`: `8082`
- `shipping-service`: `8083`

## Funciones implementadas

- Enrutamiento hacia `inventory-service`, `order-service` y `shipping-service`.
- CORS de desarrollo para `http://localhost:3000` y `http://localhost:5173`.
- Seguridad básica permisiva para MVP académico.
- Actuator health para validar disponibilidad del gateway.
- Header `X-Correlation-Id` para trazabilidad de solicitudes.
- Manejo global de errores con `GlobalExceptionHandler`.
- Respuestas estándar con `ApiResponse`.
- Nota: no usa base de datos en esta etapa.

## Headers útiles

- `X-Correlation-Id`: identificador de trazabilidad por solicitud. Si el cliente lo envía, el gateway lo reutiliza. Si no viene en la request, el gateway genera un UUID, lo agrega a la request procesada internamente y lo devuelve en la respuesta.

## Ejecutar

Desde la carpeta `api-gateway`:

```bash
mvn spring-boot:run
```

## URL de prueba

```text
http://localhost:8080/actuator/health
```

## Base de datos

Existe una base de datos llamada `gateway-service` registrada en pgAdmin. En este MVP el gateway no la usa porque no maneja persistencia propia. Por eso este componente no debe agregar Spring Data JPA, PostgreSQL Driver, entities ni repositories salvo que la rúbrica o una decisión documentada cambie el alcance.

## Seguridad y CORS

La configuración actual permite probar las rutas del gateway durante el desarrollo académico. `SecurityConfig` deja abierto `/actuator/health` y las rutas `/api/**`; más adelante se puede activar validación JWT/OAuth2 Resource Server.

`CorsConfig` permite temporalmente los orígenes locales:

- `http://localhost:3000`
- `http://localhost:5173`

Métodos permitidos: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`.

Headers permitidos: `Authorization`, `Content-Type`, `X-Correlation-Id`.
