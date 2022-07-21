"use strict";

class CompanyService {
  constructor(db) {
    this.db = db;
  }
  async getCompanyById(id) {
    const connection = await this.db.connect();
    try {
      const {
        rows,
      } = await connection.query("SELECT * FROM tblcompany where id = $1", [
        id,
      ]);
      return rows[0];
    } catch (err) {
    } finally {
      connection.release();
    }
  }
  async updateCompanyInfo(
    name,
    opforma,
    activity,
    address,
    phone,
    fax,
    email,
    supervisor,
    id,
    first_signers
  ) {
    /// Изменение данных компании
    const connection = await this.db.connect();
    try {
      const {
        rows,
      } = await connection.query(
        `update tblcompany set name = $1, opforma = $2, activity = $3, address = $4, phone = $5, fax = $6, email = $7, sepervisor = $8, first_signers = '{${first_signers}}'  where id = $9`,
        [name, opforma, activity, address, phone, fax, email, supervisor, id]
      );
      return rows;
    } catch (err) {
    } finally {
      connection.release();
    }
  }
  async addCompany(name, kod) {
    const connection = await this.db.connect();
    try {
      let type = 2;
      const {
        rows,
      } = await connection.query(
        "insert into tblcompany (name, kod, type) values ($1, $2, $3) RETURNING id",
        [name, kod, type]
      );
      return rows[0];
    } catch (err) {
    } finally {
      connection.release();
    }
  }
  async addUser(login, idcompany) {
    const connection = await this.db.connect();
    try {
      let typeuser = 2;
      let password = "123";
      const {
        rows,
      } = await connection.query(
        "insert into users (login, password, idcompany, typeuser) values ($1, $2, $3, $4)",
        [login, password, idcompany, typeuser]
      );
      return rows;
    } catch (err) {
    } finally {
      connection.release();
    }
  }
  // public services
  async getComponyList({limit, page}) {
    const connection = await this.db.connect();
    try {
      let queryString = `limit ${limit} offset ${page ? limit*page-limit : 0}`;
      const list = await connection.query(`
        SELECT id, name, kod, symbol
        FROM   tblcompany
        order by id asc
        ${queryString}
      `)
      const {rows} = await connection.query('select count(*) from tblcompany')
      return {
        list: list.rows,
        count: rows[0].count,
        page
      }
    } catch (error) {
      return rows
    } finally {
      connection.release();
    }
  }
  async getComponyById(kod) {
    const connection = await this.db.connect();
    try {
      console.log(kod, '----')
      const {rows} = await connection.query(`select * from tblcompany where kod = '${kod}'`)
      return rows[0]
    } catch (error) {
      return error
    } finally {
      connection.release();
    }
  }

  async getCompanyReports({kod, type}){
    const connection = await this.db.connect();
    try {
      const queryString = `${type == 1? 'Квартальный':'Существенный'}`
      const {rows} = await connection.query(`
        select 
        id, 
        typedoc,
        confirmdate
        from tbldocuments 
        where sender = '${kod}'
        and typedoc LIKE '${queryString}%'
      `)
      return rows
    } catch (error) {
      return error
    } finally {
      connection.release();
    }
  }
  async getReportsDiagramKvartal ({sender}) {
    const connection = await this.db.connect();
    try {
      const queryString = `select doc from tbldocuments where sender = '${sender}' AND typedoc like 'Квартальный отчет%' order by kvartal asc`;
      const {rows} = await connection.query(queryString)
      let options = {
        chart: {
          type: 'area',
          stacked: false,
        },
        series: [],
        xaxis: {
          categories: []
        }
      }
      rows.map(({doc}) => {
        doc.fields.map(el => {
          let fieldsIds = [
            'fin_statements_1_tbl', 
            'fin_statements_2_tbl',
            'fin_statements_3_tbl'
          ]
          let fieldIndex = fieldsIds.indexOf(el.id)
          let cells = el.rows && el.rows[el.rows.length-1].cells
          if(el.id == 'select_quarter'){
            options.xaxis.categories.push(el.value)
          }
          else if (el.id == fieldsIds[fieldIndex]){
            if(options.series.length < fieldsIds.length && el.id == fieldsIds[fieldIndex]){
              options.series.push({name: cells[1].name, data: []})
            }
            let v = cells.pop().value.split(' ').join('')
            options.series[fieldIndex].data.push(v == ""?null:v)
          }
          
        })
      })
      return options
    } catch (error) {
      return error
    } finally {
      connection.release();
    }
  }

  async getReportsDiagramFinState ({sender}) {
    const connection = await this.db.connect();
    try {
      const queryString = `select doc from tbldocuments where sender = '${sender}' AND typedoc like 'Квартальный отчет%' order by kvartal asc`;
      const {rows} = await connection.query(queryString)
      let options = {
        chart: {
          type: 'area',
          stacked: false,
        },
        series: [],
        xaxis: {
          categories: []
        }
      }
      rows.map(({doc}) => {
        doc.fields.map(el => {
          let fieldsIds = ['fin_statements_2_tbl']
          let fieldIndex = fieldsIds.indexOf(el.id)
          let cellIds = ['gross_end', 'pure_end']

          if(el.id == 'select_quarter'){
            options.xaxis.categories.push(el.value)
          }
          else if (el.id == fieldsIds[fieldIndex]){
            for(let i = 0; i < el.rows.length; i++){
              for(let k = 0; k < el.rows[i].cells.length; k++){
                let cellIndex = cellIds.indexOf(el.rows[i].cells[k].id)
                if(el.rows[i].cells[k].id == cellIds[cellIndex]){
                  if(options.series.length < cellIds.length){
                    options.series.push({name: el.rows[i].cells[1].name, data: []})
                  }
                  let v = el.rows[i].cells[k].value.split(' ').join('')
                  options.series[cellIndex].data.push(v == ""?null:v)
                }
              }
            }
          }          
        })
      })
      return options
    } catch (error) {
      return error
    } finally {
      connection.release();
    }
  }

  async getCompanyListBySearch(search, page, limit) {
    const connection = await this.db.connect();
    try {
      let queryString = `limit ${limit} offset ${page ? limit*page-limit : 0}`;
      const list = await connection.query(`
        SELECT id, name, kod, symbol
        FROM   tblcompany
        where lower(name) like '%${search}%'
        ${queryString}
      `)
      const {rows} = await connection.query(`select count(*) from tblcompany where lower(name) like '%${search}%'`)
      return {
        list: list.rows,
        count: rows[0].count,
        page
      }
    } catch (error) {
      return rows
    } finally {
      connection.release();
    }
  }
  
}

module.exports = CompanyService;
