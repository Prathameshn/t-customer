// const appzip = require('appmetrics-zipkin')({
//     host: '127.0.0.1',
//     port: 9411,
//     serviceName: 'patient-service',
//     sampleRate: 1.0,
// });
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const compress = require('compression');
const methodOverride = require('method-override');
const cors = require('cors');
const helmet = require('helmet');
const passport = require('passport');
const routes = require('@routes/v1');
const { logs } = require('./vars');
const strategies = require('./passport');
const error = require('@middlewares/error');

/**
* Express instance
* @public
*/
const app = express();

// request logging. dev: console | production: file
app.use(morgan(logs));

app.use(require('request-ip').mw())

// parse body params and attache them to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// gzip compression
app.use(compress());

// lets you use HTTP verbs such as PUT or DELETE
// in places where the client doesn't support it
app.use(methodOverride());

// secure apps by setting various HTTP headers
app.use(helmet());

// enable CORS - Cross Origin Resource Sharing
app.use(cors());

// enable authentication
app.use(passport.initialize());
passport.use('jwt', strategies.jwt);
// passport.use('facebook', strategies.facebook);
// passport.use('google', strategies.google);

// mount api v1 routes
app.use('/v1/customer', routes);

//for kubernetes
app.get('/v1/health',(req,res,next)=>{
    res.status(200).send('OK')
})

// if error is not an instanceOf APIError, convert it.
app.use(error.converter);

// catch 404 and forward to error handler
app.use(error.notFound);

// error handler, send stacktrace only during development
app.use(error.handler);

module.exports = app;
