"use strict";
const axios = require("axios");
class ReportsService {
	constructor(db) {
		this.db = db;
	}

	async addReport({ docslayoutid, typedoc, xmldoc, sender, status, kvartal }) {
		const connection = await this.db.connect();
		try {
			let data = new Date();
			let month = data.getMonth();
			let kv = "";
			switch (month) {
				case 1:
				case 2:
				case 3:
					kv = "2022; 1 квартал";
					break;
				case 4:
				case 5:
				case 6:
					kv = "2022; 2 квартал";
					break;
				case 7:
				case 8:
				case 9:
					kv = "2022; 3 квартал";
					break;
				case 10:
				case 11:
				case 12:
					kv = "2022; 4 квартал";
					break;
			}
			if (kvartal == "; ") kvartal = kv;
			const { rows } = await connection.query(
				"INSERT INTO tbldocuments (docslayoutid,typedoc, doc, sender, status, createdate, kvartal) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id",
				[docslayoutid, typedoc, xmldoc, sender, status, data, kvartal]
			);
			return rows[0];
		} catch (err) {
			return err;
		} finally {
			connection.release();
		}
	}

	async getCompanyById(id) {
		const connection = await this.db.connect();
		try {
			const { rows } = await connection.query(
				"SELECT name, kod, opforma, activity, address FROM tblcompany where id = $1",
				[id]
			);
			return rows[0];
		} catch (err) {
		} finally {
			connection.release();
		}
	}

	async getReports(id, type, limit, page) {
		const connection = await this.db.connect();
		try {
			let queryString = `limit ${limit} offset ${page ? limit*page-limit : 0}`;
			const  list  = await connection.query(
				`
                SELECT 
                tbldocuments.id, 
                tbldocuments.typedoc, 
                tbldocuments.sender, 
                tbldocuments.doc, 
                tbldocuments.status,
                tbldocuments.datesend, 
                tbldocuments.confirmdate, 
                tbldocuments.linkkse, 
                tbldocuments.f_sign_doc,
                tbldocuments.kvartal, 
                tbldocuments.ref,
                (tbldocuments.first_sign IS NOT NULL ) as first_sign,
                (tbldocuments.second_sign IS NOT NULL ) as second_sign,
                (SELECT name FROM tblcompany WHERE kod = tbldocuments.sender) AS name,
                (users.user_inn is not null) AS is_first_signer,
                (SELECT COUNT(*) != 0  from tblcompany WHERE users.user_inn = ANY(second_signers)) AS is_second_signer,
                (tblcompany.first_signers is not null) as is_1sign_available,
                (tblcompany.second_signers is not null) as is_2sign_available
                FROM tbldocuments, users, tblcompany
                WHERE users.idcompany = tblcompany.id AND (tbldocuments.sender = tblcompany.kod OR
                tbldocuments.reciver = tblcompany.kod OR (tblcompany.kod = 'fin' AND tbldocuments.status = 3))
                AND users.id = $1  AND tbldocuments.docslayoutid!=28
                ORDER BY datesend DESC,createdate DESC
				${queryString}
                `,
				[id] // RPORMTR
			);
			const {rows} = await connection.query(`select count(*) from tbldocuments, users, tblcompany where users.idcompany = tblcompany.id AND (tbldocuments.sender = tblcompany.kod OR
                tbldocuments.reciver = tblcompany.kod OR (tblcompany.kod = 'fin' AND tbldocuments.status = 3))
                AND users.id = $1  AND tbldocuments.docslayoutid!=28`, [id]) // выявление общего кол-в
			return {
				list: list.rows,
				count: rows[0].count,
				page
			}

			return rows;
		} catch (err) {
		} finally {
			connection.release();
		}
	}
	//'tbldocuments.reciver = tblcompany.kod or tblcompany.kod = "finnadsor.kod"
	async getReportById(id) {
		const connection = await this.db.connect();
		try {
			const { rows } = await connection.query(
				"select * from tbldocuments where id = $1",
				[id]
			);
			if (rows.length === 0) {
				return { isFound: false };
			}
			return rows[0];
		} catch (err) {
		} finally {
			connection.release();
		}
	}

