"use strict";

// Схемы нужны для того чтобы "жестко" прописать какой параметр
// и с каким типом данных может принимать сервер.

const {
  addreport: addReportSchema,
  updateStatus,
  updateReport,
  confirmReport,
  search
} = require("./schemas");

module.exports = async function (fastify, opts) {
  // Пути по которым можно обращаться серверу
  fastify.addHook("preHandler", fastify.authPreHandler);

  fastify.post("/", { schema: addReportSchema }, addHandler); // Добавить отчет

  fastify.get("/", getCompanyInfoHandler); // Информация о компании по id

  fastify.get("/allreports/:type", reportListHandler); // Все отчеты одной компании, либо все отчеты для админа

  fastify.get("/:id", reportViewHandler); // Просмотр отчета по id

  // fastify.put('/', { schema: confirmReport }, confirmReportHandler) // "Квитовка" отчета

  // fastify.post('/', confirmReportHandler) // "Квитовка" отчета

  ////////////////////////////////
  fastify.put("/demo/", confirmReportHandler); // "Квитовка" отчета
  fastify.post("/demo/", deleteConfirmReportHandler); // Удаление квитанции при ошибка подписи эцп

  fastify.put("/:id", { schema: updateReport }, updateReportHandler); // Обновление отчета

  fastify.put("/status/:id", { schema: updateStatus }, updateStatusHandler); // Обновление статуса отчета

  fastify.put("/back/:id", backReportHandler); // Отмена отправки отчета

  fastify.put("/reject/:id", rejectReportHandler); // Отклонение отчета

  fastify.put("/link/:linkId", addlinkHandler); // Добавление id факта из KSE

  fastify.delete("/:id", deleteReportHandler); // Удаление отчета

  fastify.delete("/deletingForever/:id", deletedTblDocumentsHandler); //Окончательное удаление

  fastify.delete("/recoverDoc/:id", recoverDocHandler); //Окончательное удаление

  fastify.put("/password", passwordHandler);

  fastify.post('/search', {schema: search} , searchHandler); // Поисковый запрос

  fastify.get("/allDelreports", selectDelreports); //del

  fastify.delete("/delete/:id", deleteHandler); // Удаление отчета
};

// Fastify checks the existance of those decorations before registring `user.js`
module.exports[Symbol.for("plugin-meta")] = {
  decorators: {
    fastify: ["reportsService", "userService"],
  },
};

// In all handlers `this` is the fastify instance
// The fastify instance used for the handler registration

async function addHandler(req, reply) {
  // const { docslayoutid, typedoc, xmldoc, sender, status, kvartal } = req.body;
  const result = await this.reportsService.addReport(req.body);
  //reply.code(204).header('Location', result)
  return { idReport: result.id };
  //{idReport: result.id}
}

async function getCompanyInfoHandler(req, reply) {
  const query = await this.reportsService.getCompanyById(
    req.user.user.idcompany
  );

  return query;
}

async function reportListHandler(req, reply) {
  let {limit, page} = req.query // получение № страницы и лимита с пагинации
  let query = await this.reportsService.getReports(
    req.user.user.id,
    req.params.type,
    limit,
    page
  );
  return query;
  // console.log(req)
  // return true
}

async function reportViewHandler(req, reply) {
  const query = await this.reportsService.getReportById(req.params.id);
  return query;
}

async function updateStatusHandler(req, reply) {
  const { type } = req.body;
  await this.reportsService.statusReport(req.params.id, type);
  //return 2
  reply.code(204);
}

async function backReportHandler(req, reply) {
  await this.reportsService.backReport(req.params.id);
  reply.code(204);
}

async function updateReportHandler(req, reply) {
  const { id, doc, status, kvartal, typedoc } = req.body;
  await this.reportsService.updateReport(id, doc, status, kvartal, typedoc);
  reply.code(204);
}

async function passwordHandler(req, reply) {
  
}

////////////////////From ADMIN/////////////////////

// async function confirmReportHandler(req, reply) {
//     if (req.user.user.typeuser == 1) {
//         const { id, interrefer } = req.body
//         const query = await this.reportsService.confirmReport(id, interrefer)

//         return query
//     }

//     return false
// }

async function confirmReportHandler(req, reply) {
  if (req.user.user.typeuser != 1) return false;
  const { id, interrefer, ref } = req.body;
  const query = await this.reportsService.confirmReport(id, interrefer, ref);
  return query;
}

async function deleteConfirmReportHandler(req, reply) {
  const {id_doc, id_receipt, sender, kvartal} = req.body
  await this.reportsService.deleteConfirmReport(id_doc, id_receipt, sender, kvartal)
  reply.code(204);
}

async function rejectReportHandler(req, reply) {
  if (req.user.user.typeuser != 1) return false;
  await this.reportsService.rejectReport(req.params.id);
  reply.code(204);
}

async function addlinkHandler(req, reply) {
  await this.reportsService.linkToKSE(req.body.idfact, req.params.linkId);

  reply.code(204);
}

async function deleteReportHandler(req, reply) {
  if (req.user.user.typeuser != 1) return false;
  await this.reportsService.deleteReport(req.params.id);

  reply.code(204);
}

async function deletedTblDocumentsHandler(req, reply) {

  if (req.user.user.typeuser != 1) return false;
  await this.reportsService.deletingForever(req.params.id);

  reply.code(204);
}

async function recoverDocHandler(req, reply) {
  await this.reportsService.recoverDoc(req.params.id);

  reply.code(204);
}

async function selectDelreports(req, reply) {
  if (req.user.user.typeuser != 1) return false;

  let query = await this.reportsService.selectDeletedDocs();

  return query;
}
async function deleteHandler(req, reply) {

  if (req.user.user.typeuser != 1) return false;
  let query = await this.reportsService.deleteHandler(req.params.id);

  reply.code(204);
}

async function searchHandler(req, reply) {

  if (req.user.user.typeuser != 1) return false;
  let {search, page, limit} = req.body
  //console.log(req.body)
  let query = await this.reportsService.searchHandler(search, page, limit)
  return query
}
