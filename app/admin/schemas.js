'use strict' 

const addreport = {
    body: {
        type: 'object',
        required: ['typedoc', 'xmldoc', 'sender', 'reciver'],
        properties: {
            typedoc: {
                type: 'string'
            },
            xmldoc: {
                type: 'string'
            },
            sender: {
                type: 'string'
            },
            reciver: {
                type: 'string'
            }
        },
        additionalProperties: false
    }
}

module.exports = {
    addreport
}