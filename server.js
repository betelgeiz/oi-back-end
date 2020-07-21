'use strict'
// Read the .env file.
//require('dotenv').config()

// Require the framework
const fs = require('fs')
const path = require('path')
const fastify = require('fastify')({
  logger: true,
  ignoreTrailingSlash: true,
  http2: true,
  https: {
    key: fs.readFileSync(path.join(__dirname, '/app/certs/',  'ssl-cert-snakeoil.key')),
    cert: fs.readFileSync(path.join(__dirname, '/app/certs/', 'ssl-cert-snakeoil.pem'))
  }
})

// New comment

// Register swagger.
//const swagger = require('./config/swagger')
//fastify.register(require('fastify-swagger'), //swagger.options)

// Register application as a normal plugin.
const app = require('./app')
fastify.register(app)

// Start listening.
const start = async () => {
  try {
    await fastify.listen(process.env.PORT || 8769, '0.0.0.0')
    //await fastify.listen(8769)

    //fastify.swagger()
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()

// curl -d "{\"username\":\"Aziret\", \"password\":\"123\"}" -H "Content-Type: application/json" -X POST http://127.0.0.1:8769/api/users/register
// curl -d "{\"username\":\"Aziret\"}" -H "Content-Type: application/json" -X POST http://127.0.0.1:8769/api/test/me
// curl -H "Content-Type: application/json" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiQXppcmV0IDEyMyIsImlhdCI6MTU3OTc3Nzg4NCwiZXhwIjoxNTc5NzkyMjg0LCJpc3MiOiJvaS5rc2Uua2cvYXBpIn0.s7bwJpuSPY__Chg32Gc8lg_ncLkgZMYOp-XwHiRs9Dg" -d '{"username":"Aziret"}' http://127.0.0.1:8769/api/test/me
