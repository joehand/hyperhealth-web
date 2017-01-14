const Model = require('choo-model')
const http = require('xhr')
const encoding = require('dat-encoding')

module.exports = createModel

function createModel (cb) {
  const model = Model('app')
  const UPDATE_TIMEOUT = 5000

  model.state({
    key: null,
    health: null,
    fetched: false
  })

  model.reducer('update', (state, data) => {
    return data
  })

  model.effect('getHealth', (state, data, send, done) => {
    try {
      data = encoding.toStr(data)
    } catch (e) {
      return send('app:update', {error: 'Invalid Key', key: data}, done)
    }
    send('app:update', { loading: true }, done)
    http.get('/api/' + data, function (err, res, body) {
      if (err) return send('app:update', {error: 'error getting health. There may be nobody hosting that link.', key: data, loading: false}, done)
      if (res.statusCode === 404) return send('app:update', {error: '404 - Bad API url', key: data, loading: false}, done)
      if (res.statusCode !== 200) return send('app:update', {error: res.message, key: data, loading: false}, done)
      send('app:update', { key: data, health: JSON.parse(body), loading: false, autoUpdate: true}, done)
    })
  })

  model.effect('updateHealth', (state, data, send, done) => {
    if (!state.key || state.loading) return done()
    http.get('/api/' + state.key, function (err, res, body) {
      if (!res.statusCode === 200) return noUpdate()
      send('app:update', { health: JSON.parse(body), loading: false, autoUpdate: true}, done)
    })

    function noUpdate() {
      send('app:update', {autoUpdate: false}, done)
    }
  })

  model.subscription('updateHealth', (send, done) => {
    // TODO: only start this when we get a key
    setInterval(function () {
      send('app:updateHealth', null, done)
    }, UPDATE_TIMEOUT)
  })

  return model.start()
}