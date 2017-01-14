const html = require('choo/html')
const encoding = require('dat-encoding')
const prettyHash = require('pretty-hash')
const css = require('sheetify')

const header = (state, prev, send) => {

  const prefix = css`
    :host input:focus {
      width:500px !important;
    }
  `

  const keydown = (e) => {
    if (e.keyCode === 13) {
      var link = e.target.value
      e.target.value = 'dat://' + prettyHash(link)
      // TODO: basic parsing, validation of archive link before server-render
      send('location:set', '/' + encoding.toStr(link))
    }
  }

  const onfocus = (e) => {
    e.target.value = ''
  }

  return html`
    <header class="${prefix} flex justify-between bb b--light-gray">
      <h3 class="dib f3 flex items-center pa2 ml4">dat:// health</h3>
      <div class="flex-grow pa3 flex items-center">
        <input class="tc f4 input-reset mr4 ba b--near-white pa2 db w8 ${state.app.key ? '' : 'gray'}" type="text" value="${state.app.key ? 'dat://' + prettyHash(state.app.key) : 'dat://<link>'}" onkeydown=${keydown}" onfocus=${onfocus}/>
      </div>
    </header>
  `
}

module.exports = header