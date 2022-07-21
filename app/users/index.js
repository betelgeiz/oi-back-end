'use strict'
const {
    auth: authSchema,
    getuser: getUserSchema,
    adduser: addUserSchema
} = require('./schemas')

module.exports = async function (fastify, opts) {
    // Route registration
    // fastify.<method>(<path>, <schema>, <handler>)
    // schema is used to validate the input and serialize the output

    // Unlogged APIs
    fastify.post('/auth', {
        schema: authSchema
    }, authHandler)

    fastify.post('/add', {
        schema: addUserSchema
    }, addHandler)

    fastify.register(async function (fastify) {

        fastify.addHook('preHandler', fastify.authPreHandler)
        fastify.get('/me', meHandler)
        fastify.put('/', updateHandler)
        fastify.put('/password', passwordHandler)
        fastify.put('/userinn', updateUserInnHandler)
        fastify.get('/userinn', getUserInnHandler)
        fastify.put('/use', acceptHandler)
        fastify.get('/getpin', getPinHandler)

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
    const {
        login,
        password
    } = req.body

    const userId = await this.userService.auth(login, password)

    if (userId.status) {
        let role, changePas
        if (userId.rows.typeuser == 1) {
            role = 'admin'
        } else {
            role = 'user'
        }

        if (password == '123')
            changePas = 1
        else
            changePas = 0
        return {
            jwt: this.jwt.sign({
                user: userId.rows
            }),
            role: role,
            changePas: changePas
        }
    } else
        return userId

}

async function addHandler(req, reply) {
    const {
        first_name,
        last_name
    } = req.body

    const add = await this.userService.addUser(first_name, last_name)
    return add
}

async function meHandler(req, reply) {

    const query = await this.userService.getUser(req.user.user.id)

    return query

}

async function updateHandler(req, reply) {
    const {
        login,
        fullname
    } = req.body

    const query = await this.userService.update(login, fullname, req.user.user.id)

    reply.code(204)
}

async function passwordHandler(req, reply) {
    const {
        password
    } = req.body

    const query = await this.userService.updatePassword(req.user.user.id, password)

    reply.code(204)
}
// update user inn and form
async function updateUserInnHandler(req, reply) {
    const {
        user_inn,
        user_form
    } = req.body
    const query = await this.userService.updateUserInnAndForm(user_inn, user_form, req.user.user.id)
    reply.code(204)
}
async function getUserInnHandler(req, reply) {
    const query = await this.userService.getUserInnAndForm(req.user.user.id)
    reply.send(query)
}

async function acceptHandler(req, reply) {

    const query = await this.userService.acceptToUse(req.user.user.id)

    reply.code(204)
}

async function getPinHandler(req, reply) {

    const query = await this.userService.getUserInn(req.user.user.id)

    if (query.user_inn != null && query.user_inn != null) {
        const {
            user_inn,
            user_form
        } = query
        const authType = await this.userService.getUserAuthMethod(user_inn, user_form)
        if (authType.includes('email') || authType.includes('sms')) {

            const res = await this.userService.getUserPin(user_inn, user_form, authType)
            return res

        } else {
            return authType

        }

    } else {
        return 'К вашему профилю не закреплен ИНН. Обратитесь в техническую службу'
    }


}