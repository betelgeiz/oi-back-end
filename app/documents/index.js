'use strict'


module.exports = async function(fastify, opts) {

    fastify.get('/docsList', getDocsListHandler)
    fastify.get('/doc/:name', getDocHandler)
}

// Fastify checks the existance of those decorations before registring `user.js`
module.exports[Symbol.for('plugin-meta')] = {
    decorators: {
        fastify: [
            'documentsService',
            'jwt'
        ]
    }
}

// In all handlers `this` is the fastify instance
// The fastify instance used for the handler registration


async function getDocsListHandler(req, reply) {
    return await this.documentsService.getDocsList()
}

async function getDocHandler(req, reply) {
    
    const doc_name = req.params.name
    return await this.documentsService.getDoc(doc_name)
 
}


