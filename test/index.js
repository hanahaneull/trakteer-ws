const client = require('../index.js')
const config = require('./config.json')
const trakteer = new client()

trakteer.on('debug', x => console.log(x))

trakteer.on('ready', x => console.log(x))

trakteer.on('disconnect', x => console.log(x))

trakteer.on('notification', x => console.log(x))

trakteer.on('supporter', x => console.log(x))

trakteer.login({
  'XSRF-TOKEN': config['XSRF-TOKEN'],
  'trakteer-id-session': config['trakteer-id-session'],
  channel: config.channel
})
