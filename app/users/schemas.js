'use strict' 

const registration = {
    // This jsonschema will be used for data validation
    body: {
        type: 'object',
        required: ['login', 'password'],
        properties: {
            login: {
                type: 'string'
            },
            password: {
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
            properties: {
                jwt: { type: 'string' }
            },
            additionalProperties: false
        }
    }
}

const getuser = {
    params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: {
            type: 'string',
            pattern: '[0-9]'
          }
        }
      }
}

const adduser = {
    body: {
        type: 'object',
        required: ['first_name', 'last_name'],
        properties: {
            first_name: {
                type: 'string'
            },
            last_name: {
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
            properties: {
                result: { type: 'string' }
            },
            additionalProperties: false
        }
    }
}

module.exports = {
    registration,
    getuser,
    adduser
}