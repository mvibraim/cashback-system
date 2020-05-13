import jwt from "jsonwebtoken";
import Promise from "bluebird";
import config from "../../config";

let jwtSign = Promise.promisify(jwt.sign);
let jwtVerify = Promise.promisify(jwt.verify);

let sign = (cpf, options, method = jwtSign) =>
  method({ cpf }, config.jwtSecret, options);

let signSync = (cpf, options) => sign(cpf, options, jwt.sign);

let verify = (token) => jwtVerify(token, config.jwtSecret);

export { sign, signSync, verify };
