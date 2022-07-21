
module.exports = async function (fastify) {
  const filetypes = [
    {name: 'balance'}, // Баланс
    {name: 'opu'}, // ОПУ
    {name: 'auditreport'}, // Аудит
    {name: 'corporate'}, // Кодекс
    {name: 'listing_prospectus'}, // Листинговый проспект
    {name: 'fin_rep'}, // Отчет о фин.результатах
    {name: 'cash_flow'}, // Отчет о движении денежных средств
    {name: 'cap_rep'}, // Отчет об изменениях в капитале
    {name: 'anex_1'}, // Приложение 1
    {name: 'anex_2'}, // Приложение 2
    {name: 'anex_2_1'}, // Приложение 2_1
    {name: 'analytics'} // Сведения о соблюдении экономических нормативов
  ]
  fastify.post('/', { preHandler: [fastify.upload.fields(filetypes)]}, uploadFileReport)
  fastify.post('/remove', removeFileReport)
}

async function uploadFileReport(req, reply){
  // console.log(req.files)
  const data = await this.uploadfileServices.uploadFileReport(req)
  reply.send('data')
}

async function removeFileReport (req, reply) {
  const data = await this.uploadfileServices.deleteFileReport(req.body)
  reply.send(data)
}