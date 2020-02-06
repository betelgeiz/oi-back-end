'use strict'

class UserService {
  
  constructor (db) {
    this.db = db
  }

  async register (login, password) {
    
    const connection = await this.db.getConnection()
    const [rows, fields] = await connection.query(
      'SELECT id, login FROM users WHERE login ="' + login + '" AND password = "' + password + '"'
    )
    connection.release()
    console.log(Object.keys(rows[0]))

    return rows[0]

  }

  async getUser(id) {

    const connection = await this.db.getConnection()
    const [rows, fields] = await connection.query(
      'SELECT * FROM users where id=?', id
    )
    connection.release()
    console.log(Object.keys(rows[0]))

    return rows[0]
  }

  async addUser(first_name, last_name) {
    const connection = await this.db.getConnection()
    await connection.query(
      'INSERT INTO users (first_name, last_name) VALUES ("' + first_name + '" , "' + last_name +'")',
    )
    connection.release()
    return first_name + ' ' + last_name
  }

}

module.exports = UserService