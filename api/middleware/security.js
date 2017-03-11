const appRoot = require('app-root-path');
const helmet = require("helmet");
const session = require('client-sessions');
const randomstring = require("randomstring");
const User = require(appRoot + "/models/userModel");

module.exports = function(app){

    app.use(helmet());
    app.use(session({
        cookieName: 'session',
        secret: randomstring.generate(),
        duration: 30 * 60 * 1000,
        activeDuration: 5 * 60 * 1000,
        httpOnly: true, // dont let browser javascript access cookies ever
        secure: true, //only use cookies over https
        ephemeral: true //delete this cookie when the browser is closed
    }));
    app.use(function(req, res, next) {
        if (req.session && req.session.user) {
            User.findOne({ email: req.session.user.email }, function(err, user) {
            if (user) {
            req.user = user;
            req.user.password = undefined;
            req.session.user = user;  //refresh the session value
         //   res.locals.user = user;
      }
      // finishing processing the middleware and run the route
      next();
    });
  } else {
    next();
  }
});
}