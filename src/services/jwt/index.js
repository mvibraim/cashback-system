import jwt from "jsonwebtoken";
import Promise from "bluebird";

const jwtSecret = "qIlXTHBzNMRkVrqGfXWNXI7xPtRBrDDH";

const jwtSign = Promise.promisify(jwt.sign);

export const sign = (cpf, options, method = jwtSign) =>
  method({ cpf }, jwtSecret, options);
