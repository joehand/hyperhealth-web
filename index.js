const choo = require('choo')
const html = require('choo/html')
const css = require('sheetify')
const localcast = require('localcast')
const health = require('./components/health')

css('tachyons')

const cast = localcast('hyperhealth')
const app = choo()
app.use(log)
app.use(onConnection)
app.use(dataStore)

app.route('/', mainView)
app.mount('body')

function mainView (state, emit) {
  const welcome = html`
    <article class="pa3 ph5-ns mt4">
      <h3 class="f6 ttu tracked mt0">Getting Started</h3>
      <p class="measure f4 f3-ns lh-copy">
        Install hyperhealth via npm: <span class="code">npm install -g hyperhealth</span>.
      </p>
      <p class="measure f5 f4-ns lh-copy">
        Run <span class="code">hyperhealth [dat-key]</span> to view the health for a Dat archive.
        This page should automagically update and show the health!
      </p>
    </article>
  `

  return html`
    <body>
      <main>
        <header class="w-100 pa3 ph5-ns bg-white bb b--black-10">
          <div class="db dt-ns mw9 center w-100">
            <div class="db dtc-ns v-mid tl w-50">
              <a href="/" class="dib f5 f4-ns fw6 mt0 mb1 link black-70" title="Home">
                hyperhealth
                <div class="dib">
                  <small class="nowrap f6 mt2 mt3-ns pr2 black-70 fw2">web</small>
                </div>
              </a>
            </div>
            <nav class="db dtc-ns v-mid w-100 tl tr-ns mt2 mt0-ns">
              <a title="About" href="https://github.com/karissa/hyperhealth" class="f6 fw6 hover-blue link black-70 mr2 mr3-m mr4-l dib">
                About
              </a>
            </nav>
          </div>
        </header>
        ${state.connected ? health(state, emit) : welcome}
      </main>
    </body>
  `
}

function log (state, emitter) {
  emitter.on('*', function (messageName, data) {
    console.log('event', messageName, data)
  })
}

function onConnection (state, emitter) {
  cast.on('localcast', peer => {
    state.connected = true
    console.info(peer)
  })

  cast.on('key', key => {
    state.key = key
  })
}

function dataStore (state, emitter) {
  emitter.on('DOMContentLoaded', function () {
    cast.on('data', data => {
      state.data = data
      emitter.emit('render')
    })
  })
}
