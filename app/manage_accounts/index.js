'use strict'

module.exports = async function (fastify) {
  fastify.get('/', getUserListHandler)
  fastify.put('/', { 
    preHandler: fastify.authPreHandler, 
    preHandler: fastify.adminPreHandler}, 
    resetUserPasswordHandler
  )
}

module.exports[Symbol.for('plugin-meta')] = {
  decorators: {
      fastify: [
          'accountServices',
          'jwt'
      ]
  }
}

async function getUserListHandler(req, res){
  if (req.user.user.typeuser != 1) return false;
  const users = await this.accountServices.getUserList()
  return users
}

async function resetUserPasswordHandler(req, res){
  const {user_id} = req.body
  return await this.accountServices.resetUserPassword(user_id)
}