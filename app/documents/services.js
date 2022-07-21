'use strict'

class DocumentsService {

    constructor(db) {
        this.db = db
    }

    async getDocsList() {

        const connection = await this.db.connect()
        try {
            const { rows } = await connection.query(
                "SELECT * FROM docslayout WHERE id != 28 ORDER BY id ASC"
            )
            return rows
        } catch (err) {} finally { connection.release() }

    }

    async getDoc(name) {
        const connection = await this.db.connect()
        try {
            const { rows } = await connection.query(
                "SELECT * FROM docsLayout where name = $1", [name]
            )
            return rows[0]

        } catch (err) {} finally { connection.release() }
    }



}

module.exports = DocumentsService