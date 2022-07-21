'use strict'

// const {
//   addreport: addReportSchema
// } = require('./schemas')

module.exports = async function (fastify, opts) {

  // Unlogged APIs
  fastify.addHook('preHandler', fastify.authPreHandler)


  fastify.get('/', getAllReports)

  fastify.put('/', confirmReportHandler)


}

// Fastify checks the existance of those decorations before registring `user.js`
module.exports[Symbol.for('plugin-meta')] = {
  decorators: {
    fastify: [
      'adminService'
    ]
  }
}

// In all handlers `this` is the fastify instance
// The fastify instance used for the handler registration



async function getAllReports (req, reply) {

  if (req.user.user[0].typeuser == 1) {
    const query = await this.adminService.getAllReports()
  
    return query
  }

  return false

}

async function confirmReportHandler (req, reply) {
  if (req.user.user[0].typeuser == 1) {
    const { id, interrefer } = req.body
    const query = await this.adminService.confirmReport(id, interrefer)
  
    return query
  }

  return false
}



