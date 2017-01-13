const Model = require('choo-model')
const http = require('xhr')
const encoding = require('dat-encoding')

module.exports = createModel

function createModel (cb) {
  const model = Model('app')

  model.state({
    key: null,
    health: null
  })

  model.reducer('update', (state, data) => {
    return data
  })

  model.effect('getHealth', (state, data, send, done) => {
    try {
      data = encoding.toStr(data)
    } catch (e) {
      return send('app:update', {error: 'Invalid Key'}, done)
    }
    http.get('/health/' + data, function (err, res, body) {
      if (res.statusCode !== 200 && res.message) return send('app:update', {error: res.message}, done)
      if (err) return send('app:update', {error: 'error getting health'}, done)
      send('app:update', { key: data, health: JSON.parse(body) }, done)
    })
  })

  // model.subscriptions('updateHealth', (send, done) => {
  //   setInterval(function () {

  //   }, 1000)
  // }

  return model.start()
}