	async statusReport(id, type) {
		/// Изменение статуса репорта на отправлен
		const connection = await this.db.connect();
		try {
			let data = new Date();
			let reciver = "";
			if (type == "fin") reciver = "fin";
			else reciver = "KSE00000";
			const { rows } = await connection.query(
				"update tbldocuments set status = 2, reciver = $3, datesend = $2 where id = $1",
				[id, data, reciver]
			);
			return rows;
		} catch (err) {
		} finally {
			connection.release();
		}
	}

	async backReport(id) {
		/// Отмена отправки
		const connection = await this.db.connect();
		try {
			const { rows } = await connection.query(
				`
            update tbldocuments 
            set 
            status = 1, 
            reciver = null, 
            datesend = null,
            first_sign=null, 
            second_sign=null 
            where id = $1
            `,
				[id]
			);
			return rows;
		} catch (err) {
		} finally {
			connection.release();
		}
	}

	async updateReport(id, doc, status, kvartal, typedoc) {
		const connection = await this.db.connect();
		try {
			let data = new Date();
			const { rows } = await connection.query(
				"update tbldocuments set typedoc = $6, doc = $1, status = $4, updatedate = $2, kvartal = $5 where id = $3",
				[doc, data, id, status, kvartal, typedoc]
			);
			return rows;
		} catch (err) {
		} finally {
			connection.release();
		}
	}

	///////////////////////////////////FROM ADMIN////////////////////////////////

	// async confirmReport(id, interrefer) {
	//     const connection = await this.db.connect()
	//     try {
	//         let data = new Date()
	//         const { rows } = await connection.query("update tbldocuments set refer = 'KSE00000', interrefer = $1, status = 3, confirmdate = $2 where id = $3", [interrefer, data, id])
	//         return rows
	//     } catch (err) {} finally { connection.release() }
	// }
	async confirmReport(id, interrefer, ref) {
		const connection = await this.db.connect();
		try {
			let data = new Date();
			const { rows } = await connection.query(
				"update tbldocuments set refer = 'KSE00000', interrefer = $1, status = 3, confirmdate = $2 ,ref = $3 where id = $4",
				[interrefer, data, ref, id]
			);
			return rows;
		} catch (err) {
		} finally {
			connection.release();
		}
	}
	// Удаление квитанции при ошибке подписи эцп
	async deleteConfirmReport(id_doc, id_receipt, sender, kvartal) {
		const connection = await this.db.connect();
		try {
			const { rows } = await connection.query(
				`BEGIN;
                    UPDATE tbldocuments set 
                    status = 2, 
                    refer = null, 
                    interrefer = '${sender}', 
                    kvartal = '${kvartal}', 
                    ref = null,
                    confirmdate = null
                    where id = ${id_doc};
                    DELETE FROM tbldocuments WHERE id = ${id_receipt};
                COMMIT;
                `
			);
			return rows;
		} catch (err) {
			return err;
		} finally {
			connection.release();
		}
	}
	async rejectReport(id) {
		/// Отклонение отчета
		const connection = await this.db.connect();
		try {
			const { rows } = await connection.query(
				`
            update tbldocuments 
            set
            reciver = null,
            refer = null,
            interrefer = null,
            status = 4,
            datesend = null,
            updatedate = null,
            confirmdate = null,
            linkkse = null,
            ref = null,
            first_sign = null,
            f_sign_doc = null
            where id = $1
            `,
				[id]
			);
			return rows;
		} catch (err) {
			return err;
		} finally {
			connection.release();
		}
	}

	async linkToKSE(id, link) {
		/// Добавление id факта из KSE.kg
		const connection = await this.db.connect();
		try {
			const { rows } = await connection.query(
				"update tbldocuments set linkkse = $1 where id = $2",
				[link, id]
			);
			return rows;
		} catch (err) {
		} finally {
			connection.release();
		}
	}

