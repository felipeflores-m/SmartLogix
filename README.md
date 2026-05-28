# SmartLogix

SmartLogix es un sistema academico de gestion logistica para inventario, pedidos, envios, transportistas, bodegas, reportes y configuracion administrativa. La aplicacion esta organizada como frontend React y microservicios Spring Boot protegidos con JWT.

## Arquitectura

- `frontend`: React, TypeScript, Vite, Tailwind, shadcn-style UI y Recharts.
- `api-gateway`: entrada unica del frontend y health agregado del sistema.
- `identity-service`: autenticacion, sesion, roles y administracion de usuarios.
- `inventory-service`: productos, stock, bodegas y movimientos.
- `order-service`: clientes, pedidos y estados.
- `shipping-service`: envios, transportistas y asignaciones.
- Infraestructura local: PostgreSQL por servicio, RabbitMQ y pgAdmin.

## Requisitos

- Java 21
- Node.js 22 o compatible con Vite 6
- Docker Desktop
- Maven Wrapper incluido en cada microservicio

## Ejecutar con Docker

Docker Compose levanta infraestructura y el frontend de produccion:

```bash
docker compose up --build
docker compose down
docker compose logs -f frontend
```

El frontend queda disponible en `http://localhost:5173`. Los microservicios Spring Boot siguen ejecutandose manualmente en esta version, usando las bases de datos y RabbitMQ del compose.

## Ejecutar backend manual

Inicia cada servicio en una terminal:

```bash
cd identity-service && mvnw.cmd spring-boot:run
cd inventory-service && mvnw.cmd spring-boot:run
cd order-service && mvnw.cmd spring-boot:run
cd shipping-service && mvnw.cmd spring-boot:run
cd api-gateway && mvnw.cmd spring-boot:run
```

Puertos por defecto:

- API Gateway: `http://localhost:8080`
- Inventory: `http://localhost:8081`
- Orders: `http://localhost:8082`
- Shipping: `http://localhost:8083`
- Identity: `http://localhost:8084`

## Ejecutar frontend manual

```bash
cd frontend
npm install
npm run dev
```

## Swagger

- API Gateway: `http://localhost:8080/swagger-ui/index.html`
- Inventory: `http://localhost:8081/swagger-ui/index.html`
- Orders: `http://localhost:8082/swagger-ui/index.html`
- Shipping: `http://localhost:8083/swagger-ui/index.html`
- Identity: `http://localhost:8084/swagger-ui/index.html`

Los documentos OpenAPI estan en `/v3/api-docs` en cada servicio.

## Tests

Frontend:

```bash
cd frontend
npm run lint
npm run build
npm run test
```

Backend por servicio:

```bash
cd identity-service && mvnw.cmd test
cd inventory-service && mvnw.cmd test
cd order-service && mvnw.cmd test
cd shipping-service && mvnw.cmd test
cd api-gateway && mvnw.cmd test
```

## Usuarios y roles

Los roles funcionales son:

- `ADMIN`: acceso completo, configuracion y exportacion.
- `OPERATOR`: operacion diaria sin configuracion ni exportacion de reportes.
- `VIEWER`: lectura sin acciones mutantes.

Si existen usuarios semilla, revisa los `DataInitializer` de cada servicio o la base de datos local.

## Documentacion

- [Arquitectura](docs/ARCHITECTURE.md)
- [Frontend](docs/FRONTEND.md)
- [Backend](docs/BACKEND.md)
- [Roles y permisos](docs/ROLES_PERMISSIONS.md)
- [Docker](docs/DOCKER.md)
- [Testing](docs/TESTING.md)
- [API](docs/API.md)

## Troubleshooting

- Si el frontend no puede iniciar sesion, confirma que `api-gateway` este en `http://localhost:8080`.
- Si una pagina muestra un servicio no disponible, revisa el health del microservicio correspondiente.
- Si Docker mantiene datos antiguos, ejecuta `docker compose down -v` solo cuando quieras reiniciar las bases locales.
- Si Swagger no carga, confirma que el servicio este levantado y revisa `/actuator/health`.
