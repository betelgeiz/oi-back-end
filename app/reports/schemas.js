'use strict'

const addreport = { // Добавить отчет
    body: {
        type: 'object',
        required: ['docslayoutid','typedoc', 'xmldoc', 'sender', 'status', 'kvartal'],
        properties: {
            docslayoutid:{
                type:'integer'
            },
            typedoc: {
                type: 'string'
            },
            xmldoc: {
                type: 'string'
            },
            sender: {
                type: 'string'
            },
            status: {
                type: 'integer'
            },
            kvartal: {
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
            idReport: { type: 'integer' }
        },
        additionalProperties: false
      }
    }
}

const confirmReport = { // Подтвердить документ от имени получателя
    body: {
        type: 'object',
        required: ['id', 'refer','ref'],
        properties: {
            id: { type: 'integer' },
            refer: { type: 'string' },
            ref:{type:'integer'}
        },
        additionalProperties: false
    }
}

const updateReport = { // Изменить документ
    body: {
        type: 'object',
        required: ['id', 'doc', 'status', 'kvartal', 'typedoc'],
        properties: {
            id: { type: 'integer' },
            doc: { type: 'string' },
            status: { type: 'integer' },
            kvartal: { type: 'string' },
            typedoc: { type: 'string' }
        },
        additionalProperties: false
    }
}

const updateStatus = { // Изменить статус отправки
    body: {
        type: 'object',
        required: ['type'],
        properties: {
            type: { type: 'string' }
        },
        additionalProperties: false
    }
}

const rejectReport = { // Отклонить отчет
    body: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'integer' }
        },
        additionalProperties: false
    }
}

const addLink = { // Добавление ссылки на документ от kse.kg
    body: {
        type: 'object',
        required: ['idfact', 'linkId'],
        properties: {
            idfact: { type: 'integer' },
            linkId: { type: 'string' }
        },
        additionalProperties: false
    }
}

const search = { // поисковый запрос
    body: {
        type: 'object',
        required: ['search', 'page', 'limit'],
        properties: {
            search: {type: 'string'},
            page: {type: 'integer'},
            limit: {type: 'integer'}
        },
        additionalProperties: false
    }
}


module.exports = {
    addreport,
    updateStatus,
    updateReport,
    confirmReport,
    search
}