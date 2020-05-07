import jwt from "jsonwebtoken";
import Promise from "bluebird";

const JWT_SECRET = "qIlXTHBzNMRkVrqGfXWNXI7xPtRBrDDH";

let jwtSign = Promise.promisify(jwt.sign);

let sign = (cpf, options, method = jwtSign) =>
  method({ cpf }, JWT_SECRET, options);

export { sign };
