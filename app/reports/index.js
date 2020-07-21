'use strict'

// Схемы нужны для того чтобы "жестко" прописать какой параметр
// и с каким типом данных может принимать сервер.

const {
    addreport: addReportSchema,
    updateStatus,
    updateReport,
    confirmReport

} = require('./schemas')

module.exports = async function(fastify, opts) {

    // Пути по которым можно обращаться серверу
    fastify.addHook('preHandler', fastify.authPreHandler)

    fastify.post('/', { schema: addReportSchema }, addHandler) // Добавить отчет

    fastify.get('/', getCompanyInfoHandler) // Информация о компании по id

    fastify.get('/allreports/:type', reportListHandler) // Все отчеты одной компании, либо все отчеты для админа

    fastify.get('/:id', reportViewHandler) // Просмотр отчета по id

    fastify.put('/', { schema: confirmReport }, confirmReportHandler) // "Квитовка" отчета

    fastify.put('/:id', { schema: updateReport }, updateReportHandler) // Обновление отчета

    fastify.put('/status/:id', { schema: updateStatus }, updateStatusHandler) // Обновление статуса отчета

    fastify.put('/back/:id', backReportHandler) // Отмена отправки отчета

    fastify.put('/reject/:id', rejectReportHandler) // Отклонение отчета

    fastify.put('/link/:linkId', addlinkHandler) // Добавление id факта из KSE

    fastify.delete('/:id', deleteReportHandler) // Удаление отчета

}

// Fastify checks the existance of those decorations before registring `user.js`
module.exports[Symbol.for('plugin-meta')] = {
    decorators: {
        fastify: [
            'reportsService'
        ]
    }
}

// In all handlers `this` is the fastify instance
// The fastify instance used for the handler registration

async function addHandler(req, reply) {
    const { typedoc, xmldoc, sender, status, kvartal } = req.body

    //console.log('body= ', req.body)

    const result = await this.reportsService.addReport(typedoc, xmldoc, sender, status, kvartal)
    reply.code(204).header('Location', result)
}


async function getCompanyInfoHandler(req, reply) {

    const query = await this.reportsService.getCompanyById(req.user.user.idcompany)

    return query
}

async function reportListHandler(req, reply) {

    let query = await this.reportsService.getReports(req.user.user.id, req.params.type)
    
    return query

}

async function reportViewHandler(req, reply) {

    const query = await this.reportsService.getReportById(req.params.id)

    return query
}

async function updateStatusHandler(req, reply) {
    const { type } = req.body

    await this.reportsService.statusReport(req.params.id, type)

    reply.code(204)
}

async function backReportHandler(req, reply) {

    await this.reportsService.backReport(req.params.id)

    reply.code(204)
}

async function updateReportHandler(req, reply) {

    const { id, doc, status } = req.body

    await this.reportsService.updateReport(id, doc, status)

    reply.code(204)

}



////////////////////From ADMIN/////////////////////

async function confirmReportHandler(req, reply) {
    if (req.user.user.typeuser == 1) {
        const { id, interrefer } = req.body
        const query = await this.reportsService.confirmReport(id, interrefer)

        return query
    }

    return false
}

async function rejectReportHandler(req, reply) {

    await this.reportsService.rejectReport(req.params.id)

    reply.code(204)

}

async function addlinkHandler(req, reply) {

    await this.reportsService.linkToKSE(req.body.idfact, req.params.linkId)

    reply.code(204)

}

async function deleteReportHandler(req, reply) {

    await this.reportsService.deleteReport(req.params.id)

    reply.code(204)

}
