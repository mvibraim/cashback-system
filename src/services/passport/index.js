import passport from "passport";
import { BasicStrategy } from "passport-http";
import { databaseConnection } from "../mongo";

passport.use(
  new BasicStrategy(function (cpf, password, done) {
    databaseConnection()
      .collection("resellers")
      .findOne({ cpf: cpf })
      .then((reseller) => {
        if (!reseller) {
          done(true);
          return null;
        }

        if (reseller.password != password) {
          done(null, false);
          return null;
        }

        done(null, reseller);
        return null;
      })
      .catch(done);
  })
);

export const basic = () => (req, res, next) =>
  passport.authenticate("basic", { session: false }, (err, reseller, info) => {
    if (err || !reseller) {
      return res.status(401).end();
    }

    req.login(reseller, { session: false }, (err) => {
      if (err) {
        return res.status(401).end();
      }

      next();
    });
  })(req, res, next);
