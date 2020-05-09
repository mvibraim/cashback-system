import jwt from "jsonwebtoken";
import Promise from "bluebird";
import config from "../../config";

let jwtSign = Promise.promisify(jwt.sign);

let sign = (cpf, options, method = jwtSign) =>
  method({ cpf }, config.jwtSecret, options);

export { sign };
