'use strict'

class ReportsService {

    constructor(db) {
        this.db = db
    }

    async addReport(typedoc, xmldoc, sender, status, kvartal) {
        const connection = await this.db.connect()
        try {
            let data = new Date()
            let month = data.getMonth()
            let kv = ''
            switch (month) {
                case 1:
                case 2:
                case 3:
                    kv = '2020; 1 квартал'
                    break
                case 4:
                case 5:
                case 6:
                    kv = '2020; 2 квартал'
                    break
                case 7:
                case 8:
                case 9:
                    kv = '2020; 3 квартал'
                    break
                case 10:
                case 11:
                case 12:
                    kv = '2020; 4 квартал'
                    break

            }
            if (kvartal == '; ')
                kvartal = kv
            const { rows } = await connection.query(
                'INSERT INTO tbldocuments (typedoc, doc, sender, status, createdate, kvartal) VALUES ($1, $2, $3, $4, $5, $6)', [typedoc, xmldoc, sender, status, data, kvartal]
            )

            return rows[0]

        } catch (err) {
            
        } finally { connection.release() }


    }

    async getCompanyById(id) {

        const connection = await this.db.connect()
        try {
            const { rows } = await connection.query('SELECT name, kod, opforma, activity, address FROM tblcompany where id = $1', [id])
            return rows[0]
        } catch (err) {} finally { connection.release() }

    }

    async getReports(id, type) {

        const connection = await this.db.connect()
        try {
            const { rows } = await connection.query('select tbldocuments.id, tbldocuments.typedoc, tbldocuments.sender, tbldocuments.reciver, ' +
                'tbldocuments.refer, tbldocuments.interrefer, tbldocuments.doc, tbldocuments.status, ' +
                'tbldocuments.createdate, tbldocuments.datesend, tbldocuments.updatedate, tbldocuments.confirmdate, tbldocuments.linkkse, ' +
                '(select name from tblcompany where kod = tbldocuments.sender) as name, tbldocuments.kvartal from tbldocuments, users, tblcompany ' +
                'where users.idcompany = tblcompany.id and (tbldocuments.sender = tblcompany.kod or ' +
                'tbldocuments.reciver = tblcompany.kod or (tblcompany.kod = \'fin\' and tbldocuments.status = 3)) and users.id = $1 and typedoc like $2 order by kvartal desc, datesend asc', [id, type + '%'])
            return rows
        } catch (err) {} finally { connection.release() }
    }
    //'tbldocuments.reciver = tblcompany.kod or tblcompany.kod = "finnadsor.kod" 
    async getReportById(id) {
        const connection = await this.db.connect()
        try {
            const { rows } = await connection.query('select * from tbldocuments where id = $1', [id])
            return rows[0]
        } catch (err) {} finally { connection.release() }
    }

    async statusReport(id, type) { /// Изменение статуса репорта на отправлен
        const connection = await this.db.connect()
        try {
            let data = new Date()
            let reciver = ''
            if (type == 'fin') reciver = 'fin'
            else reciver = 'KSE00000'
            const { rows } = await connection.query("update tbldocuments set status = 2, reciver = $3, datesend = $2 where id = $1", [id, data, reciver])
            return rows
        } catch (err) {} finally { connection.release() }
    }

    async backReport(id) { /// Отмена отправки
        const connection = await this.db.connect()
        try {
            const { rows } = await connection.query("update tbldocuments set status = 1, reciver = null, datesend = null where id = $1", [id])
            return rows
        } catch (err) {} finally { connection.release() }
    }

    async updateReport(id, doc, status) {
        const connection = await this.db.connect()
        try {
            let data = new Date()
            const { rows } = await connection.query("update tbldocuments set doc = $1, status = $4, updatedate = $2 where id = $3", [doc, data, id, status])
            return rows
        } catch (err) {} finally { connection.release() }
    }

    ///////////////////////////////////FROM ADMIN////////////////////////////////

    async confirmReport(id, interrefer) {
        const connection = await this.db.connect()
        try {
            let data = new Date()
            const { rows } = await connection.query("update tbldocuments set refer = 'KSE00000', interrefer = $1, status = 3, confirmdate = $2 where id = $3", [interrefer, data, id])
            return rows
        } catch (err) {} finally { connection.release() }
    }

    async rejectReport(id) { /// Отклонение отчета
        const connection = await this.db.connect()
        try {
            const { rows } = await connection.query("update tbldocuments set status = 4, reciver = null, datesend = null where id = $1", [id])
            return rows
        } catch (err) {} finally { connection.release() }
    }

    async linkToKSE(id, link) { /// Добавление id факта из KSE.kg
        const connection = await this.db.connect()
        try {
            const { rows } = await connection.query("update tbldocuments set linkkse = $1 where id = $2", [link, id])
            return rows
        } catch (err) {} finally { connection.release() }
    }

    async deleteReport(id) { /// Удаление отчета
        const connection = await this.db.connect()
        try {
            const { rows } = await connection.query("delete from tbldocuments where id = $1", [id])
            return rows
        } catch (err) {} finally { connection.release() }
    }

}

module.exports = ReportsService