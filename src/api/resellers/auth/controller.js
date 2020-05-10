import { sign } from "../../../services/jwt";
import winston from "../../../services/winston";

let auth = ({ user: reseller }, res, next) =>
  sign(reseller.cpf)
    .then((token) => {
      if (token) {
        winston.info("Reseller authenticated successfully");
        res.status(200).json({ token: token });
      }

      return null;
    })
    .catch((err) => {
      winston.info(
        `Reseller cannot be authenticated due to ${err.name}, with message: '${err.message}'`
      );

      next(err);
    });

export { auth };
