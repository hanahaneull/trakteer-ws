const got = require('got')
const websocket = require('ws')
const cheerio = require('cheerio')
const EventEmitter = require('events')

class Trakteer extends EventEmitter {
  constructor (options = {}) {
    super()
    this.url =
      'wss://socket.trakteer.id/app/2ae25d102cc6cd41100a?protocol=7&client=js&version=5.0.3&flash=false'
    this.credentials = {}
    this.ws = null
    this.socketID = null
  }

  async getCSRF () {
    const { body } = await got('https://trakteer.id/manage/dashboard', {
      headers: {
        cookie: `XSRF-TOKEN=${this.credentials['XSRF-TOKEN']}; trakteer-id-session=${this.credentials['trakteer-id-session']}`
      }
    })
    const $ = cheerio.load(body)
    const csrf = $("meta[name='csrf-token']").attr('content')
    this.emit('debug', {
      type: 'csrf',
      value: csrf
    })
    return csrf
  }

  async getAuth () {
    const csrf = await this.getCSRF()
    const { auth } = await got.post('https://trakteer.id/broadcasting/auth', {
      headers: {
        'x-csrf-token': csrf,
        'content-type': 'application/x-www-form-urlencoded',
        cookie: `XSRF-TOKEN=${this.credentials['XSRF-TOKEN']}; trakteer-id-session=${this.credentials['trakteer-id-session']}`
      },
      body: `socket_id=${this.socketID}&channel_name=${this.credentials.channel}`,
      responseType: 'json',
      resolveBodyOnly: true
    })
    this.emit('debug', {
      type: 'authkey',
      value: auth
    })
    return auth
  }

  async reconnect () {
    setTimeout(() => {
      this.ws = null
      this.emit('debug', {
        type: 'disconnect',
        value: +new Date()
      })
      this.emit('disconnect', +new Date())
      this.login()
    }, 3000)
  }

  login (credentials) {
    return new Promise(async (resolve, reject) => {
      if (
        typeof credentials !== 'object' ||
        !credentials['XSRF-TOKEN'] ||
        !credentials['trakteer-id-session'] ||
        !credentials.channel
      )
        throw Error('INCOMPLETE CREDENTIALS')
      this.credentials = credentials
      this.ws = new websocket(this.url)
      this.ws.on('open', () => {
        this.emit('debug', {
          type: 'connect',
          value: 'Websocket connected'
        })
        this.ws.on('message', async msg => {
          const data = JSON.parse(msg)

          if (data.event === 'pusher:connection_established') {
            const ready = JSON.parse(data.data)
            this.socketID = ready.socket_id
            const auth = await this.getAuth()
            this.ws.send(
              JSON.stringify({
                event: 'pusher:subscribe',
                data: {
                  auth: auth,
                  channel: this.credentials.channel
                }
              })
            )
            setInterval(() => {
              this.emit('debug', {
                type: 'heartbeat-send',
                value: +new Date()
              })
              this.ws.send(
                JSON.stringify({
                  event: 'pusher:ping',
                  data: {}
                })
              )
            }, ready.activity_timeout * 1000)
          }

          if (
            data.event ===
            'Illuminate\\Notifications\\Events\\BroadcastNotificationCreated'
          ) {
            const value = JSON.parse(data.data)
            this.emit('debug', {
              type: 'notification',
              value: value
            })
            this.emit('notification', value)
            if (value.type === 'new-tip-success') {
              this.emit('supporter', value)
            }
          }

          if (data.event === 'pusher_internal:subscription_succeeded') {
            this.emit('debug', {
              type: 'ready',
              value: 'Waiting for notification'
            })
            this.emit('ready', +new Date())
          }

          if (data.event === 'pusher:pong') {
            this.emit('debug', {
              type: 'heartbeat-receive',
              value: +new Date()
            })
          }
        })
      })
      this.ws.on('close', () => {
        this.reconnect()
      })
    })
  }
}

module.exports = Trakteer
