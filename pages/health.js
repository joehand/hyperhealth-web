'use strict'

const html = require('choo/html')
const css = require('sheetify')
const choo = require('choo')
const encoding = require('dat-encoding')
const prettyBytes = require('pretty-bytes')
const pixelGrid = require('pixel-grid')
const widget = require('cache-element/widget')
const header = require('../components/header')

;css('tachyons') // I wish dependency-check would detect these :(
;css`
  body {
    color: #293648;
    font-family: 'Source Sans Pro', 'Helvetica Neue', 'Lucida Grande', Arial, sans-serif;
  }
  .pulse-circle {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    box-shadow: 0 0 0 rgba(205, 236, 255, 0.6);
    animation: pulse 3s 2s infinite;
  }
  .pulse-circle:hover {
    animation: none;
  }

  @-webkit-keyframes pulse {
    0% {
      -webkit-box-shadow: 0 0 0 0 rgba(205, 236, 255, 1);
    }
    70% {
        -webkit-box-shadow: 0 0 0 10px rgba(205, 236, 255, 0);
    }
    100% {
        -webkit-box-shadow: 0 0 0 0 rgba(205, 236, 255, 0);
    }
  }
  @keyframes pulse {
    0% {
      -moz-box-shadow: 0 0 0 0 rgba(205, 236, 255, 1);
      box-shadow: 0 0 0 0 rgba(205, 236, 255, 1);
    }
    70% {
        -moz-box-shadow: 0 0 0 20px rgba(205, 236, 255, 0);
        box-shadow: 0 0 0 20px rgba(205, 236, 255, 0);
    }
    100% {
        -moz-box-shadow: 0 0 0 0 rgba(205, 236, 255, 0);
        box-shadow: 0 0 0 0 rgba(205, 236, 255, 0);
    }
  }
`

module.exports = healthView

const grids = []

function healthView (state, prev, send) {
  if (state.location.params.key && !state.app.key && !state.app.loading) send('app:getHealth', state.location.params.key)

  return html`
    <body class="">
      <link href="//fonts.googleapis.com/css?family=Source+Sans+Pro:400,600,700" rel="stylesheet" type="text/css">
      ${header(state, prev, send)}
      <main>
        <section class="w-75 center tc pt4 pb3">
          <p class="ttu tracked code">${statusMsg(state.app)}</p>
        </section>
        <section>
          ${healthDisplay(state.app)}
        </section>
      </main>
    </body>
  `
}

function statusMsg (data) {
  return !data.loading
          ? data.health && data.health.blocks
            ? 'dat://' + data.key
            : 'LOADING... (please wait few seconds while we connect)'
          : data.error
}

function healthDisplay (data) {
  if (!data.health) return ''
  const health = data.health
  return html`
  <div>
    <article class="cf ph1">
      <div class="fl w-100 w-40-ns pl5">
        <dl class="db w-auto-l lh-title">
          <dd class="f6 fw4 ml0">Connected Peers</dd>
          <dd class="f2 f-subheadline-l fw6 ml0">${health.connected}</dd>
        </dl>
        <dl class="db w-auto-l lh-title">
          <dd class="f6 fw4 ml0">Total Size</dd>
          <dd class="f2 f-subheadline-l fw6 ml0">${prettyBytes(health.bytes)}</dd>
        </dl>
        <dl class="db w-auto-l lh-title">
          <dd class="f6 fw4 ml0">Blocks</dd>
          <dd class="f2 f-subheadline-l fw6 ml0">${health.blocks}</dd>
        </dl>
        ${data.autoUpdate ? html`<p class="fw4 gray"><span class="v-mid mr2 bg-lightest-blue dib pulse-circle"></span>autoupdating</p>` : ''}
      </div>
      <div class="fl w-100 w-60-ns tc">
        <div class="">
        ${health.peers.map((peer, i) => {
          const prog = peer.have * 100/peer.blocks
          grids[i] = grids[i] || Grid()
          return grids[i](i, prog)
        })}
        </ul>
      </div>
    </article>
  </div>
  `
}

function Grid () {
  return widget({
    onupdate: function (el, i, prog) {
      el.pixels.frame(function () {
        el.pixels.update(createGrid(prog))
      })
    },
    render: function (i, prog) {
      const el = html`
        <div class="dib mr5" id="grid-${i}">
          <h3>Peer ${i}</h3>
        </div>
      `
      const pixels = pixelGrid(createGrid(prog), {
        root: el,
        size: 6,
        padding: 1,
        columns: 4,
        rows: 50,
        background: [.91, .92, .93],
        formatted: true
      })
      el.pixels = pixels
      return el
    }
  })

  function createGrid (prog) {
    const gridData = []
    for (let i = 0; i < 200; i++) {
      if (i < prog * 2) {
        switch (true) {
          case prog === 100:
            gridData.push([.207, .705, .310])
            break
          case prog > 50:
            gridData.push([.207, .705, .310])
            break
          default:
            gridData.push([.207, .705, .310])
            break
        }
      } else {
        gridData.push([.91, .92, .93])
      }
    }
    return gridData
  }
}
