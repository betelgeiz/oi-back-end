'use strict'

class UserService {

    constructor(db) {
        this.db = db
    }

    async auth(login, password) {

        const connection = await this.db.connect()
        try {
            const { rows } = await connection.query(
                "SELECT id, login, idcompany, typeuser, fullname FROM users WHERE login = $1 AND password = $2", [login, password]
            )
            return rows[0]
        } catch (err) {} finally { connection.release() }

    }

    async getUser(id) {
        const connection = await this.db.connect()
        try {
            const { rows } = await connection.query(
                "SELECT login, fullname FROM users where id = $1", [id]
            )
            return rows[0]
        } catch (err) {} finally { connection.release() }
    }

    async update(login, fullname, id) { /// Изменение данных компании
        const connection = await this.db.connect()
        console.log("body =", login, fullname, id)
        try {
            const { rows } = await connection.query("update users set login = $1, fullname = $2 where id = $3", [login, fullname, id])
            return rows
        } catch (err) {} finally { connection.release() }
    }

}

module.exports = UserService
