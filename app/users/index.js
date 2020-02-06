'use strict'

const {
  registration: registrationSchema,
  getuser: getUserSchema,
  adduser: addUserSchema
} = require('./schemas')

module.exports = async function (fastify, opts) {
  // Route registration
  // fastify.<method>(<path>, <schema>, <handler>)
  // schema is used to validate the input and serialize the output

  // Unlogged APIs
  fastify.post('/register', { schema: registrationSchema }, registerHandler)

  fastify.post('/add', {schema: addUserSchema}, addHandler)

  fastify.register(async function (fastify) {

    fastify.addHook('preHandler', fastify.authPreHandler)
    fastify.get('/me', meHandler)

  })

  /*fastify.setErrorHandler(function (error, request, reply) {
    const message = error.message
    if (errors[message]) {
      reply.code(412)
    }
    reply.send(error)
  })*/
}

// Fastify checks the existance of those decorations before registring `user.js`
module.exports[Symbol.for('plugin-meta')] = {
  decorators: {
    fastify: [
      'userService',
      'jwt'
    ]
  }
}

// In all handlers `this` is the fastify instance
// The fastify instance used for the handler registration


async function registerHandler (req, reply) {
  const { login, password } = req.body
  console.log("req body =" , req.body)
  
  const userId = await this.userService.register(login, password)
  return { jwt: this.jwt.sign({user: userId}) }
}

async function addHandler(req, reply) {
  const {first_name, last_name} = req.body
  console.log('body = ', req.body)

  const add = await this.userService.addUser(first_name, last_name)
  return add
}

async function meHandler (req, reply) {

  const query = await this.userService.getUser(req.user.user.id)
  
  return query
  
}


