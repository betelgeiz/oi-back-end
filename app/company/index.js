'use strict'

const {
    updateCompany,
    addCompany,
    addUser
} = require('./schemas')

module.exports = async function(fastify, opts) {

    // Unlogged APIs
    fastify.addHook('preHandler', fastify.authPreHandler)


    fastify.get('/', getCompanyInfoHandler) // Информация о компании по id
    fastify.put('/', { schema: updateCompany }, updateCompanyInfoHandler)
    fastify.post('/', {schema: addCompany}, addCompanyHandler)
    fastify.post('/user', {schema: addUser}, addUserHandler)

}

// Fastify checks the existance of those decorations before registring `user.js`
module.exports[Symbol.for('plugin-meta')] = {
    decorators: {
        fastify: [
            'companyService'
        ]
    }
}

// In all handlers `this` is the fastify instance
// The fastify instance used for the handler registration


async function getCompanyInfoHandler(req, reply) {

    const query = await this.companyService.getCompanyById(req.user.user.idcompany)

    return query
}

async function updateCompanyInfoHandler(req, reply) {
    const { name, opforma, activity, address, phone, fax, email, supervisor, id } = req.body

    await this.companyService.updateCompanyInfo(name, opforma, activity, address, phone, fax, email, supervisor, id)

    reply.code(204)
}

async function addCompanyHandler(req, reply) {
    const {name, kod} = req.body

    let idCompany = await this.companyService.addCompany(name, kod)
    // console.log('id компании= ',idCompany)
    return {idCompany: idCompany.id}
}

async function addUserHandler(req, reply) {
    const {login, idcompany} = req.body

     await this.companyService.addUser(login, idcompany)
    // console.log('id компании= ',idCompany)
    reply.code(204)
}
