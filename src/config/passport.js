'use strict'
const passportJWT = require('passport-jwt')
const config = require('@config/vars')
const LoginSession = require('@models/auth/login.session')
const ExtractJwt = passportJWT.ExtractJwt
const JwtStrategy = passportJWT.Strategy

const jwtOptions = {
  secretOrKey: config.jwtSecret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
}

const jwtStrategy = new JwtStrategy(jwtOptions, (jwtPayload, done) => {
  LoginSession.findOne({ token: jwtPayload.token.token }, (err, session) => {
    if (err) {
      return done(err, null)
    }
    if (session && session.logoutTime > new Date()) {
      return done(null, session)
    } else {
      return done(null, false)
    }
  })
})

exports.jwtOptions = jwtOptions
exports.jwt = jwtStrategy
