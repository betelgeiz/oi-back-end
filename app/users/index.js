'use strict'

const {
    auth: authSchema,
    getuser: getUserSchema,
    adduser: addUserSchema
} = require('./schemas')

module.exports = async function(fastify, opts) {
    // Route registration
    // fastify.<method>(<path>, <schema>, <handler>)
    // schema is used to validate the input and serialize the output

    // Unlogged APIs
    fastify.post('/auth', { schema: authSchema }, authHandler)

    fastify.post('/add', { schema: addUserSchema }, addHandler)

    fastify.register(async function(fastify) {

        fastify.addHook('preHandler', fastify.authPreHandler)
        fastify.get('/me', meHandler)
        fastify.put('/', updateHandler)

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


async function authHandler(req, reply) {
    const { login, password } = req.body
    console.log("req body =", req.body)

    const userId = await this.userService.auth(login, password)
    let role

    if (userId.typeuser == 1) {
        role = 'admin'
    } else {
        role = 'user'
    }
    
    return { jwt: this.jwt.sign({ user: userId }), role: role }
}

async function addHandler(req, reply) {
    const { first_name, last_name } = req.body

    const add = await this.userService.addUser(first_name, last_name)
    return add
}

async function meHandler(req, reply) {

    const query = await this.userService.getUser(req.user.user.id)

    return query

}

async function updateHandler(req, reply) {
    const { login, fullname } = req.body

    const query = await this.userService.update(login, fullname, req.user.user.id)

    reply.code(204)
}
