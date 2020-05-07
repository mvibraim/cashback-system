import passport from "passport";
import { BasicStrategy } from "passport-http";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { databaseConnection } from "../mongo";
import bcrypt from "bcryptjs";

const JWT_SECRET = "qIlXTHBzNMRkVrqGfXWNXI7xPtRBrDDH";

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

        let passwordIsValid = bcrypt
          .compare(password, reseller.password)
          .then((isValid) => isValid);

        if (passwordIsValid) {
          done(null, reseller);
          return null;
        } else {
          done(null, false);
          return null;
        }
      })
      .catch(done);
  })
);

passport.use(
  "jwt",
  new JwtStrategy(
    {
      secretOrKey: JWT_SECRET,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    },
    ({ cpf }, done) => {
      databaseConnection()
        .collection("resellers")
        .findOne({ cpf: cpf })
        .then((reseller) => {
          done(null, reseller);
          return null;
        })
        .catch(done);
    }
  )
);

let jwt = ({ required } = {}) => (req, res, next) =>
  passport.authenticate("jwt", { session: false }, (err, reseller, info) => {
    if (err || (required && !reseller)) {
      return res.status(401).end();
    }

    req.login(reseller, { session: false }, (err) => {
      if (err) return res.status(401).end();
      next();
    });
  })(req, res, next);

let basic = () => (req, res, next) =>
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

export { basic, jwt };
