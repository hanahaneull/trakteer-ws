# trakteer-ws

<a href="https://trakteer.id/Discord"><img src="https://img.shields.io/badge/Trakteer-Donasi-red"/></a>  
Trakteer.id websocket connection

# Usage

```js
const client = require('./index.js')
const trakteer = new client()
trakteer.login({
  // Read CREDENTIALS.md
  'XSRF-TOKEN': 'XSRF TOKEN',
  'trakteer-id-session': 'SESSION ID',
  channel: 'CHANNEL'
})
```

# Event

## connect

```js
trakteer.on('connect', x => console.log(x))
// Return current time
```

## disconnect

```js
trakteer.on('disconnect', x => console.log(x))
// Return current time
```

## supporter

```js
trakteer.on('supporter', x => console.log(x))
// {
//    "order_id":"e21fc269-69dd-6969-98c3-595046997701",
//    "supporter_name":"Seseorang",
//    "creator_name":"hana",
//    "unit":"Bitcoin",
//    "quantity":1,
//    "price":"Rp 1.000",
//    "supporter_avatar":"https://cdn.trakteer.id/images/mix/default-avatar.png",
//    "unit_icon":"https://trakteer.id/storage/images/units/uic-alUKvPOMiKa0WIjj03xaOkuw37Zcle4Y1594826060.png",
//    "supporter_message":null,
//    "id":"691663ad-694d-69e9-6969-549d6b01b469",
//    "type":"new-tip-success"
// }
```

## notification

```js
trakteer.on('notification', x => console.log(x))
// Gunakan event 'supporter' jika hanya mengambil data donasi
// {
//    "order_id":"e21fc249-26dd-5265-98c3-595046497701",
//    "supporter_name":"Seseorang",
//    "creator_name":"hana",
//    "unit":"Bitcoin",
//    "quantity":1,
//    "price":"Rp 1.000",
//    "supporter_avatar":"https://cdn.trakteer.id/images/mix/default-avatar.png",
//    "unit_icon":"https://trakteer.id/storage/images/units/uic-alUKvPOMiKa0WIjj03xaOkuw37Zcle4Y1594826060.png",
//    "supporter_message":null,
//    "id":"f51663ad-814d-43e9-9415-549d6b01b4b0",
//    "type":"new-tip-success"
// }
```

## debug

```js
trakteer.on('debug', x => console.log(x))
// {
//   type: 'connect', // ['connect', 'csrf', 'authkey', 'disconnect', 'heartbeat-send', 'heartbeat-receive', 'notification']
//   value: 'Websocket connected'
// }
```
