'use strict'

const updateCompany = {
    body: {
        type: 'object',
        required: ['name', 'opforma', 'activity', 'address', 'phone', 'fax', 'email', 'supervisor', 'id'],
        properties: {
            name: {
                type: 'string'
            },
            opforma: {
                type: 'string'
            },
            activity: {
                type: 'string'
            },
            address: {
                type: 'string'
            },
            phone: {
                type: 'string'
            },
            fax: {
                type: 'string'
            },
            email: {
                type: 'string'
            },
            supervisor: {
                type: 'string'
            },
            id: {
                type: 'integer'
            }
        },
        additionalProperties: false
    }
}

const addCompany = {
    body: {
        type: 'object',
        required: ['name', 'kod'],
        properties: {
            name: {
                type: 'string'
            },
            kod: {
                type: 'string'
            }
        },
        additionalProperties: false
    },
    response: {
      // The 200 body response is described
      // by the following schema
      200: {
        type: 'object',
        required: [ 'id' ],
        properties: {
          idCompany: { type: 'integer' }
        },
        additionalProperties: false
      }
    }
}

const addUser = {
    body: {
        type: 'object',
        required: ['login', 'idcompany'],
        properties: {
            login: {
                type: 'string'
            },
            idcompany: {
                type: 'integer'
            }
        },
        additionalProperties: false
    }
}

//name, opforma, activity, address, phone, fax, email, supervisor, id

module.exports = {
    updateCompany,
    addCompany,
    addUser
}