	async deleteReport(id) {
		/// Удаление отчета
		const connection = await this.db.connect();
		try {
			const { rows } = await connection.query(
				`BEGIN;
                    INSERT INTO deletedtbldocuments (SELECT * FROM tbldocuments WHERE id=${id});
                    DELETE FROM tbldocuments WHERE id=${id};
                COMMIT;
                `
			);
			console.log('service ', id)
			return rows;
		} catch (err) {
		} finally {
			connection.release();
		}

		// const connection = await this.db.connect()
		// try {
		//     const { rows } = await connection.query('INSERT INTO deletedtbldocuments ' +
		//     'SELECT id,typedoc, sender, reciver, refer, interrefer, doc, status, createdate, datesend, updatedate, confirmdate, linkkse, kvartal' +
		//     'FROM tbldocuments WHERE id =  $1', [id])
		//     return rows
		// } catch (err) {} finally { connection.release() }
	}

	async recoverDoc(id) {
		/// Восстановление отчета
		const connection = await this.db.connect();
		try {
			const { rows } = await connection.query(
				"BEGIN;INSERT INTO tbldocuments (SELECT * FROM deletedtbldocuments  WHERE id=" +
					id +
					");" +
					"DELETE FROM deletedtbldocuments WHERE id=" +
					id +
					";COMMIT;"
			);
			return rows;
		} catch (err) {
		} finally {
			connection.release();
		}
	}

	async deletingForever(id) {
		//Окончательное удаление
		const connection = await this.db.connect();
		try {
			const { rows } = await connection.query(
				"Delete FROM deletedtbldocuments WHERE id=$1",
				[id]
			);
			return rows;
		} catch (err) {
		} finally {
			connection.release();
		}
	}

	async selectDeletedDocs() {
		//Вывод в Корзину
		const connection = await this.db.connect();
		try {
			const { rows } = await connection.query(
				"select *,(select name from tblcompany where kod = deletedtbldocuments.sender)  from deletedtbldocuments order by createdate desc"
			);
			return rows;
		} catch (err) {
		} finally {
			connection.release();
		}
	}
	async deleteHandler(id) {
		const connection = await this.db.connect();
		try {
			const { rows } = await connection.query(
				"Delete FROM tbldocuments WHERE id=$1",
				[id]
			);
			return rows;
		} catch (err) {
		} finally {
			connection.release();
		}
	}

	async searchHandler(search, page, limit) {
		const connection = await this.db.connect()
		try {
			let queryString = `limit ${limit} offset ${page ? limit*page-limit : 0}`;
			console.log('try', search)
			const  list  = await connection.query(
				`select
				tbldocuments.id, 
								tbldocuments.typedoc, 
								tbldocuments.sender, 
								tbldocuments.reciver,
								tbldocuments.doc, 
								tbldocuments.status,
								tbldocuments.datesend, 
								tbldocuments.confirmdate, 
								tbldocuments.linkkse, 
								tbldocuments.f_sign_doc,
								tbldocuments.kvartal, 
								tbldocuments.ref,
								(tbldocuments.first_sign IS NOT NULL ) as first_sign,
								(tbldocuments.second_sign IS NOT NULL ) as second_sign,
								(SELECT name FROM tblcompany WHERE kod = tbldocuments.sender) AS name,
								(tblcompany.first_signers is not null) as is_1sign_available,
								(tblcompany.second_signers is not null) as is_2sign_available
								FROM tbldocuments, tblcompany
								WHERE LOWER(tblcompany.name) LIKE '%${search}%' 
								and (tbldocuments.sender = tblcompany.kod and
								tbldocuments.reciver = 'KSE00000')
								AND tbldocuments.docslayoutid!=28
								ORDER BY datesend DESC,createdate DESC
								${queryString}
                `
			);
			const {rows} = await connection.query(`select count(*) from tbldocuments, tblcompany where LOWER(tblcompany.name) LIKE '%${search}%' 
				and (tbldocuments.sender = tblcompany.kod and
				tbldocuments.reciver = 'KSE00000')
				AND tbldocuments.docslayoutid!=28`) // выявление общего кол-в
			return {
				list: list.rows,
				count: rows[0].count,
				page
			}
		} catch (err) {
			console.log('eror', search)
		} finally {
			connection.release();
		}
	}
}

module.exports = ReportsService;
