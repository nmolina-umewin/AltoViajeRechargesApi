# AltoViajeRechargesApi

API para realizar recargas.

### Métodos

```
 GET  /config
 GET  /health
 GET  /services
 GET  /services/{id_service}
 POST /recharge
```

### GET /token

Genera un nuevo Token. Ese token debería compartirse a lo largo de todos los microservicios ya que una transacción nace en el producto de PyME y continúa a lo largo de Payments y Recharges.

```sh
{
   "token" : "1f90230e-990c-40fe-8e4a-1f2121090b74"
}
```

### POST /transactions

Guarda una nueva transacción. El body del request requiere los siguientes elementos:

```sh
{
  "id_application" : 1,
  "id_transaction_type" : 30001,
  "token" : "676318f1-35d1-4fd6-a949-517eac663c5c",
  "description" : {
    "cardnumber" : "3061268011902638",
    "amount" : "200",
    "id_user" : "15",
    "username" : "Gonzalo Aizpun"
  }
}
```

### GET /applications

Obtiene la lista de las aplicaciones habilitadas para operar con esta API (id_application).

```sh
[
    {
        "id" : 1,
        "description" : "altoviaje.payments.api"
    },
    {
        "id" : 2,
        "description" : "altoviaje.recharges.api"
    }
    { ... }
]
```

### GET /types

Obtiene la lista de códigos de eventos transaccionales disponibles (id_transaction_type).

```sh
[
    {
        "id" : 10001,
        "description" : "user.new"
    },
    {
        "id" : 10002,
        "description" : "user.update"
    },
    { ... }
]
```
