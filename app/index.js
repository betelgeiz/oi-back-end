'use strict'

const path = require('path')
const fp = require('fastify-plugin')
const cors = require('fastify-cors')
const jwt = require('fastify-jwt')
//const postgres = require('fastify-postgres')
const fpg = require('fastify-postgres')

const User = require('./users')
const UserService = require('./users/services')

const Reports = require('./reports')
const ReportsService = require('./reports/services')

const Admin = require('./admin')
const AdminsService = require('./admin/services')

const Company = require('./company')
const CompanyService = require('./company/services')



async function connectToDatabase(fastify) {
  console.log('DB Connecting...')

  fastify.register(fpg, {
    connectionString: `postgres://postgres:12kse34@localhost/oi`,
    max: 20
  })
  console.log('Finish DB Connecting.')
}

/*async function connectToDb(fastify) {
  fastify.register(postgres, {
    connectionString: 'postgres://postgres:123@localhost/openinformation'
  })
}*/


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
  const db = fastify.pg
  const userService = new UserService(db)

  const reportsService = new ReportsService(db)

  const adminService = new AdminsService(db)

  const companyService = new CompanyService(db)

  fastify.decorate('userService', userService)
  fastify.decorate('reportsService', reportsService)
  fastify.decorate('adminService', adminService)
  fastify.decorate('companyService', companyService)
  
  fastify.decorate('authPreHandler', async function auth(request, reply) {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.send(err)
    }
  })
 
  console.log('Finish Decorate Loading.')
}

module.exports = async function(fastify, opts) {
  fastify
    .register(fp(authenticator))
    .register(fp(connectToDatabase))
    .register(fp(decorateFastifyInstance))
    .register(cors, {
      origin: '*',
      path: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      exposedHeaders: 'Location,Date'
    })

    // APIs modules
    .register(User, {prefix: '/api/users'})
    .register(Reports, {prefix: '/api/reports'})
    .register(Admin, {prefix: '/api/admin'})
    .register(Company, {prefix: '/api/company'})
}
