const bankai = require('bankai')
const merry = require('merry')
const path = require('path')
const Health = require('hyperhealth')
const lru = require('lru')

const notFound = merry.notFound
const error = merry.error
const env = merry.env({ PORT: 8080 })
const cache = lru(100)

const entry = path.join(__dirname, 'client.js')
const assets = bankai(entry)
const app = merry()

// TODO: pool swarms
cache.on('evict', function (item) {
  item.swarm.close()
  item.archive.close()
})

app.router([
  ['/404', notFound()],
  ['/', function (req, res, ctx, done) {
    done(null, assets.html(req, res))
  }],
  ['/bundle.js', (req, res, ctx, done) => {
    done(null, assets.js(req, res))
  }],
  ['/bundle.css', (req, res, ctx, done) => {
    done(null, assets.css(req, res))
  }],
  ['/health/:key', getHealth]
])

app.listen(env.PORT)

function getHealth (req, res, ctx, done) {
  app.log.info(ctx)
  if (!ctx.params.key) return done(error({statusCode: 400, message: 'key required'}))

  var health = cache.get(ctx.params.key)
  if (!health) {
    health = Health(ctx.params.key)
    cache.set(ctx.params.key, health)
  }

  const results = health.get()
  if (results) return done(null, results)

  req.setTimeout(500, () => {
    // May need to wait for content to populate on new healths
    if (results) return done(null, results)
    done(error({statusCode: 500, message: 'Could not get health?'}))
  })
}
