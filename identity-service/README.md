# SmartLogix Identity Service

`identity-service` centraliza la autenticación JWT del MVP académico SmartLogix.

## Configuración

- Puerto: `8084`
- Base de datos: `smartlogix_identity_db`
- PostgreSQL local: `localhost:5436`
- Usuario BD: `smartlogix`
- Password BD: `smartlogix123`

La firma JWT usa HS256 con una clave larga de desarrollo académico definida en `application.properties`. No es un secreto productivo.

## Ejecutar

```bash
.\mvnw.cmd spring-boot:run
```

## Tests

```bash
.\mvnw.cmd test
```

## Endpoints

| Método | URL | Protección |
| --- | --- | --- |
| `POST` | `http://localhost:8084/api/auth/login` | Público |
| `GET` | `http://localhost:8084/api/auth/me` | JWT requerido |
| `GET` | `http://localhost:8084/actuator/health` | Público |

También se accede mediante gateway:

- `POST http://localhost:8080/api/auth/login`
- `GET http://localhost:8080/api/auth/me`

## Login

```json
{
  "email": "admin@smartlogix.cl",
  "password": "admin123"
}
```

Usar el token:

```text
Authorization: Bearer <accessToken>
```

## Usuarios demo

| Rol | Email | Password |
| --- | --- | --- |
| `ADMIN` | `admin@smartlogix.cl` | `admin123` |
| `OPERATOR` | `operator@smartlogix.cl` | `operator123` |
| `VIEWER` | `viewer@smartlogix.cl` | `viewer123` |

Las contraseñas se guardan con BCrypt y no se retornan en respuestas.
