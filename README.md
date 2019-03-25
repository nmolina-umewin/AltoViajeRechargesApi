# AltoViajeRechargesApi

API para realizar recargas.

### Métodos

```
 GET  /config
 GET  /health
 GET  /services
 GET  /services/{id_service}
 GET  /services/{id_service}/token
 POST /services/{id_service}/recharge
```

### GET /services

Obtiene la lista de los servicios habilitados para operar con esta API (`id_service`).

```javascript
[
    {
        "id" : 1,
        "active": 1,
        "description" : "sube"
    },
    { ... }
]
```

### GET /services/{id_service}

Obtiene el servicio habilitado para operar con esta API (`id_service`).

```javascript
{
    "id" : 1,
    "active": 1,
    "description" : "sube"
}
```

### GET /services/{id_service}/token

Genera un nuevo Token para operar el servicio seleccionado (`{id_service}`). El token tendra una vida util de 24 hs.

```javascript
// Ejemplo
{
   "token" : "8e4a1f2121090b74"
}
```

### POST /services/{id_service}/recharge

Genera una nueva transacción contra el servicio selecionado (`{id_service}`). El body del request requiere los siguientes elementos:

```javascript
{
  "id_service" : 1,
  "id_company" : 1,
  "id_user" : 1,
  "payload" : {
    "card_number" : "3061268011902638",
    "amount" : 200
  },
  // Opcional. En caso de no enviar el token. El micro-servicio se encargar de reutilizar un token activo o generar uno nuevo en caso de ser necesario.
  "token" : "8e4a1f2121090b74"
}
```
