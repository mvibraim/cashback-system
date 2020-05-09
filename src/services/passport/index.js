import passport from "passport";
import { BasicStrategy } from "passport-http";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import config from "../../config";
import { Reseller } from "../../api/resellers/model";

passport.use(
  new BasicStrategy(function (cpf, password, done) {
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
        .catch(done);
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
      Reseller.findOne({ cpf })
        .then((reseller) => {
          done(null, reseller);
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
/* eslint-enable no-unused-vars */

export { basic, jwt };
