const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const expressSession = require('express-session');
const passport = require('passport');
const cors = require('cors');
const mongoose = require('mongoose');
const routes = require('./routes/auth');
const secureRoutes = require('./routes/secure-routes');

/// configure mongoose's promise to global promise
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://127.0.0.1:27017/passport-jwt', { useNewUrlParser : true, useUnifiedTopology : true })
    .then(db => {
        console.log('Connected to database');
    })
    .catch(err => {
        console.log(err);
    });

/// Configure isProduction variable
const isProduction = process.env.NODE_ENV === 'production';

/// Intitiate our app
const app = express();

/// Configure our app
app.use(cors());
app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
// app.use(express.static(path.join(__dirname, 'public')));
// app.use(expressSession({secret: 'passport-tutorial', cookie: {maxAge: 6000}, resave: false, saveUninitialized: false }));

require('./auth/auth');

app.use('/', routes);
//We plugin our jwt strategy as a middleware so only verified users can access this route
app.use('/user', passport.authenticate('jwt', { session : false }), secureRoutes );


//Handle errors
// app.use(function(err, req, res, next) {
//     res.status(err.status || 500);
//     res.json({ error : err });
// });


app.listen(8080, (err) => {
    if(err) console.log(err);
    console.log(`Your Server Is Running On 8080`);
});