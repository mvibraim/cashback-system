import passport from "passport";
import { BasicStrategy } from "passport-http";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import config from "../../config";
import { Reseller } from "../../api/resellers/model";
import winston from "../winston";

passport.use(
  new BasicStrategy(function (cpf, password, done) {
    winston.info("Authenticating reseller");

    Reseller.findOne({ cpf }).then((reseller) => {
      if (!reseller) {
        done(true);
        return null;
      }

      return reseller
        .authenticate(password)
        .then((reseller) => {
          done(null, reseller);
          return null;
        })
        .catch((err) => {
          done(err);
        });
    });
  })
);

passport.use(
  "jwt",
  new JwtStrategy(
    {
      secretOrKey: config.jwtSecret,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    },
    ({ cpf }, done) => {
      winston.info("Checking JWT");

      Reseller.findOne({ cpf })
        .then((reseller) => {
          done(null, reseller);
          winston.info("Valid JWT");
          return null;
        })
        .catch(done);
    }
  )
);

/* eslint-disable no-unused-vars */
let jwt = ({ required } = {}) => (req, res, next) =>
  passport.authenticate("jwt", { session: false }, (err, reseller, info) => {
    if (err || (required && !reseller)) {
      winston.info(`Error with JWT`);
      return res.status(401).end();
    }

    req.login(reseller, { session: false }, (err) => {
      if (err) {
        winston.info(`Error with JWT`);
        return res.status(401).end();
      }

      next();
    });
  })(req, res, next);

let basic = () => (req, res, next) =>
  passport.authenticate("basic", { session: false }, (err, reseller, info) => {
    if (err || !reseller) {
      winston.info(`Reseller cannot be authenticated`);
      return res.status(401).end();
    }

    req.login(reseller, { session: false }, (err) => {
      if (err) {
        winston.info(`Reseller cannot be authenticated`);
        return res.status(401).end();
      }

      next();
    });
  })(req, res, next);
/* eslint-enable no-unused-vars */

export { basic, jwt };
