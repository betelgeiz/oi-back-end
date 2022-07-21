'use strict'

class ManageAccountServices {
  constructor(db) {
    this.db = db
  }
  async getUserList(){
    const connection = await this.db.connect()
    try {
      const {rows} = await connection.query(`
      SELECT U.LOGIN, U.ID, C.NAME FROM USERS U INNER JOIN TBLCOMPANY C ON U.IDCOMPANY = C.ID`)
      return rows
    } catch (error) {
      return error
    }
     finally {
       connection.release()
     }
  }
  async resetUserPassword(user_id){
    const connection = await this.db.connect()
    try {
      const {rows} = await connection.query(`
        UPDATE USERS SET PASSWORD = 123 WHERE ID = $1 RETURNING PASSWORD
      `,[user_id])
      return rows
    } catch (error) {
      return error
    }
    finally { connection.release()}
  }
}

module.exports = ManageAccountServices