"use strict";

module.exports = async function (fastify, opts) {
  // Пути по которым можно обращаться серверу
  fastify.post('/auth', authWithInn)
  fastify.post('/checkpin', checkPinHandler)
  fastify.register(async function (fastify) {
    fastify.addHook("preHandler", fastify.authPreHandler);
    fastify.get("/", getUserPinHandler);
    fastify.post("/:order", signDocHandler);
    fastify.post("/check-sign/:order", checkSignReportHandler);
    //fastify.post("/secondsign", secondSignDocHandler);
  })
};

// Fastify checks the existance of those decorations before registring `user.js`
module.exports[Symbol.for("plugin-meta")] = {
  decorators: {
    fastify: ["edsService"],
    fastify: ["reportsService"],
    fastify: ['jwt']
  },
};

// In all handlers `this` is the fastify instance
// The fastify instance used for the handler registration

async function authWithInn(req, reply) {
  let {user_inn, user_form, f_s } = await this.edsService.getUserInfoWithINN(req.body.inn);
  let f_signer = String(f_s[0]).padStart(14, '0')
  //console.log(data.user_inn)
  if (user_inn && user_form && f_signer) {
    let auth = await this.edsService.getUserAuthMethod(
      user_inn,
      user_form,
      f_signer
    );
    if ("userAuthMethodList" in auth) {
      let pin = await this.edsService.getUserPinMethod(
        user_inn,
        user_form,
        f_signer,
        auth.userAuthMethodList[0].authType
      );
      if (pin.status === 200) {
        reply.code(200).send({
          message:
            "Пин-код отправлен по " + auth.userAuthMethodList[0].authType,
        });
      } else {
        reply.code(500).send({ message: pin.errorMessage });
      }
    } else {
      reply.code(500).send({ message: auth.errorMessage });
    }
  } else {
    reply.code(500).send({ message: "Для данного пользователя ИНН не найден!" });
  }
}

async function getUserPinHandler(req, reply) {
  let {user_inn, user_form, first_signers } = await this.edsService.getUserInn(req.user.user.id);
  let f_signer = String(first_signers[0]).padStart(14, '0')

  if (user_inn && user_form && f_signer) {
    let auth = await this.edsService.getUserAuthMethod(
      user_inn,
      user_form,
      f_signer
    );
    if ("userAuthMethodList" in auth) {
      let pin = await this.edsService.getUserPinMethod(
        user_inn,
        user_form,
        f_signer,
        auth.userAuthMethodList[0].authType
      );
      if (pin.status === 200) {
        reply.code(200).send({
          message:
            "Пин-код отправлен по " + auth.userAuthMethodList[0].authType,
        });
      } else {
        reply.code(500).send({ message: pin.errorMessage });
      }
    } else {
      reply.code(500).send({ message: auth.errorMessage });
    }
  } else {
    reply.code(500).send({ message: "Для данного пользователя ИНН не найден!" });
  }
}

async function checkPinHandler(req, reply) {
  let {user_inn, user_form, f_s, id, login, idcompany, typeuser, fullname, use } = await this.edsService.getUserInfoWithINN(req.body.inn);
  let f_signer = String(f_s[0]).padStart(14, '0')
  let pin = req.body.pin;
  if (user_inn && user_form && pin) {
    let token = await this.edsService.getUserToken(
      user_inn,
      user_form,
      f_signer,
      pin
    );
    if (token.token) {
      //return token
      let role
        if (typeuser == 1) {
            role = 'admin'
        } else {
            role = 'user'
        }
      return {
        jwt: this.jwt.sign({
          user: {
            id, login, idcompany, typeuser, fullname, use
          }
        }),
        role,
        changePas: 0
      }
    }
  } else {
    reply.code(500).send({ message: "Для данного пользователя ИНН не найден!" });
  }
}

async function signDocHandler(req, reply) {
  let order = req.params.order;
  let id_doc = req.body.id_doc;
  let pin = req.body.pin;
  console.log(req.body)
  let {user_inn, user_form, first_signers } = await this.edsService.getUserInn(req.user.user.id);
  let f_signer = String(first_signers[0]).padStart(14, '0')

  if (user_inn && user_form && pin) {
    let token = await this.edsService.getUserToken(
      user_inn,
      user_form,
      f_signer,
      pin
    );
    if (token.token) {
      let doc = await this.reportsService.getReportById(id_doc);
      console.log('signDocHandler***',doc)
      if (doc.isFound) {
        reply.code(500).send({
          message: "Документ для подписи не найден! Попробуйте еще раз!",
        });
      } else {
        let hash;
        if (order === "1") {
          hash = Buffer.from(JSON.stringify(doc.doc)).toString("base64");
        } else if (order === "2") {
          let postData = {
            doc: doc.doc,
            first_sign: doc.first_sign.sign,
          };

          hash = Buffer.from(JSON.stringify(postData)).toString("base64");
        }
        let res = await this.edsService.getSignReport(token.token, hash);
        if (res.hasOwnProperty("isSuccesfull")) {
          let sign = JSON.stringify(res);
          if (order === "1") {
            await this.edsService.updateFirstSignReport(id_doc, sign, token);

          } else if (order === "2") {
            await this.edsService.updateSecondSignReport(id_doc, sign);
          }
          reply.code(200).send({ message: "Документ успешно подписан!" });
        } else {
          reply.code(500).send({ message: res.errorMessage });
        }
      }
    } else {
      reply.code(500).send({ message: token.errorMessage });
    }
  } else {
    reply.code(500).send({
      message:
        "Для данного пользователя ИНН не найден! Обратитесь в службу поддержки !",
    });
  }
}

async function checkSignReportHandler(req, reply) {
  let order = req.params.order;
  let id_doc = req.body.id_doc;
  let doc = await this.reportsService.getReportById(id_doc);
  if (doc.isFound) {
    reply.code(500).send({
      message: "Документ для проверки не найден! Попробуйте еще раз!",
    });
  } else {
    let postData;
    let hash;
    if (order === "1") {
      hash = Buffer.from(JSON.stringify(doc.doc)).toString("base64");
      postData = {
        signBase64: doc.first_sign.sign,
        hash: hash
      };
    } else if (order === "2") {
      let second_sign_obj = {
        doc: doc.doc,
        first_sign: doc.first_sign.sign,
      };
      hash = Buffer.from(JSON.stringify(second_sign_obj)).toString("base64");
      postData = {
        signBase64: doc.second_sign.sign,
        hash: hash
      
      };
    }
    const res = await this.edsService.checkSignReport(JSON.stringify(postData));
    reply.send({ message: res });
  }
}
