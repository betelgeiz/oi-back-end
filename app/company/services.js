'use strict'

class CompanyService {

    constructor(db) {
        this.db = db
    }


    async getCompanyById(id) {

        const connection = await this.db.connect()
        try {
            const { rows } = await connection.query('SELECT * FROM tblcompany where id = $1', [id])
            return rows[0]
        } catch (err) {} finally { connection.release() }

    }

    async updateCompanyInfo(name, opforma, activity, address, phone, fax, email, supervisor, id) { /// Изменение данных компании
        const connection = await this.db.connect()
        try {
            const { rows } = await connection.query("update tblcompany set name = $1, opforma = $2, activity = $3, address = $4, phone = $5, fax = $6, email = $7, sepervisor = $8 where id = $9", [name, opforma, activity, address, phone, fax, email, supervisor, id])
            return rows
        } catch (err) {} finally { connection.release() }
    }

    async addCompany(name, kod) {
        const connection = await this.db.connect()
        try {
            let type = 2
            const { rows } = await connection.query("insert into tblcompany (name, kod, type) values ($1, $2, $3) RETURNING id", [name, kod, type])
            return rows[0]
        } catch (err) {} finally { connection.release() }
    }

    async addUser(login, idcompany) {
        const connection = await this.db.connect()
        try {
            let typeuser = 2
            let password = '123'
            const { rows } = await connection.query("insert into users (login, password, idcompany, typeuser) values ($1, $2, $3, $4)", [login, password, idcompany, typeuser])
            return rows
        } catch (err) {} finally { connection.release() }
    }

}

module.exports = CompanyService