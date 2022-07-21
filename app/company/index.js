"use strict";

const { updateCompany, addCompany, addUser } = require("./schemas");

module.exports = async function (fastify, opts) {
  // Unlogged APIs
  // fastify.addHook("preHandler", fastify.authPreHandler);
  fastify.get("/", {
    preHandler: fastify.authPreHandler
  }, getCompanyInfoHandler); // Информация о компании по id
  fastify.put("/", { 
    schema: updateCompany,
    preHandler: fastify.authPreHandler
  }, updateCompanyInfoHandler);
  fastify.post("/", { 
    schema: addCompany,
    preHandler: fastify.authPreHandler
  }, addCompanyHandler);
  fastify.post("/user", { 
    schema: addUser,
    preHandler: fastify.authPreHandler
  }, addUserHandler);
  fastify.post("/search", searchHandler)

  //Public APIs 
  fastify.get("/list", getComponyList) // /company/list?limit=15&page=1
  fastify.get("/:kod", getComponyById)
  fastify.get("/reports", getCompanyReports)
  fastify.get("/diagram", getReportsDiagramKvartal)
  fastify.get("/finstate", getReportsDiagramFinState)
  fastify.get('/report/:id', getCompanyReportById)
};

// Fastify checks the existance of those decorations before registring `user.js`
module.exports[Symbol.for("plugin-meta")] = {
  decorators: {
    fastify: ["companyService"],
  },
};

// In all handlers `this` is the fastify instance
// The fastify instance used for the handler registration

async function getCompanyInfoHandler(req, reply) {
  const query = await this.companyService.getCompanyById(
    req.user.user.idcompany
  );
  return query;
}

async function updateCompanyInfoHandler(req, reply) {
  const {
    name,
    opforma,
    activity,
    address,
    phone,
    fax,
    email,
    supervisor,
    id,
    first_signers,
  } = req.body;

  await this.companyService.updateCompanyInfo(
    name,
    opforma,
    activity,
    address,
    phone,
    fax,
    email,
    supervisor,
    id,
    first_signers
  );
  reply.code(204);
}

async function addCompanyHandler(req, reply) {
  if (req.user.user.typeuser != 1) return false;
  const { name, kod } = req.body;
  let idCompany = await this.companyService.addCompany(name, kod);
  return { id: idCompany.id };
}

async function addUserHandler(req, reply) {
  if (req.user.user.typeuser != 1) return false;
  const { login, idcompany } = req.body;
  console.log('body =', req.body)
  await this.companyService.addUser(login, idcompany);
  reply.code(204);
}

async function getComponyList (req, reply) {
  const list = await this.companyService.getComponyList(req.query)
  reply.send(list)
}

async function getComponyById (req, reply) {
  const {kod} = req.params
  const company = await this.companyService.getComponyById(kod)
  reply.send(company)
}

async function getCompanyReports (req, reply){
  const reports = await this.companyService.getCompanyReports(req.query)
  reply.send(reports)
}

async function getReportsDiagramKvartal (req, reply) {
  const reports = await this.companyService.getReportsDiagramKvartal(req.query)
  reply.send(reports)
}

async function getReportsDiagramFinState (req, reply) {
  const state = await this.companyService.getReportsDiagramFinState(req.query)
  reply.send(state)
}

async function getCompanyReportById (req, reply){
  const report = await this.reportsService.getReportById(req.params.id);
  reply.send(report)
}

async function searchHandler(req, reply) {
  console.log(req.body)
  let {search, page, limit} = req.body
  let companyList = await this.companyService.getCompanyListBySearch(search, page, limit)
  return companyList
}