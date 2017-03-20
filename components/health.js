'use strict'

const choo = require('choo')
const html = require('choo/html')
const css = require('sheetify')
const prettyBytes = require('pretty-bytes')
const circle = require('../elements/circle')

css('tachyons')
css`
  body {
    color: #293648;
    font-family: 'Source Sans Pro', 'Helvetica Neue', 'Lucida Grande', Arial, sans-serif;
  }
  .pulse-circle {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    box-shadow: 0 0 0 rgba(205, 236, 255, 0.6);
    animation: pulse 2s 1s infinite;
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

function healthView (state, emit) {
  if (!state.connected || !state.data) return ''

  return html`
    <div>
      <section class="w-75 center tc pt4 pb3">
        <p class="ttu tracked code">${statusMsg(state)}</p>
      </section>
      <section>
        ${healthDisplay(state)}
      </section>
    </div>
  `
}

function statusMsg (state) {
  return state.connected
          ? state.data && state.data.blocks
            ? 'dat://' + state.key
            : 'LOADING... (please wait few seconds while we connect)'
          : "something went terribly wrong (with joe's logic). =("
}

function healthDisplay (state) {
  if (!state.data) return ''
  const health = state.data
  const completedPeers = health.peers.filter(peer => {
    return peer.have === peer.blocks
  })
  const peers = health.peers.sort((a, b) => {
    return parseFloat(a.have) - parseFloat(b.have)
  })

  return html`
  <div>
    <article class="cf ph1">
      <div class="fl w-100 w-40-ns pl5">
        <dl class="dib w-40 lh-title">
          <dd class="f6 fw4 ml0">Total Peers</dd>
          <dd class="f2 f-subheadline-l fw6 ml0">${peers.length}</dd>
        </dl>
        <dl class="dib w-40 lh-title">
          <dd class="f6 fw4 ml0">Completed Peers</dd>
          <dd class="f2 f-subheadline-l fw6 ml0">${completedPeers.length}</dd>
        </dl>
        <dl class="db w-auto-l lh-title">
          <dd class="f6 fw4 ml0">Total Size</dd>
          <dd class="f2 f-subheadline-l fw6 ml0">${prettyBytes(health.bytes)}</dd>
        </dl>
        <dl class="db w-auto-l lh-title">
          <dd class="f6 fw4 ml0">Blocks</dd>
          <dd class="f2 f-subheadline-l fw6 ml0">${health.blocks}</dd>
        </dl>
        ${state.connected ? html`<p class="fw4 gray"><span class="v-mid mr2 bg-lightest-blue dib pulse-circle"></span>autoupdating</p>` : ''}
      </div>
      <div class="fl w-100 w-60-ns tc">
        ${health.peers.map((peer, i) => {
          const prog = peer.have * 100/peer.blocks
          return circle(prog)
        })}
      </div>
    </article>
  </div>
  `
}
