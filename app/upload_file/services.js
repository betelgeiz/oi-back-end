'use strict'
var fs = require('fs');
class UploadFileService {
  constructor(db) {
    this.db = db
  }
  async uploadFileReport({body, files}){
    const connection = await this.db.connect()
    try {
      let doc = {}
      const {typedoc, kvartal, year, sender, report} = body
      for(let key in files){
        doc[key] = {
          title: body[key],
          file: `${files[key][0].destination}/${files[key][0].filename}`,
          name: files[key][0].filename
        }
      }
      let reports = {}
      reports.docs = JSON.stringify(doc)
      reports.rep = report
      const status = 1
      const docslayoutid = 31
      const kvar = `${year}; ${kvartal}`
      const date = new Date()
      const { rows } = await connection.query(
        `INSERT INTO tbldocuments 
        (typedoc, docslayoutid, sender, status, createdate, doc, kvartal) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) returning id`, 
        [typedoc, docslayoutid, sender, status, date, JSON.stringify(reports), kvar]
    )
    return rows
    } catch (error) {
      return error
    }
     finally {
       connection.release()
     }
  }

  async deleteFileReport({filename, reportid}){
    const connection = await this.db.connect()
    try {
      let filepath = `static/${filename}`
      await connection.query(`
        delete from tbldocuments where id = $1
      `, [reportid])
      if (fs.existsSync(filepath)) {
        fs.unlink(filepath, function (err) {
          if (err) throw err;
        });
      }
      return {message:`${filename} removed!`}
    } catch (error) {
      return error
    } finally {
      connection.release()
    }
  }
}

module.exports = UploadFileService