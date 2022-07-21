"use strict";

const path = require("path");
const fp = require("fastify-plugin");
const cors = require("fastify-cors");
const jwt = require("fastify-jwt");
const axios = require("axios");
const fastifyStatic = require("fastify-static");
const multer = require("fastify-multer");
//const postgres = require('fastify-postgres')
const fpg = require("fastify-postgres");

const User = require("./users");
const UserService = require("./users/services");

const Reports = require("./reports");
const ReportsService = require("./reports/services");

const Admin = require("./admin");
const AdminsService = require("./admin/services");

const Company = require("./company");
const CompanyService = require("./company/services");

const Documents = require("./documents");
const DocumentsService = require("./documents/services");

const ManageAccounts = require("./manage_accounts");
const ManageAccountServices = require("./manage_accounts/services");

const UploadFile = require("./upload_file");
const UploadFileServices = require("./upload_file/services");

const EDS = require("./eds");
const EDSService = require("./eds/services");
const { request } = require("http");
const { doesNotMatch } = require("assert");
//////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////

async function connectToDatabase(fastify) {
	console.log("DB Connecting...");

	fastify
		.register(fpg, {
			// connectionString: `postgres://postgres:root@localhost/oi`,
			connectionString: "postgres://postgres:root@localhost/oi",
		})
		.after(() => {
			console.log("Finish DB Connecting.");
		});
}

async function authenticator(fastify) {
	console.log("Authenticator Loading...");
	fastify
		// JWT is used to identify the user
		// See https://github.com/fastify/fastify-jwt

		.register(jwt, {
			secret: "supersecret",
			algorithms: ["RS256"],
			sign: {
				issuer: "localhost/api",
				expiresIn: "8h",
			},
			verify: {
				issuer: "localhost/api",
			},
		});
	console.log("Finish Authenticator Loading.");
}

async function decorateFastifyInstance(fastify, opt, done) {
	console.log("Decorate Loading...");

	const storage = multer.diskStorage({
		destination: (req, file, cb) => {
			console.log(file)
			cb(null, `static`);
		},
		filename: (req, file, cb) => {
			console.log(file)
			const fx = file.originalname.split(".").pop();
			cb(null, `${file.fieldname}-${Date.now()}.${fx}`);
		},
	});
	const limitsUpload = {
		// fileSize: 1048576, //1MB 
		// fileSize: 2097152, //2MB 
		fileSize: 25097152, //20MB
		files: 11
	};
	fastify.decorate(
		"upload",
		multer({
			storage: storage,
			limits: limitsUpload,
			fileFilter: (req, file, cb) => {
			console.log(file)

				const filetypes = /doc|docx|pdf|xls|xlsx/;
				const extname = filetypes.test(
					path.extname(file.originalname).toLowerCase()
				);
				if (extname) {
					cb(null, true);
				} else {
					cb(null, false);
					cb(new Error(`Only ${filetypes} format allowed!`));
				}
			},
		})
	);
	const userService = new UserService(fastify.pg);

	const reportsService = new ReportsService(fastify.pg);

	const adminService = new AdminsService(fastify.pg);

	const companyService = new CompanyService(fastify.pg);

	const documentsService = new DocumentsService(fastify.pg);

	const accountServices = new ManageAccountServices(fastify.pg);

	const uploadfileServices = new UploadFileServices(fastify.pg);

	const edsService = new EDSService(fastify.pg);

	fastify.decorate("userService", userService);
	fastify.decorate("reportsService", reportsService);
	fastify.decorate("adminService", adminService);
	fastify.decorate("companyService", companyService);
	fastify.decorate("accountServices", accountServices);
	fastify.decorate("uploadfileServices", uploadfileServices);
	fastify.decorate("documentsService", documentsService);
	fastify.decorate("edsService", edsService);

	fastify.decorate("authPreHandler", async function auth(request, reply) {
		try {
			await request.jwtVerify();
		} catch (err) {
			reply.send(err);
		}
	});
	fastify.decorate("adminPreHandler", async function (request, reply) {
		try {
			const { user } = await fastify.jwt.decode(
				request.headers.authorization.split(" ")[1]
			);
			if (user.typeuser != 1) return reply.send("Вы не админ");
		} catch (error) {
			reply.send(err);
		}
	});
	console.log("Finish Decorate Loading.");
	done();
}

module.exports = async function (fastify, opts) {
	fastify.register(multer.contentParser);
	fastify.register(fp(connectToDatabase));
	fastify.register(fp(authenticator));
	fastify.register(fp(decorateFastifyInstance));
	fastify.register(cors, {
		origin: "*",
		path: "*",
		methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
		exposedHeaders: "Location,Date",
	});
	fastify.register(fastifyStatic, {
		root: path.join(__dirname, "..", "static"),
		prefix: "/api/static/",
		index: false,
	});
	// APIs modules
	fastify.register(User, { prefix: "/api/users" });
	fastify.register(Reports, { prefix: "/api/reports" });
	fastify.register(Admin, { prefix: "/api/admin" });
	fastify.register(Company, { prefix: "/api/company" });
	fastify.register(Documents, { prefix: "/api/documents" });
	fastify.register(ManageAccounts, { prefix: "/api/accounts" });
	fastify.register(UploadFile, { prefix: "/api/file" });
	fastify.register(EDS, { prefix: "/api/eds" });
};
