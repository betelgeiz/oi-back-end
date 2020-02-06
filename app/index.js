'use strict'

const path = require('path')
const fp = require('fastify-plugin')
const cors = require('fastify-cors')
const jwt = require('fastify-jwt')
const mysql = require('fastify-mysql')
//console.log('mysql= ', mysql)

const User = require('./users')
const UserService = require('./users/services')

const Test = require('./test')
const TestService = require('./test/services')


async function connectToDb(fastify) {
  fastify.register(mysql, {
    promise: true,
    connectionString: 'mysql://root:123@localhost/test'
  })
}


async function authenticator(fastify) {
  console.log('Authenticator Loading...')
  fastify
    // JWT is used to identify the user
    // See https://github.com/fastify/fastify-jwt
    
    .register(jwt, {
      secret: 'supersecret',
      algorithms: ['RS256'],
      sign: {
        issuer: 'oi.kse.kg/api',
        expiresIn: '4h'
      },
      verify: {
        issuer: 'oi.kse.kg/api'
      }
    })
  console.log('Finish Authenticator Loading.')
}


async function decorateFastifyInstance(fastify) {
  console.log('Decorate Loading...')
  const db = fastify.mysql
  const userService = new UserService(db)
  const testService = new TestService()
  

  fastify.decorate('userService', userService)
  
  fastify.decorate('authPreHandler', async function auth(request, reply) {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.send(err)
    }
  })

  
    
  fastify.decorate('testService', testService)
  
  console.log('Finish Decorate Loading.')
}

module.exports = async function(fastify, opts) {
  fastify
    .register(fp(authenticator))
    .register(fp(connectToDb))
    .register(fp(decorateFastifyInstance))
    .register(cors, {
      path: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      exposedHeaders: 'Location,Date'
    })

    // APIs modules
    .register(User, {prefix: '/api/users'})
    .register(Test, {prefix: '/api/test'})
}
