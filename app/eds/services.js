"use strict";
const axios = require("axios");
class EDSService {
  constructor(db) {
    this.db = db;
  }

  async getUserInn(id) {
    const connection = await this.db.connect();
    try {
      const {
        rows,
      } = await connection.query(
        `SELECT 
        LPAD(u.user_inn::text, 14, '0') as user_inn, 
        u.user_form, 
        first_signers from users u inner join tblcompany c on u.idcompany = c.id where u.id = $1`,
        [id]
      );
      return rows[0];
    } catch (err) {
    } finally {
      connection.release();
    }
  }

  async getUserInfoWithINN(inn) {
    const connection = await this.db.connect();
    try {
      const {rows} = await connection.query(`
      select LPAD(u.user_inn::text, 14, '0') as user_inn, u.user_form,
      (select first_signers from tblcompany where id = u.idcompany) as f_s,
      u.id, u.login, u.idcompany, u.typeuser, u.fullname, u.use
      from users as u, tblcompany where u.user_inn = $1 and tblcompany.id = u.idcompany
      `, [inn]);
      return rows[0]
    }
    catch (err) {}
    finally {
      connection.release();
    }
  }

  async getUserAuthMethod(inn,form, f_signer) {
    try {
      let token = "m%3&?R%&QcPWSjF$M3m7pPg8h=FsC6JG";
      let postData = {};
      if (form === 1) {
        postData = {
          personIdnp: inn,

        };
      } else {
        postData = {
          personIdnp: inn,
          organizationInn: f_signer,
        };
      }
      let res = await axios.post(
        "https://cdsapi.srs.kg/api/user-auth-methods",
        JSON.stringify(postData),
        {
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return res.data;
    } catch (error) {
      const { response } = error;
      const { request, ...errorObject } = response;
      return errorObject.data;
    }
  }

  async getUserPinMethod(inn, form,f_signer, authType) {
    try {
      let token = "m%3&?R%&QcPWSjF$M3m7pPg8h=FsC6JG";
      let postData = {};
      if (form === 1) {
        postData = {
          personIdnp: inn,
          method: authType,
        };
      } else {
        postData = {
          personIdnp: inn,
          organizationInn: f_signer,
          method: authType,
        };
      }
      let res = await axios.post(
        "https://cdsapi.srs.kg/api/get-pin-code",
        JSON.stringify(postData),
        {
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return res.data;
    } catch (error) {
      const { response } = error;
      const { request, ...errorObject } = response;
      return errorObject.data;
    }
  }
  async getUserToken(inn, form,f_signer, pin) {
    try {
      let token = "m%3&?R%&QcPWSjF$M3m7pPg8h=FsC6JG";
      let postData = {};
      if (form === 1) {
        postData = {
          personIdnp: inn,
          byPin: pin,
        };
      } else {
        postData = {
          personIdnp: inn,
          organizationInn: f_signer,
          byPin: pin,
        };
      }
      let res = await axios.post(
        "https://cdsapi.srs.kg/api/account/auth",
        JSON.stringify(postData),
        {
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return res.data;
    } catch (error) {
      const { response } = error;
      const { request, ...errorObject } = response;
      return errorObject.data;
    }
  }

  async getSignReport(userToken, hash) {
    try {
      let token = "m%3&?R%&QcPWSjF$M3m7pPg8h=FsC6JG";
      let postData = {
        hash: hash,
        userToken: userToken,
      };
      let res = await axios.post(
        "https://cdsapi.srs.kg/api/get-sign/for-hash",
        JSON.stringify(postData),
        {
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return res.data;
    } catch (error) {
      const { response } = error;
      const { request, ...errorObject } = response;
      return errorObject.data;
    }
  }
  async updateFirstSignReport(id, sign, token) {
    const connection = await this.db.connect();
    try {
   
      await connection.query(
        "update tbldocuments set first_sign = $1, f_sign_doc = $3, status = 5 , datesend = null where id = $2",
        [sign, id, token]
      );
      return true;
    } catch (err) { return err
    } finally {
      connection.release();
    }
  }
  async updateSecondSignReport(id, sign) {
    const connection = await this.db.connect();
    try {
   
      await connection.query(
        "update tbldocuments set second_sign = $1, status = 6 , datesend = null where id = $2",
        [sign, id]
      );
      return true;
    } catch (err) { return err
    } finally {
      connection.release();
    }
  }

  async checkSignReport(postData){
      try{
        let token='m%3&?R%&QcPWSjF$M3m7pPg8h=FsC6JG'
  
        const res = await axios.post('https://cdsapi.srs.kg/api/check-sign/for-hash',postData,{
        headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Authorization': `Bearer ${token}` 
        }})
    
        return res.data
      
      }
      catch(error){
        const { response } = error;
        const { request, ...errorObject } = response;
        return errorObject.data;
      }
    }
}

module.exports = EDSService;
