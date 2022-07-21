'use strict'

class AdminService {

  constructor(db) {
    this.db = db
  }

  async getAllReports() {
    
    const connection = await this.db.connect()
    try {
      const {rows} = await connection.query('select id, numdoc, datedoc, sender, refer, typedoc from tbldocuments')
      return rows
    } catch (err) { }
    finally { connection.release() }

  }

  async confirmReport(id, interrefer) {
    const connection = await this.db.connect()
    try {
      const {rows} = await connection.query("update tbldocuments set refer = 'KSE00000', interrefer = $1 where id = $2", [interrefer, id])
      return rows
    } catch (err) { }
    finally { connection.release() }
  }

}

module.exports = AdminService