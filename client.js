const mount = require('choo/mount')
const html = require('choo/html')
const log = require('choo-log')
const css = require('sheetify')
const choo = require('choo')
const encoding = require('dat-encoding')
const header = require('./components/header')

;css('tachyons')

const app = choo()
app.use(log())

app.model(require('./models/app')())

app.router([
  ['/', mainView],
  ['/:key', require('./pages/health')]
])
mount('body', app.start())

function mainView (state, prev, send) {
  if (state.app.key && !state.location.params.key) send('location:set', '/' + state.app.key)

  return html`
    <body class="">
      <link href="//fonts.googleapis.com/css?family=Source+Sans+Pro:400,600,700" rel="stylesheet" type="text/css">
      ${header(state, prev, send)}
      <main>
        <article class="vh-75 dt w-100">
          <div class="dtc v-mid w-50 tc ph5 ph4-l">
            <h1 class="f6 f2-m f-subheadline-l fw6 tc">dat:// health!</h1>
            <h3 class="f5 f2-m fw6 tc">Get peer and size information for a Dat Link.</h3>
            <h4 class="f6 f2-m gray fw6 tc">(enter a link on the top right or <a class="link dim green" href="/79cf7ecc9baf627642099542b3714bbef51810da9f541eabb761029969d0161b">see an example</a>)</h4>
          </div>
        </article>
      </main>
    </body>
  `
}
