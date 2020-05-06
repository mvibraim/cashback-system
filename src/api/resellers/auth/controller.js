import { sign } from "../../../services/jwt";

export const auth = ({ user: reseller }, res, next) =>
  sign(reseller.cpf)
    .then((token) => {
      if (token) {
        res.status(200).json({ token: token });
      }

      return null;
    })
    .catch(next);
