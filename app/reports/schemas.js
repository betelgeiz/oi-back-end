'use strict'

const addreport = { // Добавить отчет
    body: {
        type: 'object',
        required: ['typedoc', 'xmldoc', 'sender', 'status', 'kvartal'],
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
            status: {
                type: 'integer'
            },
            kvartal: {
                type: 'string'
            }
        },
        additionalProperties: false
    }
}

const confirmReport = { // Подтвердить документ от имени получателя
    body: {
        type: 'object',
        required: ['id', 'interrefer'],
        properties: {
            id: { type: 'integer' },
            interrefer: { type: 'string' }
        },
        additionalProperties: false
    }
}

const updateReport = { // Изменить документ
    body: {
        type: 'object',
        required: ['id', 'doc', 'status'],
        properties: {
            id: { type: 'integer' },
            doc: { type: 'string' },
            status: { type: 'integer' }
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


module.exports = {
    addreport,
    updateStatus,
    updateReport,
    confirmReport
}