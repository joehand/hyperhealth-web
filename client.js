const mount = require('choo/mount')
const html = require('choo/html')
const log = require('choo-log')
const css = require('sheetify')
const choo = require('choo')
const encoding = require('dat-encoding')
const prettyBytes = require('pretty-bytes')

css('tachyons')

const app = choo()
app.use(log())

app.model(require('./models/app')())

app.router(['/', mainView])
mount('body', app.start())

function mainView (state, prev, send) {
  const keydown = (e) => {
    if (e.keyCode === 13) {
      var link = e.target.value
      e.target.value = ''
      // TODO: basic parsing, validation of archive link before server-render
      send('app:getHealth', link)
    }
  }

  return html`
    <body class="pa3 pa4-ns">
      <header class="tc">
        <h3 class="f3 ttu">Dat Health</h3>
      </header>
      <main>
        <section class="ttu tracked code w-75 center tc">
          <input class="tc f4 input-reset ba b--near-white pa2 mb2 db w-100" type="text" placeholder="${state.app.key ? 'dat://' + encoding.toStr(state.app.key) : 'Dat Key'}" onkeydown=${keydown}/>
          <p>${state.app.error}</p>
        </section>
        <section>
          ${healthDisplay(state.app)}
        </section>
      </main>
    </body>
  `
}

function healthDisplay (data) {
  if (!data.key) return ''
  const health = data.health
  return html`
  <div>
    <article class="pa3 pa5-ns" data-name="slab-stat-large">
      <div class="cf">
        <dl class="db dib-l w-auto-l lh-title mr6-l">
          <dd class="f6 fw4 ml0">Connected Peers</dd>
          <dd class="f2 f-subheadline-l fw6 ml0">${health.connected}</dd>
        </dl>
        <dl class="db dib-l w-auto-l lh-title mr6-l">
          <dd class="f6 fw4 ml0">Total Size</dd>
          <dd class="f2 f-subheadline-l fw6 ml0">${prettyBytes(health.bytes)}</dd>
        </dl>
        <dl class="db dib-l w-auto-l lh-title mr6-l">
          <dd class="f6 fw4 ml0">Blocks</dd>
          <dd class="f2 f-subheadline-l fw6 ml0">${health.blocks}</dd>
        </dl>
      </div>
    </article>
    <div class="">
      <ul class="list pl0 measure center">
      ${health.peers.map((peer, i) => {
        const prog = peer.have/peer.blocks
        return html`
          <li class="lh-copy pv3">Peer ${i} - ${prog*100}% <progress class="w-100 db bn input-reset br-100 h1" value=${prog}></progress></li>
        `
      })}
      </ul>
    </div>
  </div>
  `
}
