'use strict'
const axios = require('axios')
const bcript = require('bcrypt')
class UserService {

    constructor(db) {
        this.db = db
    }

    async auth(login, password) {
        //console.log(login, password)

        const connection = await this.db.connect()        
        try {
            // const hashPassword =  await bcript.hash(password, 10);
            // //await bcript.hash(password, 5);
            // console.log('pass = ', hashPassword)
            //console.log('login = ', login)
            let status = false // предварительно статус авторизации не пройден
            const { rows } = await connection.query(
                "SELECT id, login, idcompany, typeuser, fullname, use, hash_pass FROM users WHERE login = $1", [login] // поиск пользователя с указанным логином
            )
            if (rows.length == 0) {
                throw 'Пользователь не найден'
            }
            let authStatus = await bcript.compare( // если пользователь найден, сверка пароля с хэшем
                password,
                rows[0].hash_pass
            )
            if(!authStatus)
                throw 'Неверный пароль'
            status = true // если все норм, меняем статус на пройден
            // bcript.compare(password, rows[0].hash_pass, function(err, result) {
            //     console.log(result)
            // });
            //this.genHash()
            //console.log(rows);
            delete rows[0].hash_pass // убираем хэш пароля из объекта базы
            return {rows: rows[0], status} // возвращаем данные для генерации токена и статус авторизации в index.js
        } catch (err) {
            return err
        } finally { 
            connection.release() 
        }

    }
    async genHash() {
        const connection = await this.db.connect()        
        try {
            // const hashPassword =  await bcript.hash(password, 10);
            // //await bcript.hash(password, 5);
            // console.log('pass = ', hashPassword)
            const { rows } = await connection.query(
                "SELECT id, password FROM users"
            )
            for (let i = 0; i <= rows.length; i++) {
                let hash = await bcript.hash(rows[i].password, 10)
                await connection.query(
                    'update users set hash_pass = $1 where id = $2', [hash, rows[i].id]
                )
            }
            // let authStatus = Boolean;
            // authStatus = await bcript.compare(
            //     password,
            //     rows[0].password
            // )
            // console.log(authStatus);
            //console.log(rows);
            //return rows[0]
        } catch (err) {
            return err
        } finally { 
            connection.release() 
        }
    }
    async getUser(id) {
        const connection = await this.db.connect()
        try {
            const { rows } = await connection.query(
                "SELECT login, fullname, use FROM users where id = $1", [id]
            )
            return rows[0]
        } catch (err) {} finally { connection.release() }
    }
    async getUserInn(id) {
        const connection = await this.db.connect()
        try {
            const { rows } = await connection.query(
                "SELECT user_inn, user_form FROM users where id = $1", [id]
            )
            return rows[0]
         
        } catch (err) {} finally { connection.release() }
    }
    async updateUserInnAndForm(inn,form, user_id){
        const connection = await this.db.connect()
        try {
            const {rows} = await connection.query(`
            UPDATE USERS SET USER_INN = $1, USER_FORM = $2 WHERE ID = $3
            `, [inn, form, user_id])
            return rows

        } catch (error) {
            
        }
        finally { connection.release()}
    }
    async getUserInnAndForm(user_id) {
        const connection = await this.db.connect()
        try {
            const {rows} = await connection.query(`
                SELECT LPAD(user_inn::text, 14, '0') as USER_INN, USER_FORM FROM USERS WHERE ID = $1
            `, [user_id])
            return rows[0]

        } catch (error) {
            
        }
        finally { connection.release()}
    }
    async getUserAuthMethod(inn,form) {

        let token='m%3&?R%&QcPWSjF$M3m7pPg8h=FsC6JG'
        let postData={}
        if(form===1){
            postData = {
            personIdnp:inn
            };
        }
        else{
            postData = {
            organizationInn:inn
            };
        }
        const res = await axios.post('https://cdsapi.srs.kg/api/user-auth-methods',JSON.stringify(postData),{
        headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Authorization': `Bearer ${token}` 
        }})
        if(res.status===200){
            return res.data.userAuthMethodList[0].authType
        }
        else{
           return res.data.errorMessage
        }
    
    }
    
    async getUserPin(inn,form,authType){
        let token='m%3&?R%&QcPWSjF$M3m7pPg8h=FsC6JG'
        let postData={}
        if(form===1){
            postData = {
            personIdnp:inn,
            method:authType
            };
        }
        else{
            postData = {
            organizationInn:inn,
            method:authType
            };
        }
        const res = await axios.post('https://cdsapi.srs.kg/api/get-pin-code',JSON.stringify(postData),{
        headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Authorization': `Bearer ${token}` 
        }})
        if(res.status===200){
            return "Пин отправлен по-" + authType
        }
        else{
             return res.data.errorMessage
        }
    }
    async getUserToken(inn,form,pin){
        let token='m%3&?R%&QcPWSjF$M3m7pPg8h=FsC6JG'
        let postData={}
        if(form===1){
            postData = {
            personIdnp:inn,
            byPin:pin
            };
        }
        else{
            postData = {
            organizationInn:inn,
            byPin:pin
            };
        }
        const res = await axios.post('https://cdsapi.srs.kg/api/account/auth',JSON.stringify(postData),{
        headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Authorization': `Bearer ${token}` 
        }})
        if(res.status===200){
            return res.data
        }
        else{
             return res.data.errorMessage
        }

    }

    async update(login, fullname, id) { /// Изменение данных компании
        const connection = await this.db.connect()
        try {
            const { rows } = await connection.query("update users set login = $1, fullname = $2 where id = $3", [login, fullname, id])
            return rows
        } catch (err) {} finally { connection.release() }
    }

    async updatePassword(id, pass) {
        const connection = await this.db.connect()
        
        try {
            let hash = await bcript.hash(pass, 10)
            const { rows } = await connection.query("update users set password = $1, hash_pass = $2 where id = $3", [pass, hash, id])
            return rows
        } catch (err) {console.log(err)} finally { connection.release() }
    }

    async acceptToUse(id) {
        const connection = await this.db.connect()
        
        try {
            const { rows } = await connection.query("update users set use = 1 where id = $1", [id])
            return rows
        } catch (err) {console.log(err)} finally { connection.release() }
    }

}

module.exports = UserService